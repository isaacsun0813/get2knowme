'use client'

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraFollowerProps {
  targetRef: React.RefObject<THREE.Object3D | null>
  zoomLevel?: number
}

export default function CameraFollower({ targetRef, zoomLevel = 1 }: CameraFollowerProps) {
  const { camera } = useThree()
  
  useFrame(() => {
    const target = targetRef.current
    if (!target) return

    const planePosition = target.position
    const forward = target.userData.forward as THREE.Vector3
    
    if (!forward) return

    // ORBITAL VIEW: Position camera to see Earth and plane nicely
    const earthCenter = new THREE.Vector3(0, 0, 0)
    const earthRadius = 25
    
    // Camera distance adjustments based on zoom level
    // Make much more dramatic changes for noticeable zoom effect
    const baseViewDistance = earthRadius * 3.5  // 87.5 units back (original distance)
    
    // Apply more aggressive zoom scaling
    // When zoomed in (zoomLevel > 1): camera gets MUCH closer
    // When zoomed out (zoomLevel < 1): camera goes MUCH further
    const zoomMultiplier = Math.pow(zoomLevel, 2) // Square the zoom for more dramatic effect
    const viewDistance = baseViewDistance / zoomMultiplier
    
    // Also adjust height offset dramatically
    const baseHeightOffset = 10
    const heightOffset = baseHeightOffset / zoomMultiplier
    
    console.log('📹 Camera zoom adjustment:', {
      zoomLevel,
      zoomMultiplier,
      viewDistance,
      heightOffset,
      baseViewDistance
    })
    
    // Position camera behind the plane's orbital position
    const planeDirection = planePosition.clone().normalize()
    const cameraPosition = earthCenter.clone()
    cameraPosition.add(planeDirection.clone().multiplyScalar(viewDistance))
    cameraPosition.add(planeDirection.clone().multiplyScalar(heightOffset))
    
    // Smoothly move camera (slightly faster for more responsive zoom)
    camera.position.lerp(cameraPosition, 0.08)
    
    // Always look at the plane (Earth will be beautifully framed)
    camera.lookAt(planePosition)
    
    // Keep camera oriented correctly
    camera.up.set(0, 1, 0)
  })

  return null
}