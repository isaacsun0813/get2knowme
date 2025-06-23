'use client'

import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

import Plane from './Plane'
import CameraFollower from '../controllers/CameraFollower'

// Landmark data - configure your landmarks here
// Based on the actual object names found in your Blender scene
const landmarkConfig = [
  {
    name: "Chicago_Pin", 
    displayName: "Chicago", 
    url: "https://en.wikipedia.org/wiki/Chicago",
    triggerDistance: 30
  },
  {
    name: "San_Francisco_Pin", 
    displayName: "San Francisco", 
    url: "https://en.wikipedia.org/wiki/San_Francisco",
    triggerDistance: 30
  },
  {
    name: "Saratoga_Pin", 
    displayName: "Saratoga", 
    url: "https://en.wikipedia.org/wiki/Saratoga,_California", 
    triggerDistance: 30
  },
  {
    name: "Shanghai_Pin",
    displayName: "Shanghai", 
    url: "https://en.wikipedia.org/wiki/Shanghai", 
    triggerDistance: 30
  },
  {
    name: "Zurich_Pin",
    displayName: "Zurich", 
    url: "https://en.wikipedia.org/wiki/Zurich", 
    triggerDistance: 30
  }
  // The issue might be that the visual pin you think is Chicago 
  // is actually the Zurich_Pin object in Blender
]

