'use client'

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function CameraFollower({ targetRef }: { targetRef: React.RefObject<THREE.Object3D | null> }) {
  const { camera } = useThree()
  
  useFrame(() => {
    const target = targetRef.current
    if (!target) return

    const planePosition = target.position
    const forward = target.userData.forward as THREE.Vector3
    
    if (!forward) return

    // FULL EARTH VIEW: Position camera to see entire planet
    const earthCenter = new THREE.Vector3(0, 0, 0)
    const earthRadius = 25
    
    // Camera distance to see full Earth plus some margin
    const viewDistance = earthRadius * 3.5  // 87.5 units back
    const heightOffset = 10
    
    // Position camera behind the plane's orbital position
    const planeDirection = planePosition.clone().normalize()
    const cameraPosition = earthCenter.clone()
    cameraPosition.add(planeDirection.clone().multiplyScalar(viewDistance))
    cameraPosition.add(planeDirection.clone().multiplyScalar(heightOffset))
    
    // Smoothly move camera
    camera.position.lerp(cameraPosition, 0.05)
    
    // Always look at the plane (Earth will be beautifully framed)
    camera.lookAt(planePosition)
    
    // Keep camera oriented correctly
    camera.up.set(0, 1, 0)
  })

  return null
}