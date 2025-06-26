'use client'

import * as THREE from 'three'

export default function SkyDome() {
  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
    </mesh>
  )
} 