// Component that uses the landmark detection hook inside Canvas
function LandmarkDetectionComponent({
  earthScene,
  planeRef,
  onLandmarkNear,
  onLandmarkLeft
}: {
  earthScene: THREE.Group | null,
  planeRef: React.RefObject<THREE.Group | null>,
  onLandmarkNear: (landmark: typeof landmarkConfig[0]) => void,
  onLandmarkLeft: () => void
}) {
  const landmarks = useRef<Array<{ object: THREE.Object3D, config: typeof landmarkConfig[0] }>>([])
  const currentActiveLandmark = useRef<string | null>(null)
  const lastTriggeredTime = useRef<Record<string, number>>({})

  // Type definition for closest landmark
  type ClosestLandmarkType = { 
    object: THREE.Object3D, 
    config: typeof landmarkConfig[0], 
    distance: number 
  } | null

  // Find landmark objects in the scene
  useEffect(() => {
    if (!earthScene) return
    
    landmarks.current = []
    // Reset any existing triggers when scene changes
    currentActiveLandmark.current = null
    lastTriggeredTime.current = {}
    
    console.log('🔍 Scanning scene for landmarks...')
    earthScene.traverse((child) => {
      // Debug: Log all object names to help identify landmarks
      if (child.name && child.name !== '') {
        console.log(`👀 Found object: "${child.name}" type: ${child.type}`)
      }
      
      const config = landmarkConfig.find(l => l.name === child.name)
      if (config) {
        landmarks.current.push({ object: child, config })
        console.log(`🗺️ ✅ Found landmark: ${config.displayName} at`, child.position)
      }
    })
    
    console.log(`📍 Total landmarks found: ${landmarks.current.length}`)
    if (landmarks.current.length === 0) {
      console.log('⚠️ No landmarks found! Check that object names in Blender match the config names:')
      landmarkConfig.forEach(config => console.log(`   Expected: "${config.name}"`))
    }
  }, [earthScene])

  // Throttle debug logs
  const debugTimer = useRef<number>(0)
  // Prevent immediate triggering on mount
  const mountTimer = useRef<number>(0)

  useFrame(() => {
    if (!planeRef.current || landmarks.current.length === 0) return

    const planePosition = planeRef.current.position
    debugTimer.current += 0.016 // ~60fps
    mountTimer.current += 0.016 // ~60fps
    
    // Don't trigger anything for the first 2 seconds after mount
    if (mountTimer.current < 2.0) {
      return
    }

    // Debug: Check if plane position is valid
    if (!planePosition || planePosition.length() === 0) {
      console.log('⚠️ Invalid plane position:', planePosition)
      return
    }

    // Find the closest landmark within range
    let closestLandmark: ClosestLandmarkType = null

    landmarks.current.forEach(({ object, config }) => {
      // Debug: Check if object position is valid
      if (!object.position) {
        console.log('⚠️ Invalid object position for:', config.name)
        return
      }

      const distance = planePosition.distanceTo(object.position)
      
      // Debug: Check for NaN or invalid distances
      if (isNaN(distance) || distance === Infinity) {
        console.log(`⚠️ Invalid distance calculated for ${config.name}:`, distance)
        console.log(`   Plane pos:`, planePosition)
        console.log(`   Object pos:`, object.position)
        return
      }
      
      // Throttled debug - only log every 0.5 seconds AND only when reasonably close
      if (distance < 50 && debugTimer.current > 0.5) {
        console.log(`📏 ${config.displayName}: ${distance.toFixed(1)} (trigger: ${config.triggerDistance})`)
      }
      
      // Check if this landmark is in range
      if (distance < config.triggerDistance) {
        // If this is closer than our current closest, update it
        if (!closestLandmark || distance < closestLandmark.distance) {
          closestLandmark = { object, config, distance }
        }
      }
    })

    // Reset debug timer after logging
    if (debugTimer.current > 0.5) {
      debugTimer.current = 0
    }

    const currentTime = Date.now()

    // If we have a closest landmark and it's different from the current active one
    if (closestLandmark) {
      const { config, distance } = closestLandmark
      
      // Check if enough time has passed since last trigger (10 second cooldown)
      const lastTriggered = lastTriggeredTime.current[config.name] || 0
      const timeSinceLastTrigger = currentTime - lastTriggered
      
      if (currentActiveLandmark.current !== config.name && timeSinceLastTrigger > 10000) {
        console.log(`🎯🎯🎯 TRIGGERING LANDMARK: ${config.displayName} 🎯🎯🎯`)
        console.log(`📍 Object name in Blender: "${config.name}"`)
        console.log(`📍 Display name: "${config.displayName}"`)
        console.log(`📍 Distance was: ${distance.toFixed(1)} (trigger: ${config.triggerDistance})`)
        console.log(`📍 Plane position:`, planePosition)
        console.log(`📍 Object position:`, closestLandmark.object.position)
        
        currentActiveLandmark.current = config.name
        lastTriggeredTime.current[config.name] = currentTime
        onLandmarkNear(config)
      }
    } else {
      // No landmarks in range - dismiss popup if we had one active
      if (currentActiveLandmark.current !== null) {
        console.log(`📤 Left landmark range, dismissing popup for: ${currentActiveLandmark.current}`)
        currentActiveLandmark.current = null
        onLandmarkLeft()
      }
    }
  })

  return null
}

// Spacebar prompt component
function SpacebarPrompt({ 
  landmark, 
  onClose 
}: { 
  landmark: typeof landmarkConfig[0] | null,
  onClose: () => void 
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    console.log('🎪 SpacebarPrompt useEffect - landmark:', landmark)
    if (landmark) {
      console.log('🎪 Setting popup visible for:', landmark.displayName)
      setIsVisible(true)
    } else {
      console.log('🎪 Hiding popup')
      setIsVisible(false)
    }
  }, [landmark])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && landmark) {
        e.preventDefault()
        window.open(landmark.url, '_blank')
        onClose()
      }
      if (e.code === 'Escape') {
        onClose()
      }
    }

    if (isVisible) {
      window.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isVisible, landmark, onClose])

  if (!isVisible || !landmark) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8 z-50 pointer-events-none">
      <div className="bg-black bg-opacity-90 text-white px-8 py-4 rounded-lg border-2 border-yellow-400 animate-pulse shadow-2xl">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-1 text-yellow-300">
            📍 {landmark.displayName}
          </h2>
          <p className="text-lg mb-2">
            Press <span className="bg-yellow-400 text-black px-3 py-1 rounded font-bold">SPACE</span> to Enter
          </p>
          <p className="text-xs text-gray-300">
            Press ESC to dismiss
          </p>
        </div>
      </div>
    </div>
  )
}

