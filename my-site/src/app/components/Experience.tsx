'use client'

import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'

import Plane from './Plane'
import CameraFollower from '../controllers/CameraFollower'
import { AboutMe, Career, Ambition, Home, Vibes, Adventure } from '../landmark-pages'
import IntroScreen from './IntroScreen'
import LocationPrompt, { LandmarkConfig } from './LocationPrompt'
import LandmarkDetection, { landmarkConfig } from './LandmarkDetection'
import FlightControls from './FlightControls'
import EarthModel from './EarthModel'
import SkyDome from './SkyDome'

// Update landmark config with actual components
const updatedLandmarkConfig = landmarkConfig.map(config => ({
  ...config,
  component: (() => {
    switch (config.subtitle) {
      case "About Me": return AboutMe
      case "Career": return Career
      case "Ambition": return Ambition
      case "Home": return Home
      case "Vibes": return Vibes
      case "Adventure": return Adventure
      default: return () => null
    }
  })()
}))

// Custom hook to detect browser zoom level
function useZoomLevel() {
  const getZoom = () => {
    if (typeof window === 'undefined') return 1
    if (window.visualViewport) {
      return window.visualViewport.scale || 1
    }
    // Fallback method
    return Math.round((window.outerWidth / window.innerWidth) * 100) / 100 || 1
  }

  const [zoomLevel, setZoomLevel] = useState(getZoom())

  useEffect(() => {
    const updateZoom = () => {
      const z = getZoom()
      setZoomLevel(z)
    }

    // Listen for viewport scale changes (modern browsers)
    window.visualViewport?.addEventListener('resize', updateZoom)
    // Fallback to window resize
    window.addEventListener('resize', updateZoom)

    return () => {
      window.visualViewport?.removeEventListener('resize', updateZoom)
      window.removeEventListener('resize', updateZoom)
    }
  }, [])

  return zoomLevel
}

export default function Experience() {
  console.log('🚀 Experience component mounted')
  const planeRef = useRef<THREE.Group>(new THREE.Group())
  const [earthScene, setEarthScene] = useState<THREE.Group | null>(null)
  const [currentLandmark, setCurrentLandmark] = useState<LandmarkConfig | null>(null)
  const [showSpacebarPrompt, setShowSpacebarPrompt] = useState<LandmarkConfig | null>(null)
  const [showPopup, setShowPopup] = useState<LandmarkConfig | null>(null)
  const [showIntro, setShowIntro] = useState(true)
  
  // Detect browser zoom level
  const zoomLevel = useZoomLevel()
  
  // Debug: Log currentLandmark changes
  useEffect(() => {
    console.log('🔄 currentLandmark state changed:', currentLandmark?.displayName || 'null')
  }, [currentLandmark])

  // Debug zoom changes
  useEffect(() => {
    console.log('🔍 Zoom level changed:', zoomLevel)
  }, [zoomLevel])

    const handleLandmarkNear = (baseLandmark: Omit<LandmarkConfig, 'component'>) => {
    // Find the full landmark config with component
    const landmark = updatedLandmarkConfig.find(l => l.name === baseLandmark.name)
    if (landmark) {
    console.log('🚨🚨🚨 LANDMARK HANDLER CALLED:', landmark.displayName)
    console.log('🚨 Setting spacebar prompt...')
    setShowSpacebarPrompt(landmark)
    setCurrentLandmark(landmark)
    }
  }

  const handleSpacebarPressed = () => {
    console.log('🚀 Space pressed, opening popup for:', currentLandmark?.displayName)
    setShowSpacebarPrompt(null)
    setShowPopup(currentLandmark)
  }

  const handleClosePrompt = () => {
    setShowSpacebarPrompt(null)
    setCurrentLandmark(null)
  }

  const handleClosePopup = () => {
    setShowPopup(null)
  }

  const handleLandmarkLeft = () => {
    console.log('🚨 LANDMARK LEFT - dismissing prompts')
    setShowSpacebarPrompt(null)
    setCurrentLandmark(null)
  }

  const handleEnterWorld = () => {
    setShowIntro(false)
  }

  // Debug earthScene state
  useEffect(() => {
    console.log('🌍 EarthScene state changed:', earthScene ? 'READY' : 'NULL')
  }, [earthScene])
  
  return (
    <>
      {/* Preload 3D world in background */}
      <div className={`${showIntro ? 'opacity-0 pointer-events-none' : 'animate-zoom-into-earth'}`}>
      <Canvas 
        camera={{ 
          position: [0, 5, 10], 
          fov: 50 // Keep camera FOV fixed at 50
        }}
          style={{ 
            background: 'linear-gradient(to bottom, #87CEEB, #B0E0E6)',
            width: '100vw',
            height: '100vh'
          }}
        shadows
      >
        {/* Balanced neutral lighting - split the difference */}
        <ambientLight intensity={0.90} color="white" />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.60}
          color="white"
        />
        <hemisphereLight 
          args={["white", "#f0f0f0", 0.6]}
        />
        <SkyDome />
        
        {/* Earth */}
        <EarthModel 
          scale={25} 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]} 
          onSceneReady={setEarthScene}
        />
        
        {/* Plane */}
        <Plane 
          planeRef={planeRef} 
          controlsDisabled={!!showPopup}
        />
        
        {/* Landmark detection using hook inside Canvas */}
        <LandmarkDetection 
          earthScene={earthScene}
          planeRef={planeRef}
          onLandmarkNear={handleLandmarkNear}
          onLandmarkLeft={handleLandmarkLeft}
        />
        
        {/* Camera controller with zoom level */}
        <CameraFollower targetRef={planeRef} zoomLevel={zoomLevel} />
      </Canvas>
      
      {/* Instructions overlay */}
      <FlightControls />
      
      {/* Spacebar prompt */}
      <LocationPrompt 
        landmark={showSpacebarPrompt}
        onClose={handleClosePrompt}
        onSpacePressed={handleSpacebarPressed}
      />
      
      {/* Landmark popup components */}
      {showPopup && (
        <showPopup.component 
          isOpen={true}
          onClose={handleClosePopup}
        />
      )}

        {/* CSS for world entrance animation */}
        <style jsx>{`
          @keyframes zoom-into-earth {
            0% { 
              opacity: 0; 
              transform: scale(0.1) translateZ(-1000px);
              filter: blur(10px);
            }
            50% {
              opacity: 0.8;
              filter: blur(3px);
            }
            100% { 
              opacity: 1; 
              transform: scale(1) translateZ(0);
              filter: blur(0px);
            }
          }

          .animate-zoom-into-earth {
            animation: zoom-into-earth 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
            width: 100vw;
            height: 100vh;
          }
        `}</style>
      </div>

      {/* Show intro screen on top when needed */}
      {showIntro && <IntroScreen onEnter={handleEnterWorld} />}
    </>
  )
}