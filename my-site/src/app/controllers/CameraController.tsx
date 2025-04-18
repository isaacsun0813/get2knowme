'use client'

import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function CameraController() {
  const { camera } = useThree()

  const spherical = useRef(new THREE.Spherical(5, Math.PI / 2, 0)) // radius, phi (polar), theta (azimuth)
  const keysPressed = useRef<{ [key: string]: boolean }>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault()
        keysPressed.current[e.code] = true
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false
    }

    window.addEventListener('keydown', handleKeyDown, { passive: false })
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    const rotateSpeed = 0.02

    // Update theta (azimuth, left/right)
    if (keysPressed.current.KeyA || keysPressed.current.ArrowLeft) {
      spherical.current.theta -= rotateSpeed
    }
    if (keysPressed.current.KeyD || keysPressed.current.ArrowRight) {
      spherical.current.theta += rotateSpeed
    }

    // Update phi (polar, up/down)
    if (keysPressed.current.KeyW || keysPressed.current.ArrowUp) {
      spherical.current.phi -= rotateSpeed
    }
    if (keysPressed.current.KeyS || keysPressed.current.ArrowDown) {
      spherical.current.phi += rotateSpeed
    }

    // Clamp phi to avoid flipping
    const EPS = 0.000001
    spherical.current.phi = THREE.MathUtils.clamp(spherical.current.phi, EPS, Math.PI - EPS)

    // Calculate camera position
    const pos = new THREE.Vector3().setFromSpherical(spherical.current)
    camera.position.copy(pos)

    // THIS IS THE FIX: Make the up vector relative to phi
    // Cross product between camera vector and a fixed axis to determine the true 'up' direction
    const worldUp = new THREE.Vector3(0, 1, 0)
    const tangent = new THREE.Vector3().crossVectors(worldUp, pos).normalize()
    const up = new THREE.Vector3().crossVectors(pos, tangent).normalize()
    camera.up.copy(up)

    camera.lookAt(0, 0, 0)
  })

  return null
}
