'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type * as React from 'react'

interface TapToMoveHandlerProps {
  planeRef: React.RefObject<THREE.Object3D | null>
  earthScene: THREE.Group | null
}

/**
 * TapToMoveHandler - Inside Canvas component
 * Handles raycasting and sets target position on plane
 */
export default function TapToMoveHandler({ planeRef, earthScene }: TapToMoveHandlerProps) {
  const { camera, gl } = useThree()
  const raycasterRef = useRef(new THREE.Raycaster())
  const earthSceneRef = useRef(earthScene)
  
  // Keep earthScene ref updated
  useEffect(() => {
    earthSceneRef.current = earthScene
  }, [earthScene])

  useEffect(() => {
    if (!planeRef) return
    
    // Capture ref value at start of effect for cleanup (fixes React warning)
    const currentPlane = planeRef.current

    // Convert screen coordinates to 3D world position on Earth sphere
    const screenToWorldPosition = (clientX: number, clientY: number): THREE.Vector3 | null => {
      // Check earthScene from ref (it may load later)
      const currentEarthScene = earthSceneRef.current
      if (!currentEarthScene || !camera) return null

      // Get canvas bounds
      const canvas = gl.domElement as HTMLCanvasElement
      const rect = canvas.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 2 - 1
      const y = -((clientY - rect.top) / rect.height) * 2 + 1

      // Create ray from camera through tap point
      raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), camera as THREE.PerspectiveCamera)

      // Find intersection with Earth sphere (radius 25)
      const earthRadius = 25
      const earthCenter = new THREE.Vector3(0, 0, 0)
      const sphere = new THREE.Sphere(earthCenter, earthRadius)
      
      const intersectionPoint = new THREE.Vector3()
      const intersection = raycasterRef.current.ray.intersectSphere(sphere, intersectionPoint)
      
      if (intersection) {
        // Set target at flight altitude above surface
        const flightAltitude = 4
        const direction = intersection.clone().normalize()
        const targetDistance = earthRadius + flightAltitude
        return direction.multiplyScalar(targetDistance)
      }

      return null
    }

    // Handle tap - set target position
    const handleTap = (clientX: number, clientY: number) => {
      const targetPos = screenToWorldPosition(clientX, clientY)
      if (targetPos && planeRef.current) {
        // Set target position on plane's userData
        planeRef.current.userData.mobileTarget = targetPos.clone()
      }
    }

    // Store handler and planeRef on window for TapToMove to access
    const windowWithHandlers = window as Window & {
      __tapToMoveHandler?: (x: number, y: number) => void
      __planeRef?: React.RefObject<THREE.Object3D | null>
    }
    windowWithHandlers.__tapToMoveHandler = handleTap
    windowWithHandlers.__planeRef = planeRef

    // Cleanup function
    return () => {
      delete windowWithHandlers.__tapToMoveHandler
      delete windowWithHandlers.__planeRef
      
      if (currentPlane) {
        currentPlane.userData.mobileTarget = null
      }
    }
  }, [planeRef, camera, gl, raycasterRef])

  return null
}
