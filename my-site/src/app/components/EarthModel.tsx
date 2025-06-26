'use client'

import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

interface EarthModelProps {
  onSceneReady?: (scene: THREE.Group) => void
  [key: string]: any
}

export default function EarthModel(props: EarthModelProps) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/models/sickEarthFile2.glb')
  const { actions, mixer } = useAnimations(animations, group)
  
  // Make clouds a greyish white for better visibility
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.material) {
        // Check if it's likely a cloud material (usually white/light colored)
        if (child.material.color && (
          child.material.color.r > 0.8 && 
          child.material.color.g > 0.8 && 
          child.material.color.b > 0.8
        )) {
          // Set clouds to bright white for natural wispy cloud appearance
          child.material.color.setRGB(1.0, 1.0, 1.0)
          // Add slight emissive glow to make clouds appear brighter/whiter
          child.material.emissive = new THREE.Color(0.15, 0.15, 0.15)
        }
        child.material.needsUpdate = true
      }
    }
  })
  
  scene.userData = { isEarth: true }
  scene.name = 'Earth'
  
  // Play all animations automatically (simplified)
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      Object.values(actions).forEach(action => {
        if (action) {
          action.reset()
          action.setLoop(THREE.LoopRepeat, Infinity)
          action.play()
        }
      })
    }
  }, [actions])

  // Notify parent when scene is ready for landmark detection
  useEffect(() => {
    console.log('🎬 Model scene ready, calling onSceneReady...', scene ? 'Scene exists' : 'No scene')
    if (props.onSceneReady && scene) {
      console.log('📞 Calling onSceneReady with scene')
      props.onSceneReady(scene)
    }
  }, [scene, props.onSceneReady])
  
  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  )
} 