'use client'

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'

interface CameraFollowerProps {
  targetRef: React.RefObject<THREE.Object3D | null>
  zoomLevel?: number
}

// ============================================================================
// SIMPLE CAMERA CONFIGURATION
// ============================================================================
// 
// TO ADJUST ZOOM (Earth closer/farther):
// 1. Open your browser DevTools (F12) and go to Elements tab
// 2. Find the <html> element and add this inline style:
//    style="--camera-distance-multiplier: 1.2"
// 3. Adjust the value:
//    - 1.0 = normal distance
//    - 1.2 = 20% farther (Earth smaller)
//    - 0.8 = 20% closer (Earth bigger)
// 4. Once you find a good value, update it in globals.css
//
// The camera automatically scales for different screen sizes and aspect ratios.
// ============================================================================

const CAMERA_CONFIG = {
  // Enable debug logging (set to false to disable console logs)
  DEBUG: false,
  
  // Debounce delay for resize events
  RESIZE_DEBOUNCE_MS: 150
}

export default function CameraFollower({ targetRef, zoomLevel = 1 }: CameraFollowerProps) {
  const { camera, size } = useThree()
  const optimalDistanceRef = useRef(125)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Calculate optimal camera distance based on viewport size and aspect ratio
  // Simple and responsive - adjusts automatically for all screen sizes
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    
    // Clear any pending resize timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    
    // Debounce resize events
    resizeTimeoutRef.current = setTimeout(() => {
      const earthRadius = 25
      const fov = camera.fov // 50 degrees (vertical FOV)
      const aspect = size.width / size.height
      
      // Reference viewport (1920x1080 = 16:9 standard)
      const refWidth = 1920
      const refHeight = 1080
      
      // Calculate base distance using FOV
      // Target: Earth should fill ~70% of viewport height
      const vFOV = (fov * Math.PI) / 180
      const tanHalfFOV = Math.tan(vFOV / 2)
      let baseDistance = (earthRadius * 2) / (2 * tanHalfFOV * 0.70)
      
      // TRULY RESPONSIVE: Area-based scaling with aspect ratio adjustment
      // Prevents compounding when both width and height are larger
      // Tunable via CSS variables for easy adjustment
      // Note: CSS variables for widthPower, heightPower, widthSensitivity, heightSensitivity
      // are available but not currently used in the calculation
      
      // AREA-BASED SCALING: Use screen area as primary scaling factor
      // This prevents compounding when both width and height are larger
      // Larger screens (more area) = zoom OUT (farther camera = Earth smaller)
      // Smaller screens (less area) = zoom OUT MORE (farther camera = Earth smaller)
      const refArea = refWidth * refHeight
      const currentArea = size.width * size.height
      // Use refArea / currentArea: smaller screens get > 1 multiplier (zoom out more)
      const areaRatio = refArea / currentArea // > 1 for smaller screens, < 1 for larger
      
      // GENTLE CURVE: Screens close to reference get minimal or NO adjustment
      // Only screens MUCH smaller or MUCH larger get significant zoom changes
      // This prevents over-adjustment for screens like 1905×992 (close to 1920×1080)
      const deviation = areaRatio - 1.0 // 0 at reference, positive for smaller, negative for larger
      
      // Apply smooth curve: very gentle near reference, more aggressive at extremes
      let areaMultiplier = 1.0
      if (Math.abs(deviation) < 0.15) {
        // Screens within 15% of reference: Zoom IN slightly (Earth bigger)
        // For 1905×992: deviation = 0.097, multiplier = 1.0 - 0.097 * 0.3 = 0.97 (3% zoom in)
        areaMultiplier = 1.0 - Math.abs(deviation) * 0.3 // More zoom IN for screens close to reference
      } else if (deviation > 0) {
        // Much smaller screens: zoom OUT (multiplier > 1)
        // For 1497×857: deviation = 0.62, excess = 0.47
        // Need MORE zoom-out: multiplier should be ~1.25-1.30 (25-30% zoom out)
        const excess = deviation - 0.15
        // Increased coefficient for more aggressive zoom-out on smaller screens
        // For 1497×857: excess = 0.466, 0.466^0.7 = 0.36
        // 0.985 base + 0.36 * 1.1 = 0.985 + 0.396 = 1.381 (38% zoom out)
        areaMultiplier = 1.0 - 0.15 * 0.1 + Math.pow(excess, 0.7) * 1.1
      } else {
        // Much larger screens: zoom IN slightly (multiplier < 1)
        // For 3440×1440: deviation = -1.39, excess = 1.24, multiplier = 0.985 - 1.24^0.8 * 0.15 = 0.78
        const excess = Math.abs(deviation) - 0.15
        areaMultiplier = 1.0 - 0.15 * 0.1 - Math.pow(excess, 0.8) * 0.15
      }
      
      baseDistance *= areaMultiplier
      
      // ASPECT RATIO ADJUSTMENT: Fine-tune based on shape (not size)
      // Only apply significant adjustment for screens far from reference
      // Screens close to reference should have minimal aspect adjustment
      const refAspect = refWidth / refHeight // 1.778 (16:9)
      const aspectRatio = aspect / refAspect // Compared to 16:9
      const aspectDeviation = Math.abs(aspectRatio - 1.0) // How far from 16:9
      
      // Only apply aspect adjustment if significantly different from 16:9
      let aspectMultiplier = 1.0
      if (aspectDeviation > 0.2) {
        // Significantly different aspect ratio: apply adjustment
        // Ultrawide (aspectRatio > 1.2) = slight zoom IN (Earth bigger)
        // Taller/narrower (aspectRatio < 0.8) = zoom OUT (Earth smaller)
        aspectMultiplier = Math.pow(aspectRatio, -0.15) // Negative = ultrawide zooms in slightly
      } else {
        // Close to 16:9: minimal or no adjustment
        // For 1905×992: aspectRatio = 1.08, deviation = 0.08, no adjustment
        aspectMultiplier = 1.0
      }
      
      baseDistance *= aspectMultiplier
      
      // Get user adjustment from CSS variable (allows fine-tuning)
      const baseCssMultiplier = typeof window !== 'undefined' 
        ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--camera-distance-multiplier') || '1.0')
        : 1.0
      
      optimalDistanceRef.current = baseDistance * baseCssMultiplier
      
      // DEBUG: Log camera info
      if (CAMERA_CONFIG.DEBUG) {
        console.log('=== CAMERA DEBUG ===')
        console.log('Screen:', `${size.width}x${size.height}`, `(${aspect.toFixed(2)}:1)`)
        console.log('Base distance:', baseDistance.toFixed(1))
        console.log('CSS multiplier:', baseCssMultiplier.toFixed(2))
        console.log('Final distance:', optimalDistanceRef.current.toFixed(1))
        console.log('===================')
      }
    }, CAMERA_CONFIG.RESIZE_DEBOUNCE_MS)
    
    // Cleanup timeout on unmount
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [camera, size.width, size.height])
  
  useFrame(() => {
    const target = targetRef.current
    if (!target) return

    const planePosition = target.position
    
    // ORBITAL VIEW: Position camera to see Earth and plane nicely
    const earthCenter = new THREE.Vector3(0, 0, 0)
    
    // Check if plane is dropping in - start zoomed in, then zoom out
    const dropInProgress = (target.userData.dropInProgress as number) ?? 1
    const isDroppingIn = dropInProgress < 1
    
    // Use the calculated optimal distance that adapts to viewport size and aspect ratio
    // This ensures Earth fills the screen on all monitor types
    let baseViewDistance = optimalDistanceRef.current
    
    // During drop-in: start slightly closer, zoom out as plane drops
    if (isDroppingIn) {
      // Start at 1.3x closer (less aggressive), zoom out to normal distance
      const startZoom = 1.3 // Start 1.3x closer (reduced from 1.5)
      const zoomOutProgress = dropInProgress // 0 = start, 1 = end
      const currentZoom = startZoom + (1 - startZoom) * zoomOutProgress
      baseViewDistance = baseViewDistance / currentZoom
    }
    
    // Apply browser zoom scaling (less aggressive)
    // When zoomed in (zoomLevel > 1): camera gets closer
    // When zoomed out (zoomLevel < 1): camera goes further
    const zoomMultiplier = Math.pow(zoomLevel, 1.5) // Less aggressive than squared
    const viewDistance = baseViewDistance / zoomMultiplier
    
    // Also adjust height offset based on zoom
    const baseHeightOffset = 10
    const heightOffset = baseHeightOffset / zoomMultiplier
    
    // Position camera behind the plane's orbital position
    const planeDirection = planePosition.clone().normalize()
    const cameraPosition = earthCenter.clone()
    cameraPosition.add(planeDirection.clone().multiplyScalar(viewDistance))
    cameraPosition.add(planeDirection.clone().multiplyScalar(heightOffset))
    
    // Smoothly move camera (faster during drop-in for more responsive feel)
    const lerpSpeed = isDroppingIn ? 0.15 : 0.08
    camera.position.lerp(cameraPosition, lerpSpeed)
    
    // Always look at the plane (Earth will be beautifully framed)
    camera.lookAt(planePosition)
    
    // Keep camera oriented correctly
    camera.up.set(0, 1, 0)
  })

  return null
}