function Model(props: any & { onSceneReady?: (scene: THREE.Group) => void }) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/models/sickEarthFile2.glb')
  const { actions, mixer } = useAnimations(animations, group)
  
  // Keep original materials from Blender
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Just ensure materials update properly
      child.material.needsUpdate = true
    }
  })
  
  scene.userData = { isEarth: true }
  scene.name = 'Earth'
  
  // Play all animations automatically (simplified)
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      Object.values(actions).forEach(action => {
        if (action) {
          action.reset()
          action.setLoop(THREE.LoopRepeat, Infinity)
          action.play()
        }
      })
    }
  }, [actions])

  // Notify parent when scene is ready for landmark detection
  useEffect(() => {
    console.log('🎬 Model scene ready, calling onSceneReady...', scene ? 'Scene exists' : 'No scene')
    if (props.onSceneReady && scene) {
      console.log('📞 Calling onSceneReady with scene')
      props.onSceneReady(scene)
    }
  }, [scene, props.onSceneReady])
  
  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  )
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
      <p style={{ margin: '5px 0', color: '#ffdd44' }}>🗺️ Fly near landmarks and press SPACE to explore!</p>

    </div>
  )
}

export default function Experience() {
  console.log('🚀 Experience component mounted')
  const planeRef = useRef<THREE.Group>(new THREE.Group())
  const [earthScene, setEarthScene] = useState<THREE.Group | null>(null)
  const [currentLandmark, setCurrentLandmark] = useState<typeof landmarkConfig[0] | null>(null)
  
  // Debug: Log currentLandmark changes
  useEffect(() => {
    console.log('🔄 currentLandmark state changed:', currentLandmark?.displayName || 'null')
  }, [currentLandmark])

  const handleLandmarkNear = (landmark: typeof landmarkConfig[0]) => {
    console.log('🚨🚨🚨 LANDMARK HANDLER CALLED:', landmark.displayName)
    console.log('🚨 Setting currentLandmark state...')
    setCurrentLandmark(landmark)
    console.log('🚨 State should be set now!')
  }

  const handleClosePrompt = () => {
    setCurrentLandmark(null)
  }

  const handleLandmarkLeft = () => {
    console.log('🚨 LANDMARK LEFT - dismissing popup')
    setCurrentLandmark(null)
  }

  // Debug earthScene state
  useEffect(() => {
    console.log('🌍 EarthScene state changed:', earthScene ? 'READY' : 'NULL')
  }, [earthScene])
  
  return (
    <>
      <Canvas 
        camera={{ position: [0, 5, 10], fov: 50 }}
        style={{ background: '#87CEEB' }} // Remove dark corners
        shadows
      >
        {/* Softer, more natural lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.6} 
        />
        <hemisphereLight 
          args={["#ffffff", "#444444", 0.4]}
        />
        <SkyDome />
        
        {/* Earth */}
        <Model 
          scale={25} 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]} 
          onSceneReady={setEarthScene}
        />
        
        {/* Plane */}
        <Plane planeRef={planeRef} />
        
        {/* Landmark detection using hook inside Canvas */}
        <LandmarkDetectionComponent 
          earthScene={earthScene}
          planeRef={planeRef}
          onLandmarkNear={handleLandmarkNear}
          onLandmarkLeft={handleLandmarkLeft}
        />
        
        {/* Camera controller */}
        <CameraFollower targetRef={planeRef} />
      </Canvas>
      
      {/* Instructions overlay */}
      <Instructions />
      
      {/* Spacebar prompt */}
      <SpacebarPrompt 
        landmark={currentLandmark}
        onClose={handleClosePrompt}
      />
    </>
  )
}