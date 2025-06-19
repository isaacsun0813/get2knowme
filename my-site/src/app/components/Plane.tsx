'use client'

import { useGLTF } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createPlaneOrientation, clampPitch } from '../utils/orientation'

export default function Plane({ planeRef }: { planeRef: React.RefObject<THREE.Group | null> }) {
  const { scene } = useGLTF('/models/daplane.glb')
  const group = useRef<THREE.Group>(null)

  // Globe parameters (matching actual globe scale)
  const earthRadius = 25
  const flightAltitude = 4 // Higher altitude to avoid clipping through terrain
  const safetyRadius = 26

  // Physics constants
  const maxSpeed = 80 // Much faster maximum speed
  const minSpeed = 0 // Allow complete stop
  const acceleration = 25 // Faster acceleration
  const dragFactor = 2 // Less drag for sustained speed

  // Flight state using refs
  const position = useRef(new THREE.Vector3(0, earthRadius + flightAltitude, 0))
  const speed = useRef(0) // Start completely stationary
  const heading = useRef(0) // Direction around Earth (yaw relative to surface)
  const pitch = useRef(0) // Nose up/down relative to surface

  // Input state
  const keysPressed = useRef<Record<string, boolean>>({})
  


  // Initialize planeRef
  useEffect(() => {
    if (planeRef.current) {
      planeRef.current.position.copy(position.current)
      const initialQuaternion = createPlaneOrientation(position.current, 0, 0)
      planeRef.current.quaternion.copy(initialQuaternion)
      const initialForward = new THREE.Vector3(0, 0, -1)
      initialForward.applyQuaternion(initialQuaternion)
      planeRef.current.userData.forward = initialForward
      planeRef.current.userData.up = position.current.clone().normalize()
      planeRef.current.userData.speed = 0
    }
  }, [])

  // Keyboard event handlers
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keysPressed.current[e.code] = true }
    const up = (e: KeyboardEvent) => { keysPressed.current[e.code] = false }
    
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])



  useFrame((state, delta) => {
    if (!group.current) return

    // Handle throttle controls
    if (keysPressed.current['KeyW']) {
      speed.current += acceleration * delta
    }
    if (keysPressed.current['KeyS']) {
      speed.current -= acceleration * delta
    }

    // Apply drag always
    speed.current -= dragFactor * speed.current * delta

    // Clamp speed between min and max
    speed.current = THREE.MathUtils.clamp(speed.current, minSpeed, maxSpeed)

    // Handle rotation controls with smooth input
    const rotationSpeed = 3.0 // Faster turning for better responsiveness
    const rotationDelta = rotationSpeed * delta

    // Heading controls (A/D and Arrow Left/Right) - turn left/right around Earth
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) {
      heading.current += rotationDelta // Turn left
    }
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) {
      heading.current -= rotationDelta // Turn right
    }

    // Pitch controls (Up/Down arrows) - nose up/down
    if (keysPressed.current['ArrowUp']) {
      pitch.current -= rotationDelta // Nose down
    }
    if (keysPressed.current['ArrowDown']) {
      pitch.current += rotationDelta // Nose up
    }

    // Clamp pitch to 60 degrees (π/3 radians)
    pitch.current = clampPitch(pitch.current, Math.PI)

    // Create plane orientation based on heading and pitch
    const finalQuaternion = createPlaneOrientation(
      position.current,
      heading.current,
      pitch.current
    )

    // Get forward direction from quaternion (for this Blender model, +X is nose direction)
    const forward = new THREE.Vector3(1, 0, 0)
    forward.applyQuaternion(finalQuaternion)

    // Move plane forward along its facing direction (only if moving)
    let movement = new THREE.Vector3()
    if (speed.current > 0.1) {
      movement = forward.clone().multiplyScalar(speed.current * delta)
      position.current.add(movement)
    }

    // Ground collision protection
    const distanceFromCenter = position.current.length()
    if (distanceFromCenter < safetyRadius) {
      // Move craft outward to safety radius
      position.current.normalize().multiplyScalar(safetyRadius)
      
      // Zero any inward velocity by projecting movement onto surface (only if moving)
      if (speed.current > 0.1) {
        const radialDirection = position.current.clone().normalize()
        const radialVelocity = movement.dot(radialDirection)
        if (radialVelocity < 0) {
          // Remove inward component of velocity
          movement.addScaledVector(radialDirection, -radialVelocity)
        }
      }
    }

    // Apply position and rotation to the plane
    group.current.position.copy(position.current)
    group.current.setRotationFromQuaternion(finalQuaternion)


    // Update planeRef for camera (keeping camera interface unchanged)
    if (planeRef.current) {
      planeRef.current.position.copy(position.current)
      planeRef.current.quaternion.copy(finalQuaternion)
      planeRef.current.userData.forward = forward
      planeRef.current.userData.up = position.current.clone().normalize()
      planeRef.current.userData.speed = speed.current
    }
  })

  return <primitive ref={group} object={scene} scale={0.8} />
}

useGLTF.preload('/models/daplane.glb')
