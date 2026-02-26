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
    
    // Detect small iPhone devices (iPhone SE, iPhone 12 mini, etc.)
    // Small iPhones will have width < 400px or height < 900px
    const isSmalliPhone = typeof window !== 'undefined' && isMobile && (
      window.innerWidth < 400 || window.innerHeight < 900
    )
    
    // Calculate base distance: Earth should fill ~45% of viewport height
    // More zoomed out for better context
    const earthRadius = 25
    const earthDiameter = earthRadius * 2 // 50 units
    const targetFillRatio = 0.45 // 45% of viewport height (more zoomed out)
    const targetVisibleHeight = earthDiameter / targetFillRatio // ~111 units
    
    const fovRadians = (camera.fov * Math.PI) / 180
    const tanHalfFOV = Math.tan(fovRadians / 2)
    
    // Base distance calculation (works for reference screen)
    const baseDistance = (targetVisibleHeight / 2) / tanHalfFOV
    
    // Scale based on viewport height
    // Reference: 1080px height (standard 1920x1080)
    // Larger screens should zoom OUT more to see more of the scene
    const refHeight = 1080
    const heightRatio = size.height / refHeight
    
    // Scale factor: larger screens = farther camera (zoom out more)
    // For 4K (2160px): heightRatio = 2.0 → should zoom out significantly
    let heightScale
    if (heightRatio > 1.5) {
      // Very tall screens (4K, etc): zoom out much more
      heightScale = Math.pow(heightRatio, 0.7) // Aggressive zoom out
    } else if (heightRatio > 1.0) {
      // Moderately tall screens: moderate zoom out
      heightScale = 1.0 + (heightRatio - 1.0) * 0.6
    } else {
      // Smaller screens: still zoom out slightly
      heightScale = 1.0 + (1.0 - heightRatio) * 0.2
    }
    let distance = baseDistance * heightScale
    
    // Mobile-specific zoom out: zoom out more on mobile devices
    if (isMobile) {
      distance *= 1.3 // 30% zoom out for all mobile
    }
    
    // Extra zoom out for small iPhones: additional 40% zoom out
    if (isSmalliPhone) {
      distance *= 1.4 // Total: 1.3 * 1.4 = 1.82x zoom out (82% more zoomed out)
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
