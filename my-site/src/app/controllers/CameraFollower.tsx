'use client'

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'

interface CameraFollowerProps {
  targetRef: React.RefObject<THREE.Object3D | null>
  zoomLevel?: number
}

/**
 * Camera Follower - Maintains consistent visual size across all screens
 * 
 * Strategy:
 * - Calculate base distance from FOV to show desired world height
 * - Scale distance based on viewport height to maintain visual consistency
 * - Simpler = better: one scaling factor based on height
 * 
 * To adjust zoom globally: --camera-distance-multiplier in globals.css
 */
export default function CameraFollower({ targetRef, zoomLevel = 1 }: CameraFollowerProps) {
  const { camera, size } = useThree()
  const baseDistanceRef = useRef(125)
  
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    
    // Standard Three.js responsive pattern
    camera.aspect = size.width / size.height
    camera.updateProjectionMatrix()
    
    // Detect mobile device
    const isMobile = typeof window !== 'undefined' && (
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(navigator.userAgent.toLowerCase()) ||
      ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 768
    )
    
    // Calculate base distance: Earth should fill ~50% of viewport height
    // This gives more context and works better across screen sizes
    const earthRadius = 25
    const earthDiameter = earthRadius * 2 // 50 units
    const targetFillRatio = 0.50 // 50% of viewport height (more zoomed out)
    const targetVisibleHeight = earthDiameter / targetFillRatio // 100 units
    
    const fovRadians = (camera.fov * Math.PI) / 180
    const tanHalfFOV = Math.tan(fovRadians / 2)
    
    // Base distance calculation (works for reference screen)
    const baseDistance = (targetVisibleHeight / 2) / tanHalfFOV
    
    // Scale based on viewport height to maintain visual consistency
    // Reference: 1080px height (standard 1920x1080)
    // Key insight: To maintain same visual size, distance scales with viewport height
    // Smaller screens = proportionally same distance (FOV handles pixel scaling)
    // But we want to zoom OUT more on smaller screens to see more context
    const refHeight = 1080
    const heightRatio = size.height / refHeight
    
    // Scale factor: smaller screens get farther camera (zoom out)
    // For larger screens (like 2050x1500), we want to zoom out more
    // Using a gentler curve that zooms out more for taller screens
    let heightScale
    if (heightRatio > 1.2) {
      // For tall screens (like 1500px+), use a gentler scaling to zoom out more
      heightScale = Math.pow(heightRatio, -0.3) // Gentler inverse scaling
    } else {
      // For standard screens, use inverse square root
      heightScale = Math.pow(heightRatio, -0.5) // Inverse square root
    }
    let distance = baseDistance * heightScale
    
    // Mobile-specific zoom out: zoom out 30% more on mobile devices
    if (isMobile) {
      distance *= 1.3
    }
    
    // Aspect ratio adjustment: wider screens see more horizontally
    // More aggressive zoom out for ultrawide screens
    const refAspect = 1920 / 1080 // 1.778 (16:9)
    const currentAspect = size.width / size.height
    const aspectDeviation = (currentAspect / refAspect) - 1.0
    
    // Adjust for aspect ratio differences
    if (Math.abs(aspectDeviation) > 0.1) {
      // Ultrawide (positive deviation, like 2560x1080 = 2.37:1) = zoom out more
      // Tall/narrow (negative deviation) = zoom in slightly
      if (aspectDeviation > 0) {
        // Ultrawide: more aggressive zoom out
        const aspectScale = 1.0 - (aspectDeviation * 0.25) // Increased from 0.15 to 0.25
        distance *= aspectScale
      } else {
        // Tall screens: slight zoom in
        const aspectScale = 1.0 - (aspectDeviation * 0.15)
        distance *= aspectScale
      }
    }
    
    // Apply CSS multiplier for global fine-tuning
    const cssMultiplier = typeof window !== 'undefined'
      ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--camera-distance-multiplier') || '1.0')
      : 1.0
    
    baseDistanceRef.current = distance * cssMultiplier
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Camera Debug:', {
        screen: `${size.width}x${size.height}`,
        aspect: (size.width / size.height).toFixed(2),
        heightRatio: heightRatio.toFixed(3),
        heightScale: heightScale.toFixed(3),
        aspectDeviation: aspectDeviation.toFixed(3),
        baseDistance: baseDistance.toFixed(1),
        scaledDistance: distance.toFixed(1),
        cssMultiplier: cssMultiplier.toFixed(2),
        finalDistance: baseDistanceRef.current.toFixed(1)
      })
    }
  }, [camera, size.width, size.height])
  
  useFrame(() => {
    const target = targetRef.current
    if (!target) return

    const planePosition = target.position
    const earthCenter = new THREE.Vector3(0, 0, 0)
    
    // Drop-in animation
    const dropInProgress = (target.userData.dropInProgress as number) ?? 1
    const isDroppingIn = dropInProgress < 1
    
    let viewDistance = baseDistanceRef.current
    
    if (isDroppingIn) {
      const startZoom = 1.3
      const zoomOutProgress = dropInProgress
      const currentZoom = startZoom + (1 - startZoom) * zoomOutProgress
      viewDistance = viewDistance / currentZoom
    }
    
    // Browser zoom level
    const zoomMultiplier = Math.pow(zoomLevel, 1.5)
    viewDistance = viewDistance / zoomMultiplier
    
    // Camera position: OVER the plane (overhead view)
    // Position camera from Earth center outward along plane's position direction
    const planeDirection = planePosition.clone().normalize()
    const cameraPosition = earthCenter.clone()
    cameraPosition.add(planeDirection.clone().multiplyScalar(viewDistance))
    
    // Height offset to position camera above the plane (not at same distance from center)
    // This ensures we're looking DOWN at the plane
    const heightOffset = 10 / zoomMultiplier
    cameraPosition.add(planeDirection.clone().multiplyScalar(heightOffset))
    
    // Smooth camera movement - faster lerp for more responsive following
    const lerpSpeed = isDroppingIn ? 0.2 : 0.15 // Increased from 0.08 to 0.15 for better responsiveness
    camera.position.lerp(cameraPosition, lerpSpeed)
    
    // Look at plane position (keeps plane centered)
    camera.lookAt(planePosition)
    camera.up.set(0, 1, 0)
  })

  return null
}
