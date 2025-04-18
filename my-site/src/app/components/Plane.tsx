'use client'

import { useGLTF, useAnimations } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Plane({ planeRef }: { planeRef: React.RefObject<THREE.Group | null> }) {
  // Load model + animation
  const { scene, animations } = useGLTF('/models/daplane.glb')
  const group = useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, group)

  // Flight parameters
  const velocity = useRef(0)          // Current speed
  const maxVelocity = 0.03            // Max speed
  const minVelocity = 0               // Min speed
  const acceleration = 0.001          // Acceleration rate
  const deceleration = 0.0005         // Natural deceleration
  const turnRate = 0.03               // How quickly the plane turns
  const bankAngle = useRef(0)         // Banking angle for turns
  const heading = useRef(0)           // Direction the plane is facing (0 = east, Math.PI/2 = north)
  const keysPressed = useRef<Record<string, boolean>>({})
  
  // Global position (for Earth rotation)
  const position = useRef(new THREE.Vector3(0, 0, 0))
  
  // Play animation when model is loaded
  useEffect(() => {
    if (actions && actions['Take 001']) {
      actions['Take 001'].play()
    }
  }, [actions])

  // Initialize plane position
  useEffect(() => {
    if (group.current) {
      // Position the plane in the scene (fixed position relative to camera)
      group.current.position.set(0, -0.5, -2)
      // Scale the plane down
      group.current.scale.set(0.1, 0.1, 0.1)
    }
  }, [])

  // Set up keyboard controls
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true
    }
    const up = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Update the flight dynamics
  useFrame(() => {
    if (!group.current) return
    
    // Handle turning with A/D
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) {
      // Turn left (rotate the plane)
      heading.current += turnRate
      
      // Bank into turn (left)
      bankAngle.current = Math.min(bankAngle.current + 0.02, 0.3)
    } else if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) {
      // Turn right (rotate the plane)
      heading.current -= turnRate
      
      // Bank into turn (right)
      bankAngle.current = Math.max(bankAngle.current - 0.02, -0.3)
    } else {
      // Return to level flight
      bankAngle.current *= 0.9
    }
    
    // Apply bank angle to the plane model
    group.current.rotation.z = bankAngle.current
    
    // Apply heading to the plane model (rotate around Y axis)
    group.current.rotation.y = heading.current
    
    // Handle speed with W/S
    if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) {
      velocity.current = Math.min(velocity.current + acceleration, maxVelocity)
    } else if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) {
      velocity.current = Math.max(velocity.current - acceleration * 1.5, minVelocity)
    } else {
      // Natural deceleration
      velocity.current = Math.max(velocity.current - deceleration, minVelocity)
    }
    
    // Move in the direction the plane is facing
    // Calculate movement vector based on plane's heading
    const moveX = Math.sin(heading.current) * velocity.current
    const moveZ = Math.cos(heading.current) * velocity.current
    
    // Update global position (this will be used to rotate the Earth)
    position.current.x += moveX
    position.current.z += moveZ
    
    // Check if the planeRef exists and update it
    if (planeRef.current) {
      // Pass along position and heading for Earth rotation
      planeRef.current.position.copy(position.current)
      planeRef.current.rotation.y = heading.current
    }
  })

  // Return the plane model with appropriate scale
  return <primitive ref={group} object={scene} scale={0.1} />
}

useGLTF.preload('/models/daplane.glb')