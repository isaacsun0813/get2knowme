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
  
  scene.userData = { isEarth: true }
  scene.name = 'Earth'
  
  return <primitive object={scene} {...props} />
}

function SkyDome() {
  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
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
  const planeRef = useRef<THREE.Group>(new THREE.Group())
  
  return (
    <>
      <Canvas 
        camera={{ position: [0, 5, 10], fov: 50 }}
        style={{ background: '#87CEEB' }} // Remove dark corners
      >
        <ambientLight intensity={1} />
        <directionalLight position={[2, 2, 2]} intensity={1.5} />
        <SkyDome />
        
        {/* Earth */}
        <Model scale={25} position={[0, 0, 0]} rotation={[0, 0, 0]} />
        
        {/* Plane */}
        <Plane planeRef={planeRef} />
        
        {/* Camera controller */}
        <CameraFollower targetRef={planeRef} />
      </Canvas>
      
      {/* Optional instructions overlay */}
      {/* <Instructions //> */}
    </>
  )
}