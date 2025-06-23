'use client'

import { useGLTF, useAnimations } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Plane({ planeRef }: { planeRef: React.RefObject<THREE.Group | null> }) {
  const { scene, animations } = useGLTF('/models/newPlane.glb')
  const group = useRef<THREE.Group>(null)
  
  // Animation setup
  const { actions } = useAnimations(animations, group)

  // Globe parameters
  const earthRadius = 25
  const flightAltitude = 4
  
  // Physics constants
  const maxSpeed = 60
  const acceleration = 20
  const dragFactor = 2.5

  // Flight state - using quaternion-based orientation instead of euler angles
  const position = useRef(new THREE.Vector3(0, earthRadius + flightAltitude, 0))
  const speed = useRef(0)
  const orientation = useRef(new THREE.Quaternion()) // Store orientation directly as quaternion
  
  // Input state
  const keysPressed = useRef<Record<string, boolean>>({})

  // Initialize the plane orientation to be properly aligned with the surface
  useEffect(() => {
    if (group.current) {
      // Start with plane oriented properly on the surface
      const up = position.current.clone().normalize()
      
      // Create a stable initial orientation
      const initialMatrix = new THREE.Matrix4()
      const worldUp = new THREE.Vector3(0, 1, 0)
      
      // Create a rotation that aligns world Y with surface normal
      const quaternionToSurface = new THREE.Quaternion()
      quaternionToSurface.setFromUnitVectors(worldUp, up)
      
      // Set initial orientation
      orientation.current.copy(quaternionToSurface)
      
      // Apply initial state
      group.current.position.copy(position.current)
      group.current.setRotationFromQuaternion(orientation.current)
      
      console.log('Plane initialized at position:', position.current.x.toFixed(2), position.current.y.toFixed(2), position.current.z.toFixed(2))
      
      // Log available animations but don't start them yet
      if (actions && Object.keys(actions).length > 0) {
        console.log('Available animations:', Object.keys(actions))
        // Prepare animations but don't play them yet
        Object.values(actions).forEach(action => {
          if (action) {
            action.reset()
            action.setLoop(THREE.LoopRepeat, Infinity)
            action.paused = true // Start paused
          }
        })
      } else {
        console.log('No animations found in the model')
      }
    }
  }, [actions])

  // Keyboard handlers
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

    // 1. HANDLE SPEED CONTROL
    let isThrottling = false
    if (keysPressed.current['KeyW']) {
      isThrottling = true
      speed.current += acceleration * delta
    }
    if (keysPressed.current['KeyS']) {
      speed.current -= acceleration * delta
    }

    // Apply drag
    const currentDrag = isThrottling ? dragFactor * 0.4 : dragFactor * 1.2
    speed.current -= currentDrag * speed.current * delta
    speed.current = THREE.MathUtils.clamp(speed.current, 0, maxSpeed)
    
    if (speed.current < 0.3) speed.current = 0

    // ANIMATION CONTROL - Play when flying, pause when stopped
    if (actions && Object.keys(actions).length > 0) {
      Object.values(actions).forEach(action => {
        if (action) {
          if (speed.current > 0.1) {
            // Flying - play animation
            if (action.paused) {
              action.paused = false
              action.play()
            }
          } else {
            // Stopped - pause animation
            if (!action.paused) {
              action.paused = true
            }
          }
        }
      })
    }

    // 2. HANDLE ROTATIONS - Apply incremental rotations to current orientation
    const rotationSpeed = 1.5
    const maxPitchAngle = Math.PI / 6 // 30 degrees max pitch
    const maxBankAngle = Math.PI / 4 // 45 degrees max bank
    
    // Get current surface normal for reference
    const surfaceNormal = position.current.clone().normalize()
    
    // Calculate current orientation vectors
    const currentRight = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation.current)
    const currentUp = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation.current)
    const currentForward = new THREE.Vector3(0, 0, -1).applyQuaternion(orientation.current)

    // Track turning input for banking
    let turnInput = 0
    let pitchInput = 0

    // Apply yaw (heading) rotations around surface normal WITH BANKING
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) {
      const yawRotation = new THREE.Quaternion()
      yawRotation.setFromAxisAngle(surfaceNormal, rotationSpeed * delta)
      orientation.current.premultiply(yawRotation)
      turnInput = 1 // Left turn
    }
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) {
      const yawRotation = new THREE.Quaternion()
      yawRotation.setFromAxisAngle(surfaceNormal, -rotationSpeed * delta)
      orientation.current.premultiply(yawRotation)
      turnInput = -1 // Right turn
    }

    // Apply pitch rotations around current right vector
    if (keysPressed.current['ArrowUp']) {
      const pitchRotation = new THREE.Quaternion()
      pitchRotation.setFromAxisAngle(currentRight, -rotationSpeed * delta)
      orientation.current.multiply(pitchRotation)
      pitchInput = -1 // Nose down
    }
    if (keysPressed.current['ArrowDown']) {
      const pitchRotation = new THREE.Quaternion()
      pitchRotation.setFromAxisAngle(currentRight, rotationSpeed * delta)
      orientation.current.multiply(pitchRotation)
      pitchInput = 1 // Nose up
    }

    // REALISTIC BANKING DURING TURNS
    if (speed.current > 5) { // Only bank when actually moving
      const bankingForce = turnInput * maxBankAngle * 0.3 // 30% of max bank
      const currentForwardVector = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation.current)
      
      // Apply banking rotation around the forward axis (roll)
      if (Math.abs(bankingForce) > 0.01) {
        const bankRotation = new THREE.Quaternion()
        bankRotation.setFromAxisAngle(currentForwardVector, bankingForce * delta * 3)
        orientation.current.multiply(bankRotation)
        
        console.log(`Banking: ${turnInput > 0 ? 'Left' : 'Right'} bank angle: ${(bankingForce * 180/Math.PI).toFixed(1)}°`)
      }
    }

    // DYNAMIC PITCH BASED ON SPEED CHANGES
    const speedChangeThreshold = 2
    if (isThrottling && speed.current > speedChangeThreshold) {
      // Climbing - slight nose up attitude
      const climbPitch = 0.1 // Gentle climb angle
      const climbRotation = new THREE.Quaternion()
      climbRotation.setFromAxisAngle(currentRight, climbPitch * delta * 0.5)
      orientation.current.multiply(climbRotation)
    } else if (!isThrottling && speed.current > speedChangeThreshold) {
      // Descending - slight nose down attitude  
      const divePitch = -0.05 // Gentle dive angle
      const diveRotation = new THREE.Quaternion()
      diveRotation.setFromAxisAngle(currentRight, divePitch * delta * 0.5)
      orientation.current.multiply(diveRotation)
    }

    // 3. CONSTRAIN ORIENTATION to prevent excessive pitch and maintain surface alignment
    // Recalculate vectors after rotation
    const newUp = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation.current)
    const newForward = new THREE.Vector3(0, 0, -1).applyQuaternion(orientation.current)
    
    // Limit pitch by ensuring up vector doesn't deviate too much from surface normal
    const pitchAngle = Math.acos(THREE.MathUtils.clamp(newUp.dot(surfaceNormal), -1, 1))
    if (pitchAngle > maxPitchAngle) {
      // Correct orientation to limit pitch
      const correctionAxis = new THREE.Vector3().crossVectors(newUp, surfaceNormal).normalize()
      const correctionAngle = pitchAngle - maxPitchAngle
      const correctionQuat = new THREE.Quaternion()
      correctionQuat.setFromAxisAngle(correctionAxis, -correctionAngle)
      orientation.current.multiply(correctionQuat)
    }

    // 4. MOVEMENT - Only if we have speed
    if (speed.current > 0.1) {
      // Get the current forward direction (nose of the model points +X in local space)
      const forwardDirection = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation.current)
      
      // Calculate movement
      const movement = forwardDirection.clone().multiplyScalar(speed.current * delta)
      position.current.add(movement)
      
      console.log(`Moving at speed ${speed.current.toFixed(1)}, forward: ${forwardDirection.x.toFixed(2)}, ${forwardDirection.y.toFixed(2)}, ${forwardDirection.z.toFixed(2)}`)
    }

    // 5. MAINTAIN ALTITUDE - Keep plane at proper distance from Earth center
    const currentDistance = position.current.length()
    const targetDistance = earthRadius + flightAltitude
    position.current.normalize().multiplyScalar(targetDistance)

    // 6. SURFACE ALIGNMENT - Gradually align plane orientation with new surface position
    const newSurfaceNormal = position.current.clone().normalize()
    const currentUpDirection = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation.current)
    
    // Calculate how much the surface normal has changed
    const alignmentAmount = 0.1 // How quickly to align with surface (0.1 = gentle)
    const surfaceAlignment = new THREE.Quaternion()
    surfaceAlignment.setFromUnitVectors(currentUpDirection, newSurfaceNormal)
    
    // Apply a small portion of the alignment each frame
    surfaceAlignment.slerp(new THREE.Quaternion(), 1 - alignmentAmount)
    orientation.current.premultiply(surfaceAlignment)

    // 7. APPLY TO VISUAL ELEMENTS
    group.current.position.copy(position.current)
    group.current.setRotationFromQuaternion(orientation.current)

    // Update planeRef for camera
    if (planeRef.current) {
      planeRef.current.position.copy(position.current)
      planeRef.current.quaternion.copy(orientation.current)
      
      const cameraForward = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation.current)
      planeRef.current.userData.forward = cameraForward
      planeRef.current.userData.up = newSurfaceNormal
      planeRef.current.userData.speed = speed.current
    }
  })

  return <primitive ref={group} object={scene} scale={1.1} />
}

useGLTF.preload('/models/newPlane.glb')
