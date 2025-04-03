'use client'

import * as THREE from 'three';
import { Canvas } from '@react-three/fiber'
// Orbitcontrols is used so that we can rotate, zoom and also pan aronud the model 
// we can also use useGLTF to load GLTF? files into a three.js scene, not entirely sure what that does 
import { OrbitControls, useGLTF } from '@react-three/drei'

// a reusable model copmonent to load GLB models 
function Model(props: any){
    const {scene} = useGLTF('/models/scene.glb')
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
  

export default function Experience() {
  return (
    <Canvas camera = {{position:[0,1,5], fov: 50}} style={{background: '#add8e6'}} // this is where we position the camera
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} />
      <SkyDome />
      <Model scale={0.5} position={[0, -1, 0]} rotation={[0, Math.PI / 2, 0]} />
      <OrbitControls enableZoom={true}/>
    </Canvas>
  )
}
// This component uses the Canvas from @react-three/fiber to create a 3D scene.