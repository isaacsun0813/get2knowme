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
    
    // ORBITAL VIEW: Position camera to see Earth and plane nicely
    const earthCenter = new THREE.Vector3(0, 0, 0)
    const earthRadius = 25
    
    // Check if plane is dropping in - start zoomed in, then zoom out
    const dropInProgress = (target.userData.dropInProgress as number) ?? 1
    const isDroppingIn = dropInProgress < 1
    
    // Camera distance adjustments based on zoom level
    // Increased base distance to see more of the globe
    let baseViewDistance = earthRadius * 10.0  // 125 units back (increased from 87.5)
    
    // During drop-in: start slightly closer, zoom out as plane drops
    if (isDroppingIn) {
      // Start at 1.3x closer (less aggressive), zoom out to normal distance
      const startZoom = 1.3 // Start 1.3x closer (reduced from 1.5)
      const zoomOutProgress = dropInProgress // 0 = start, 1 = end
      const currentZoom = startZoom + (1 - startZoom) * zoomOutProgress
      baseViewDistance = baseViewDistance / currentZoom
    }
    
    // Apply zoom scaling (less aggressive)
    // When zoomed in (zoomLevel > 1): camera gets closer
    // When zoomed out (zoomLevel < 1): camera goes further
    const zoomMultiplier = Math.pow(zoomLevel, 1.5) // Less aggressive than squared
    const viewDistance = baseViewDistance / zoomMultiplier
    
    // Also adjust height offset dramatically
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