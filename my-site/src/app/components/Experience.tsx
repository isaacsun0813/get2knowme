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
import MobileControls from './MobileControls'
import EarthModel from './EarthModel'
import SkyDome from './SkyDome'
import MobileLandingPage from './MobileLandingPage'
import VisitedLandmarks from './VisitedLandmarks'
import BackgroundMusic from './BackgroundMusic'
import ImagePreloader from './ImagePreloader'
import WebGLErrorBoundary from './WebGLErrorBoundary'

// 🚀 MOBILE LANDING PAGE TOGGLE - Change this to enable/disable mobile landing page
const SHOW_MOBILE_LANDING = true // Set to false to disable mobile landing page

// Update landmark config with actual components
const updatedLandmarkConfig = landmarkConfig.map(config => ({
  ...config,
  component: (() => {
    switch (config.subtitle) {
      case "About Me": return AboutMe
      case "Career": return Career
      case "Ambition": return Ambition
      case "Home": return Home
      case "Inspiration": return Vibes
      case "Adventure": return Adventure
      default: return () => null
    }
  })()
}))

// Custom hook to detect browser zoom level
function useZoomLevel() {
  const getZoom = () => {
    if (typeof window === 'undefined') return 1
    
    // Method 1: Visual viewport scale (trackpad zoom on mobile/touchpad)
    if (window.visualViewport) {
      const viewportZoom = window.visualViewport.scale || 1
      if (viewportZoom !== 1) {
        return viewportZoom
      }
    }
    
    // Method 2: Browser zoom detection (Ctrl+/-)
    // This works by comparing the screen pixel ratio with device pixel ratio
    // const browserZoom = window.devicePixelRatio || 1
    
    // Method 3: Alternative browser zoom detection using computed styles
    // Create a test element to measure actual vs expected sizing
    const testDiv = document.createElement('div')
    testDiv.style.width = '100px'
    testDiv.style.height = '100px'
    testDiv.style.position = 'absolute'
    testDiv.style.visibility = 'hidden'
    document.body.appendChild(testDiv)
    
    const computedStyle = window.getComputedStyle(testDiv)
    const actualWidth = parseFloat(computedStyle.width)
    document.body.removeChild(testDiv)
    
    // Calculate zoom based on expected vs actual pixel measurements
    const zoomFromCSS = actualWidth / 100
    
    // Zoom detection methods evaluated
    
    // Return the zoom level that's different from 1, prioritizing viewport scale
    if (window.visualViewport && Math.abs((window.visualViewport.scale || 1) - 1) > 0.01) {
      return window.visualViewport.scale || 1
    }
    
    // Fallback to CSS-based detection for browser zoom
    return zoomFromCSS
  }

  const [zoomLevel, setZoomLevel] = useState(getZoom())

  useEffect(() => {
    const updateZoom = () => {
      const z = getZoom()
      setZoomLevel(z)
    }

    // Listen for viewport scale changes (trackpad zoom)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateZoom)
      window.visualViewport.addEventListener('scroll', updateZoom)
    }
    
    // Listen for window resize (browser zoom)
    window.addEventListener('resize', updateZoom)
    
    // Listen for keyboard zoom shortcuts (Ctrl+/-)
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+' || e.key === '-' || e.key === '0') {
          // Small delay to let browser apply zoom before measuring
          setTimeout(updateZoom, 100)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeydown)
    
    // Also listen for wheel events with Ctrl held (zoom via mouse wheel)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setTimeout(updateZoom, 100)
      }
    }
    
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateZoom)
        window.visualViewport.removeEventListener('scroll', updateZoom)
      }
      window.removeEventListener('resize', updateZoom)
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return zoomLevel
}

export default function Experience() {
  const planeRef = useRef<THREE.Group>(new THREE.Group())
  const [earthScene, setEarthScene] = useState<THREE.Group | null>(null)
  const [currentLandmark, setCurrentLandmark] = useState<LandmarkConfig | null>(null)
  const [showSpacebarPrompt, setShowSpacebarPrompt] = useState<LandmarkConfig | null>(null)
  const [showPopup, setShowPopup] = useState<LandmarkConfig | null>(null)
  const [showIntro, setShowIntro] = useState(true)
  const [bypassMobileLanding, setBypassMobileLanding] = useState(false)
  
  // Track visited landmarks
  const [visitedLandmarks, setVisitedLandmarks] = useState<Set<string>>(new Set())
  
  // Detect browser zoom level
  const zoomLevel = useZoomLevel()
  
  // Debug: Log currentLandmark changes
  useEffect(() => {
    // currentLandmark state changed
  }, [currentLandmark])

  // Debug zoom changes
  useEffect(() => {
    // Zoom level changed
  }, [zoomLevel])

    const handleLandmarkNear = (baseLandmark: Omit<LandmarkConfig, 'component'>) => {
    // Find the full landmark config with component
    const landmark = updatedLandmarkConfig.find(l => l.name === baseLandmark.name)
    if (landmark) {
    // Landmark handler called
    setShowSpacebarPrompt(landmark)
    setCurrentLandmark(landmark)
    }
  }

  const handleSpacebarPressed = () => {
    // Space pressed, opening popup
    // Keep the spacebar prompt visible so user can re-enter after closing popup
    setShowPopup(currentLandmark)
    
    // Mark landmark as visited
    if (currentLandmark) {
      setVisitedLandmarks(prev => {
        const newSet = new Set(prev)
        newSet.add(currentLandmark.name)
        // Landmark visited
        return newSet
      })
    }
  }

  const handleClosePrompt = () => {
    setShowSpacebarPrompt(null)
    setCurrentLandmark(null)
  }

  const handleClosePopup = () => {
    setShowPopup(null)
  }

  const handleLandmarkLeft = () => {
    // Landmark left - dismissing prompts
    setShowSpacebarPrompt(null)
    setCurrentLandmark(null)
  }

  const handleEnterWorld = () => {
    setShowIntro(false)
    
    // Ensure the window is focused for keyboard events
    if (typeof window !== 'undefined') {
      window.focus()
      
      // Also ensure the document has focus
      if (document.body) {
        document.body.focus()
        document.body.click() // Some browsers need a click to enable keyboard events
      }
    }
  }

  // Debug earthScene state
  useEffect(() => {
    // EarthScene state changed
  }, [earthScene])
  
  return (
    <WebGLErrorBoundary>
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
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false
        }}
        onCreated={({ gl }) => {
          const context = gl.getContext() as WebGLRenderingContext
          if (context) {
            // WebGL context created successfully
          }
        }}
        onError={() => {
          // Canvas error occurred
        }}
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
      
      {/* Mobile joystick controls */}
      <MobileControls disabled={!!showPopup} />
      
      {/* Visited landmarks tracker - desktop only */}
      <VisitedLandmarks 
        visitedLandmarks={visitedLandmarks}
        totalLandmarks={landmarkConfig.length}
      />
      
      {/* Background Music - part of world entrance animation */}
      <BackgroundMusic isInWorld={!showIntro} />
      
      {/* Spacebar prompt - always visible when near a landmark */}
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

      {/* Image Preloader - starts preloading images as soon as user enters world */}
      <ImagePreloader isInWorld={!showIntro} />
      
      {/* Show intro screen on top when needed */}
      {showIntro && <IntroScreen onEnter={handleEnterWorld} />}
      
      {/* Mobile landing page - shows on mobile devices */}
      {SHOW_MOBILE_LANDING && !bypassMobileLanding && (
        <MobileLandingPage 
          onProceedAnyway={() => setBypassMobileLanding(true)}
        />
      )}
    </WebGLErrorBoundary>
  )
}