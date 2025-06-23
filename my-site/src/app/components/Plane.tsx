'use client'

import { useGLTF } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Plane({ planeRef }: { planeRef: React.RefObject<THREE.Group | null> }) {
  const { scene } = useGLTF('/models/daplane.glb')
  const group = useRef<THREE.Group>(null)

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
    }
  }, [])

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

    // 2. HANDLE ROTATIONS - Apply incremental rotations to current orientation
    const rotationSpeed = 1.5
    const maxPitchAngle = Math.PI / 6 // 30 degrees max pitch
    
    // Get current surface normal for reference
    const surfaceNormal = position.current.clone().normalize()
    
    // Calculate current orientation vectors
    const currentRight = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation.current)
    const currentUp = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation.current)
    const currentForward = new THREE.Vector3(0, 0, -1).applyQuaternion(orientation.current)

    // Apply yaw (heading) rotations around surface normal
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) {
      const yawRotation = new THREE.Quaternion()
      yawRotation.setFromAxisAngle(surfaceNormal, rotationSpeed * delta)
      orientation.current.premultiply(yawRotation)
    }
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) {
      const yawRotation = new THREE.Quaternion()
      yawRotation.setFromAxisAngle(surfaceNormal, -rotationSpeed * delta)
      orientation.current.premultiply(yawRotation)
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

  return <primitive ref={group} object={scene} scale={0.8} />
}

useGLTF.preload('/models/daplane.glb')
