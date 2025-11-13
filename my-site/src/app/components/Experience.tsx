'use client'

import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useRef, useEffect, useState, useCallback } from 'react'

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
    
    // Optimized: Use devicePixelRatio instead of DOM manipulation
    // This avoids creating/removing DOM elements on every check
    return window.devicePixelRatio || 1
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
  const [worldSlidingIn, setWorldSlidingIn] = useState(false)
  
  // Track visited landmarks
  const [visitedLandmarks, setVisitedLandmarks] = useState<Set<string>>(new Set())
  
  // Detect browser zoom level
  const zoomLevel = useZoomLevel()
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleLandmarkNear = useCallback((baseLandmark: Omit<LandmarkConfig, 'component'>) => {
    // Find the full landmark config with component
    const landmark = updatedLandmarkConfig.find(l => l.name === baseLandmark.name)
    if (landmark) {
      setShowSpacebarPrompt(landmark)
      setCurrentLandmark(landmark)
    }
  }, [])

  const handleSpacebarPressed = useCallback(() => {
    setShowPopup(currentLandmark)
    
    // Mark landmark as visited
    if (currentLandmark) {
      setVisitedLandmarks(prev => {
        const newSet = new Set(prev)
        newSet.add(currentLandmark.name)
        return newSet
      })
    }
  }, [currentLandmark])

  const handleClosePrompt = useCallback(() => {
    setShowSpacebarPrompt(null)
    setCurrentLandmark(null)
  }, [])

  const handleClosePopup = useCallback(() => {
    setShowPopup(null)
  }, [])

  const handleLandmarkLeft = useCallback(() => {
    setShowSpacebarPrompt(null)
    setCurrentLandmark(null)
  }, [])

  const handleLaunchWorld = () => {
    setWorldSlidingIn(true)
  }

  const handleEnterWorld = () => {
    // After slide animation completes, hide intro and show world
    setTimeout(() => {
      setShowIntro(false)
      
      // Enhanced focus management for keyboard events (critical for Mac/Safari)
      if (typeof window !== 'undefined') {
        // Focus the window
        window.focus()
        
        // Focus the canvas element for keyboard events
        const canvas = document.querySelector('canvas')
        if (canvas) {
          canvas.setAttribute('tabindex', '0')
          canvas.style.outline = 'none'
          canvas.focus()
          
          // Also click to ensure focus (some browsers need this)
          setTimeout(() => {
            canvas.click()
          }, 100)
        }
        
        // Also ensure the document has focus
        if (document.body) {
          document.body.focus()
        }
        
        // Additional Safari/Mac focus fix
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        if (isSafari || isMac) {
          // Force focus after a short delay for Safari
          setTimeout(() => {
            if (canvas) canvas.focus()
            window.focus()
          }, 200)
        }
      }
    }, 1600) // Slightly after the 1.5s slide animation
  }

  
  return (
    <WebGLErrorBoundary>
      {/* Preload 3D world in background - always rendered but slides in from right when plane flies */}
      <div 
        className={`${showIntro && !worldSlidingIn ? 'pointer-events-none' : ''}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: showIntro && !worldSlidingIn ? 30 : 40,
          opacity: worldSlidingIn ? 1 : (showIntro ? 0 : 1),
          transform: worldSlidingIn ? 'translateX(0)' : (showIntro ? 'translateX(100%)' : 'translateX(0)'),
          transition: worldSlidingIn 
            ? 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.0s cubic-bezier(0.4, 0, 0.6, 1)'
            : 'none',
          willChange: worldSlidingIn ? 'transform, opacity' : 'auto',
        }}
      >
      <Canvas 
        camera={{ 
          position: [0, 5, 10], 
          fov: 50 // Keep camera FOV fixed at 50
        }}
        style={{ 
          background: 'linear-gradient(to bottom, #87CEEB, #B0E0E6)',
          width: '100vw',
          height: '100vh',
          outline: 'none'
        }}
        tabIndex={0}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
          // Enhanced compatibility for newer MacBooks
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: false
        }}
        onCreated={({ gl }) => {
          const context = gl.getContext() as WebGLRenderingContext
          if (context) {
            // WebGL context created successfully
            // Ensure canvas can receive focus for keyboard events
            const canvas = gl.domElement
            if (canvas) {
              canvas.setAttribute('tabindex', '0')
              canvas.style.outline = 'none'
              // Focus canvas after creation (helps with Mac/Safari)
              setTimeout(() => {
                canvas.focus()
              }, 100)
            }
          }
        }}
        onError={(error) => {
          console.error('Canvas error:', error)
        }}
        onClick={() => {
          // Ensure focus when clicking on canvas (important for Mac/Safari)
          const canvas = document.querySelector('canvas')
          if (canvas) {
            canvas.focus()
          }
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
          worldJustAppeared={worldSlidingIn}
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
      {showIntro && <IntroScreen onLaunch={handleLaunchWorld} onEnter={handleEnterWorld} />}
      
      {/* Mobile landing page - shows on mobile devices */}
      {SHOW_MOBILE_LANDING && !bypassMobileLanding && (
        <MobileLandingPage 
          onProceedAnyway={() => setBypassMobileLanding(true)}
        />
      )}
    </WebGLErrorBoundary>
  )
}