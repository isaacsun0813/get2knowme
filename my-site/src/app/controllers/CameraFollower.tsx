'use client'

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'

interface CameraFollowerProps {
  targetRef: React.RefObject<THREE.Object3D | null>
  zoomLevel?: number
}

// ============================================================================
// CAMERA SCALING CONFIGURATION - ADJUST THESE VALUES TO TUNE FOR DIFFERENT SCREENS
// ============================================================================
//
// HOW TO USE:
// -----------
// 1. Open your browser console (F12) to see debug logs with current values
// 2. Test on each of your screens and note the "Final scale" value that looks good
// 3. Adjust the values below based on these scenarios:
//
// SCENARIO: Small screen is zoomed in too much (too close)
//   → Increase HEIGHT_SCALE_POWER (try 0.4 or 0.5)
//   → Increase SMALL_SCREEN_BOOST_MULTIPLIER (try 0.7 or 0.8)
//   → Increase MAX_SCALE (try 3.0 or 3.5)
//
// SCENARIO: Large screen is zoomed out too much (too far)
//   → Decrease MIN_SCALE (try 0.5 or 0.6)
//   → Decrease EARTH_FILL_RATIO (try 0.85 or 0.82)
//
// SCENARIO: Want Earth to fill more/less of the screen overall
//   → Increase EARTH_FILL_RATIO (0.9-0.95) = Earth fills more = camera closer
//   → Decrease EARTH_FILL_RATIO (0.8-0.85) = Earth fills less = camera further
//
// TIP: Make small adjustments (0.05-0.1 increments) and test frequently
// ============================================================================

const CAMERA_CONFIG = {
  // Reference viewport (the "baseline" screen size)
  // This is what we consider "normal" - adjust if your main monitor is different
  REFERENCE_WIDTH: 1920,
  REFERENCE_HEIGHT: 1080,
  
  // How much of the viewport should Earth fill (0.0 to 1.0)
  // Higher = Earth fills more screen = camera closer
  // Lower = Earth fills less screen = camera further back
  EARTH_FILL_RATIO: 0.88,
  
  // Height scaling power (how aggressively we scale based on screen height)
  // Lower value (e.g., 0.2) = MORE aggressive scaling (small screens zoom out more)
  // Higher value (e.g., 0.5) = LESS aggressive scaling (small screens zoom out less)
  // Range: 0.1 to 0.8 recommended
  HEIGHT_SCALE_POWER: 0.4,
  
  // Small screen boost multiplier
  // How much extra push-back to give screens smaller than reference
  // Higher = small screens zoom out more
  // Formula: boost = (referenceHeight - currentHeight) / referenceHeight * MULTIPLIER
  // This is ADDED to the heightScale (not multiplied) for more predictable tuning
  // Try values between 1.0 and 5.0 - start with 2.0 and adjust
  SMALL_SCREEN_BOOST_MULTIPLIER: 12.0,
  
  // Aspect ratio adjustment power
  // How much to adjust for ultrawide vs tall screens
  // Lower = less adjustment, Higher = more adjustment
  // Range: 0.1 to 0.5 recommended
  ASPECT_ADJUSTMENT_POWER: 0.2,
  
  // Final scale clamping (min and max)
  // Prevents camera from going too close or too far
  // MIN: minimum scale (lower = allows camera closer on large screens)
  // MAX: maximum scale (higher = allows camera further on small screens)
  // NOTE: If small screens still zoomed in, increase MAX_SCALE significantly
  MIN_SCALE: 0.7,
  MAX_SCALE: 10.0, // Increased to allow much more zoom-out on small screens
  
  // Enable debug logging (set to false to disable console logs)
  DEBUG: true,
  
  // Debounce delay for resize events (prevents recalculation when dev tools open)
  // Higher = less frequent recalculations, smoother but less responsive
  // Lower = more frequent recalculations, more responsive but can be janky
  RESIZE_DEBOUNCE_MS: 150,
  
  // QUICK FIX: If small screen is still wrong, try these adjustments:
  // - If too zoomed IN: Increase SMALL_SCREEN_BOOST_MULTIPLIER (try 3.0, 4.0, 5.0)
  // - If too zoomed OUT: Decrease SMALL_SCREEN_BOOST_MULTIPLIER (try 1.0, 0.5)
  // - Or adjust HEIGHT_SCALE_POWER: Lower (0.2) = more aggressive, Higher (0.5) = less aggressive
}

