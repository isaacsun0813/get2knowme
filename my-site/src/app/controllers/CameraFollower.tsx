'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function CameraFollower({ targetRef }: { targetRef: React.RefObject<THREE.Object3D | null> }) {
  const { camera, scene } = useThree()
  const earthRef = useRef<THREE.Object3D | null>(null)
  const lastPosition = useRef(new THREE.Vector3(0, 0, 0))
  
  // Find Earth model
  useFrame((state) => {
    if (!earthRef.current) {
      state.scene.traverse(obj => {
        if (obj.name === 'Earth' || (obj.userData && obj.userData.isEarth)) {
          earthRef.current = obj
        }
      })
    }
    
    const target = targetRef.current
    if (!target || !earthRef.current) return
    
    // Get the plane's position change since last frame
    const deltaX = target.position.x - lastPosition.current.x
    const deltaZ = target.position.z - lastPosition.current.z
    
    // Only rotate if there's movement
    // if (Math.abs(deltaX) > 0.0001 || Math.abs(deltaZ) > 0.0001) {
    //   // Rotate Earth in the opposite direction of the plane's movement
    //   // This creates the illusion that the plane is moving over the Earth
      
    //   // X movement (east/west) affects rotation around Y axis
    //   earthRef.current.rotation.y += deltaX * 0.5
      
    //   // Z movement (north/south) affects rotation around X axis
    //   earthRef.current.rotation.x -= deltaZ * 0.5
    // }
    if (Math.abs(deltaX)>0.0001){
        console.log("The earth ref is ", earthRef.current)
        earthRef.current.rotation.y += deltaX * 0.5
    } 
    else if (Math.abs(deltaZ)>0.0001){
        earthRef.current.rotation.x -= deltaZ * 0.5
    }
    
    // Store current position for next frame
    lastPosition.current.copy(target.position)
  })
  
  return null
}