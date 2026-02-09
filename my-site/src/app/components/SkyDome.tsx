'use client'

import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'

export default function SkyDome() {
  const { size } = useThree()
  
  // Calculate responsive SkyDome radius based on screen size
  // Must be larger than maximum possible camera distance
  // Camera distance scales with screen size, so SkyDome must too
  const radius = useMemo(() => {
    // Reference screen (1920×1080) - max camera distance ~200 units
    // Use screen diagonal as proxy for "screen size"
    const refDiagonal = Math.sqrt(1920 * 1920 + 1080 * 1080)
    const currentDiagonal = Math.sqrt(size.width * size.width + size.height * size.height)
    
    // Base radius for reference screen
    const baseRadius = 500
    
    // Scale radius based on screen size
    // Larger screens = larger radius (camera can zoom out more)
    // Smaller screens = smaller radius (camera stays closer)
    const scaleFactor = currentDiagonal / refDiagonal
    
    // Ensure minimum radius of 400 (safety margin)
    // Maximum radius of 800 (for very large screens)
    const scaledRadius = baseRadius * scaleFactor
    return Math.max(400, Math.min(800, scaledRadius))
  }, [size.width, size.height])
  
  return (
    <mesh>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial 
        color="#87CEEB" 
        side={THREE.BackSide}
        fog={false}
      />
    </mesh>
  )
} 