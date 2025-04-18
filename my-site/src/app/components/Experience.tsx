'use client'

import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

import Plane from './Plane'
import CameraFollower from '../controllers/CameraFollower'

function Model(props: any) {
  const { scene } = useGLTF('/models/scene.glb')
  
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material.flatShading = true
      child.material.needsUpdate = true
    }
  })
  
  // Add a flag to help identify the Earth model
  scene.userData = { isEarth: true }
  scene.name = 'Earth'
  
  return <primitive object={scene} {...props} />
}

function SkyDome() {
  return (
    <mesh>
      <sphereGeometry args={[50, 32, 32]} />
      <meshBasicMaterial color="#add8e6" side={THREE.BackSide} />
    </mesh>
  )
}

// Simple instructions overlay
function Instructions() {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      color: 'white',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Flight Controls:</h3>
      <p style={{ margin: '5px 0' }}>A/Left Arrow: Turn Left</p>
      <p style={{ margin: '5px 0' }}>D/Right Arrow: Turn Right</p>
      <p style={{ margin: '5px 0' }}>W/Up Arrow: Increase Speed</p>
      <p style={{ margin: '5px 0' }}>S/Down Arrow: Decrease Speed</p>
    </div>
  )
}

export default function Experience() {
  // Create a new Group for tracking the global position
  const planeRef = useRef<THREE.Group>(new THREE.Group())
  
  return (
    <>
      <Canvas camera={{ position: [0, 0, -4], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[2, 2, 2]} intensity={1.5} />
        <SkyDome />
        
        {/* Earth model - larger scale for prominence */}
        <Model scale={1.2} position={[0, 0, 0]} rotation={[0, 0, 0]} />
        
        {/* Plane - fixed in view, smaller scale */}
        <Plane planeRef={planeRef} />
        
        {/* Camera controller - rotates Earth based on plane movement */}
        <CameraFollower targetRef={planeRef} />
      </Canvas>
      
      {/* Optional instructions overlay */}
      <Instructions />
    </>
  )
}