'use client'

import { useGLTF } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Plane({ planeRef }: { planeRef: React.RefObject<THREE.Group | null> }) {
  const { scene } = useGLTF('/models/daplane.glb')
  const group = useRef<THREE.Group>(null)

  // Flight state
  const earthRadius = 25
  const flightAltitude = 4
  const position = useRef(new THREE.Vector3(0, earthRadius + flightAltitude, 0))
  const heading = useRef(0)
  const velocity = useRef(0)
  const bankAngle = useRef(0)
  
  const keysPressed = useRef<Record<string, boolean>>({})

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

  useFrame(() => {
    if (!group.current) return

    // Handle controls
    if (keysPressed.current['KeyW']) {
      velocity.current = Math.min(velocity.current + 0.008, 0.15)
    } else {
      velocity.current = Math.max(velocity.current - 0.004, 0)
    }

    // Simple turning
    if (keysPressed.current['KeyA']) {
      heading.current += 0.03
      bankAngle.current = THREE.MathUtils.lerp(bankAngle.current, 0.3, 0.1)
    } else if (keysPressed.current['KeyD']) {
      heading.current -= 0.03
      bankAngle.current = THREE.MathUtils.lerp(bankAngle.current, -0.3, 0.1)
    } else {
      bankAngle.current = THREE.MathUtils.lerp(bankAngle.current, 0, 0.15)
    }

    // Step 1: Calculate the local coordinate system at this point on Earth
    const earthUp = position.current.clone().normalize()
    
    // Step 2: Create a stable "north" reference
    const worldUp = new THREE.Vector3(0, 1, 0)
    const north = worldUp.clone().cross(earthUp).cross(earthUp).normalize()
    
    // Handle the case where we're at the poles
    if (north.length() < 0.1) {
      north.set(1, 0, 0).projectOnPlane(earthUp).normalize()
    }
    
    // Step 3: Calculate east (right) direction
    const east = new THREE.Vector3().crossVectors(north, earthUp).normalize()
    
    // Step 4: Calculate forward direction based on heading
    const forward = new THREE.Vector3()
    forward.copy(north).multiplyScalar(Math.cos(heading.current))
    forward.addScaledVector(east, Math.sin(heading.current))
    forward.normalize()

    // Step 5: Move the plane
    if (velocity.current > 0) {
      position.current.add(forward.clone().multiplyScalar(velocity.current))
      position.current.normalize().multiplyScalar(earthRadius + flightAltitude)
    }

    // Step 6: Build quaternion orientation systematically
    group.current.position.copy(position.current)
    
    // Recalculate coordinate system at new position
    const newEarthUp = position.current.clone().normalize()
    const newNorth = worldUp.clone().cross(newEarthUp).cross(newEarthUp).normalize()
    if (newNorth.length() < 0.1) {
      newNorth.set(1, 0, 0).projectOnPlane(newEarthUp).normalize()
    }
    const newEast = new THREE.Vector3().crossVectors(newNorth, newEarthUp).normalize()
    const newForward = new THREE.Vector3()
    newForward.copy(newNorth).multiplyScalar(Math.cos(heading.current))
    newForward.addScaledVector(newEast, Math.sin(heading.current))
    newForward.normalize()

    // Step 7: Build rotation using step-by-step quaternions
    const finalQuaternion = new THREE.Quaternion()
    
    // First: Align with Earth surface (up vector points away from Earth)
    const upAlignQuat = new THREE.Quaternion()
    const worldUp2 = new THREE.Vector3(0, 1, 0)
    upAlignQuat.setFromUnitVectors(worldUp2, newEarthUp)
    
    // Second: Apply heading rotation around the up axis
    const headingQuat = new THREE.Quaternion()
    headingQuat.setFromAxisAngle(newEarthUp, heading.current)
    
    // Third: Fix model orientation (so nozzle points forward)
    const modelCorrectionQuat = new THREE.Quaternion()
    modelCorrectionQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2)
    
    // Fourth: Apply banking around forward axis
    const bankingQuat = new THREE.Quaternion()
    if (Math.abs(bankAngle.current) > 0.01) {
      bankingQuat.setFromAxisAngle(newForward, bankAngle.current)
    } else {
      bankingQuat.identity()
    }
    
    // Apply transformations: upAlign -> heading -> modelCorrection -> banking
    finalQuaternion.identity()
    finalQuaternion.multiply(upAlignQuat)
    finalQuaternion.multiply(headingQuat)
    finalQuaternion.multiply(modelCorrectionQuat)
    finalQuaternion.multiply(bankingQuat)
    
    // Apply final orientation
    group.current.setRotationFromQuaternion(finalQuaternion)

    // Update camera data
    if (planeRef.current) {
      planeRef.current.position.copy(position.current)
      planeRef.current.quaternion.copy(finalQuaternion)
      planeRef.current.userData.forward = forward
      planeRef.current.userData.up = earthUp
      planeRef.current.userData.heading = heading.current
    }
  })

  return <primitive ref={group} object={scene} scale={1.2} />
}

useGLTF.preload('/models/daplane.glb')
