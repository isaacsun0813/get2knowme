'use client'

import { useGLTF, useAnimations } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Plane({ 
  planeRef, 
  controlsDisabled = false,
  worldJustAppeared = false
}: { 
  planeRef: React.RefObject<THREE.Group | null>
  controlsDisabled?: boolean
  worldJustAppeared?: boolean
}) {
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
  // Start the plane directly over Saratoga (AboutMe landmark) - coordinates from flight testing
  const targetPosition = new THREE.Vector3(-10.360, 18.038, 29.206)
  const position = useRef(targetPosition.clone())
  const speed = useRef(0)
  const orientation = useRef(new THREE.Quaternion()) // Store orientation directly as quaternion
  
  // Drop-in animation state
  const dropInStartTime = useRef<number | null>(null)
  const dropInDuration = 1.0 // 1 second to drop in (faster)
  const dropInHeightMultiplier = 2.5 // Start 2.5x higher than target altitude
  const hasDroppedIn = useRef(false)
  const dropInProgress = useRef(0) // Track drop-in progress (0-1) for camera zoom
  
  // Input state
  const keysPressed = useRef<Record<string, boolean>>({})

  // Initialize drop-in animation when world appears
  useEffect(() => {
    if (worldJustAppeared && dropInStartTime.current === null) {
      // Calculate starting position (higher altitude)
      const targetDistance = earthRadius + flightAltitude
      const startDistance = targetDistance * dropInHeightMultiplier
      
      // Start plane at higher altitude, same direction from center
      const direction = targetPosition.clone().normalize()
      const startPosition = direction.clone().multiplyScalar(startDistance)
      position.current.copy(startPosition)
      
      // Initialize drop-in animation
      dropInStartTime.current = Date.now()
    }
  }, [worldJustAppeared])

  // Initialize the plane orientation to be properly aligned with the surface
  useEffect(() => {
    if (group.current) {
      // Start with plane oriented properly on the surface
      const up = position.current.clone().normalize()
      
      // Create a stable initial orientation
      const worldUp = new THREE.Vector3(0, 1, 0)
      
      // Create a rotation that aligns world Y with surface normal
      const quaternionToSurface = new THREE.Quaternion()
      quaternionToSurface.setFromUnitVectors(worldUp, up)
      
      // Set initial orientation
      orientation.current.copy(quaternionToSurface)
      
      // Apply initial state
      group.current.position.copy(position.current)
      group.current.setRotationFromQuaternion(orientation.current)
      
      // Plane initialized
      
      // Log available animations but don't start them yet
      if (actions && Object.keys(actions).length > 0) {
        // Animations available
        // Prepare animations but don't play them yet
        Object.values(actions).forEach(action => {
          if (action) {
            action.reset()
            action.setLoop(THREE.LoopRepeat, Infinity)
            action.paused = true // Start paused
          }
        })
      } else {
        // No animations found in the model
      }
    }
  }, [actions])

  // Keyboard handlers with cross-browser compatibility
  useEffect(() => {
    const down = (e: KeyboardEvent) => { 
      // Prevent default for flight controls to avoid page scrolling
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault()
      }
      keysPressed.current[e.code] = true
    }
    const up = (e: KeyboardEvent) => { 
      keysPressed.current[e.code] = false 
    }
    
    // Add event listeners with passive: false for preventDefault to work
    window.addEventListener('keydown', down, { passive: false })
    window.addEventListener('keyup', up, { passive: false })
    
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((state, delta) => {
    if (!group.current) return

    // 0. HANDLE DROP-IN ANIMATION
    if (dropInStartTime.current !== null) {
      const elapsed = (Date.now() - dropInStartTime.current) / 1000
      
      if (elapsed < dropInDuration) {
        // Smooth ease-out curve for natural drop
        const t = elapsed / dropInDuration
        const easedT = 1 - Math.pow(1 - t, 3) // Ease-out cubic
        
        // Track progress for camera zoom
        dropInProgress.current = t
        
        // Interpolate from start to target position
        const targetDistance = earthRadius + flightAltitude
        const startDistance = targetDistance * dropInHeightMultiplier
        const currentDistance = startDistance + (targetDistance - startDistance) * easedT
        
        // Maintain same direction, just change distance from center
        const direction = targetPosition.clone().normalize()
        const currentPosition = direction.clone().multiplyScalar(currentDistance)
        position.current.copy(currentPosition)
        
        // Update orientation to align with surface at current position
        const surfaceNormal = currentPosition.clone().normalize()
        const worldUp = new THREE.Vector3(0, 1, 0)
        const quaternionToSurface = new THREE.Quaternion()
        quaternionToSurface.setFromUnitVectors(worldUp, surfaceNormal)
        orientation.current.copy(quaternionToSurface)
        
        // Update visual immediately
        group.current.position.copy(position.current)
        group.current.setRotationFromQuaternion(orientation.current)
        
        // Update planeRef for camera (include drop-in progress for zoom effect)
        if (planeRef.current) {
          planeRef.current.position.copy(position.current)
          planeRef.current.quaternion.copy(orientation.current)
          planeRef.current.userData.dropInProgress = dropInProgress.current
          
          // Set forward vector for camera (plane's forward is +X in local space)
          const cameraForward = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation.current)
          planeRef.current.userData.forward = cameraForward
          planeRef.current.userData.up = surfaceNormal
          planeRef.current.userData.speed = 0
        }
        
        // Don't process other movement during drop-in
        return
      } else {
        // Drop-in complete, snap to final position
        position.current.copy(targetPosition)
        dropInStartTime.current = null
        dropInProgress.current = 1
        hasDroppedIn.current = true
        
        // Clear drop-in progress after a moment
        if (planeRef.current) {
          planeRef.current.userData.dropInProgress = 1
        }
      }
    } else {
      // Clear drop-in progress when not dropping
      dropInProgress.current = 1
      if (planeRef.current) {
        planeRef.current.userData.dropInProgress = 1
      }
    }

    // 1. HANDLE SPEED CONTROL
    let isThrottling = false
    
    // Skip controls if disabled (e.g., when popup is open)
    if (controlsDisabled) {
      // Apply stronger drag to gradually slow down the plane
      speed.current -= dragFactor * speed.current * delta * 2
    } else {
      if (keysPressed.current['KeyW']) {
        isThrottling = true
        speed.current += acceleration * delta
      }
      if (keysPressed.current['KeyS']) {
        speed.current -= acceleration * delta
      }

      // Apply normal drag
      const currentDrag = isThrottling ? dragFactor * 0.4 : dragFactor * 1.2
      speed.current -= currentDrag * speed.current * delta
    }
    
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

    // Track turning input for banking
    let turnInput = 0

    // Only apply rotations if controls are not disabled
    if (!controlsDisabled) {
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
      }
      if (keysPressed.current['ArrowDown']) {
        const pitchRotation = new THREE.Quaternion()
        pitchRotation.setFromAxisAngle(currentRight, rotationSpeed * delta)
        orientation.current.multiply(pitchRotation)
      }
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
        
        // Banking applied
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
      

    }

    // 5. MAINTAIN ALTITUDE - Keep plane at proper distance from Earth center
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