export default function CameraFollower({ targetRef, zoomLevel = 1 }: CameraFollowerProps) {
  const { camera, size } = useThree()
  const optimalDistanceRef = useRef(125)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Calculate optimal camera distance based on viewport dimensions, aspect ratio, and screen size
  // Uses a reference viewport and scales appropriately for different monitor sizes
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    
    // Clear any pending resize timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    
    // Debounce resize events to prevent recalculation when dev tools open
    resizeTimeoutRef.current = setTimeout(() => {
      const earthRadius = 25
      const earthDiameter = earthRadius * 2 // 50 units
      const fov = camera.fov // 50 degrees (vertical FOV)
      const aspect = size.width / size.height
      
      // Reference viewport (baseline screen size)
      const referenceWidth = CAMERA_CONFIG.REFERENCE_WIDTH
      const referenceHeight = CAMERA_CONFIG.REFERENCE_HEIGHT
      const referenceAspect = referenceWidth / referenceHeight
      
      // Current viewport metrics
      const currentAspect = aspect
      
      // Calculate base distance for reference viewport using trigonometry
      // This gives us the "ideal" distance for the reference monitor
      const vFOV = (fov * Math.PI) / 180
      const tanHalfFOV = Math.tan(vFOV / 2)
      const referenceDistance = earthDiameter / (CAMERA_CONFIG.EARTH_FILL_RATIO * 2 * tanHalfFOV)
      
      // Scale based on viewport HEIGHT (more direct relationship to vertical FOV)
      // Smaller screens (less height) need camera FURTHER back to avoid zooming in too much
      // Larger screens (more height) can have camera closer
      // INVERT the ratio: smaller height = larger scale (further camera)
      const heightRatio = referenceHeight / size.height
      
      // Apply height scaling with configurable power
      let heightScale = Math.pow(heightRatio, CAMERA_CONFIG.HEIGHT_SCALE_POWER)
      
      // Additional boost for very small screens to push camera further back
      // This is ADDED to the scale (not multiplied) for more predictable results
      let smallScreenBoost = 0
      if (size.height < referenceHeight) {
        // Calculate how much smaller the screen is (as a ratio)
        const heightDifference = (referenceHeight - size.height) / referenceHeight
        // Apply boost: the smaller the screen, the more boost
        smallScreenBoost = heightDifference * CAMERA_CONFIG.SMALL_SCREEN_BOOST_MULTIPLIER
        heightScale = heightScale + smallScreenBoost
      }
      
      // Adjust for aspect ratio separately
      // Ultrawide (21:9) needs slightly closer camera
      // Tall/portrait needs slightly further camera  
      const aspectRatio = currentAspect / referenceAspect
      const aspectAdjustment = Math.pow(aspectRatio, CAMERA_CONFIG.ASPECT_ADJUSTMENT_POWER)
      
      // Combine adjustments and clamp to prevent extreme values
      const unclampedScale = heightScale * aspectAdjustment
      const finalScale = Math.max(
        CAMERA_CONFIG.MIN_SCALE, 
        Math.min(CAMERA_CONFIG.MAX_SCALE, unclampedScale)
      )
      
      optimalDistanceRef.current = referenceDistance * finalScale
      
      // DEBUG: Console log all key values for testing on different screens
      if (CAMERA_CONFIG.DEBUG) {
        const wasClamped = unclampedScale !== finalScale
        const clampDirection = unclampedScale > CAMERA_CONFIG.MAX_SCALE ? 'MAX' : 
                                unclampedScale < CAMERA_CONFIG.MIN_SCALE ? 'MIN' : 'NONE'
        
        console.log('=== CAMERA SCALING DEBUG ===')
        console.log('Screen dimensions:', `${size.width}x${size.height}`)
        console.log('Aspect ratio:', currentAspect.toFixed(3))
        console.log('Height ratio (ref/current):', heightRatio.toFixed(3))
        console.log('Height scale (before boost):', Math.pow(heightRatio, CAMERA_CONFIG.HEIGHT_SCALE_POWER).toFixed(3))
        console.log('Small screen boost:', smallScreenBoost.toFixed(3))
        console.log('Height scale (after boost):', heightScale.toFixed(3))
        console.log('Aspect adjustment:', aspectAdjustment.toFixed(3))
        console.log('Unclamped scale:', unclampedScale.toFixed(3))
        console.log('Final scale (clamped):', finalScale.toFixed(3))
        if (wasClamped) {
          console.warn(`⚠️ SCALE WAS CLAMPED AT ${clampDirection} LIMIT (${clampDirection === 'MAX' ? CAMERA_CONFIG.MAX_SCALE : CAMERA_CONFIG.MIN_SCALE})`)
          console.warn(`   Increase ${clampDirection === 'MAX' ? 'MAX_SCALE' : 'MIN_SCALE'} if you need more range`)
        }
        console.log('Reference distance:', referenceDistance.toFixed(2))
        console.log('Optimal distance:', optimalDistanceRef.current.toFixed(2))
        console.log('===========================')
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
    const earthRadius = 25
    
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