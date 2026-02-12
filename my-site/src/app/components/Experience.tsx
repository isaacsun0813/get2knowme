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
import EarthModel from './EarthModel'
import SkyDome from './SkyDome'
import MobileLandingPage from './MobileLandingPage'
import BackgroundMusic from './BackgroundMusic'
import ImagePreloader from './ImagePreloader'
import WebGLErrorBoundary from './WebGLErrorBoundary'
import TapToMove from './TapToMove'

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
  
  // Track visited landmarks (currently not displayed but kept for future use)
  const [, setVisitedLandmarks] = useState<Set<string>>(new Set())
  
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
      // Ensure worldSlidingIn is set so world is visible
      setWorldSlidingIn(true)
      
      // Enhanced focus management for keyboard events (critical for Chrome and Safari)
      if (typeof window !== 'undefined') {
        const isChrome = /Chrome/.test(navigator.userAgent) && 
                         !/Edg/.test(navigator.userAgent) && 
                         !/OPR/.test(navigator.userAgent)
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        
        // Focus the window first
        window.focus()
        
        // Focus the canvas element for keyboard events
        const focusCanvas = () => {
          const canvas = document.querySelector('canvas')
          if (canvas) {
            canvas.setAttribute('tabindex', '0')
            canvas.style.outline = 'none'
            canvas.style.cursor = 'default'
            canvas.focus()
          }
        }
        
        // Immediate focus
        focusCanvas()
        
        // Chrome needs more aggressive focus management
        if (isChrome) {
          // Multiple attempts to ensure focus
          setTimeout(focusCanvas, 100)
          setTimeout(focusCanvas, 300)
          setTimeout(focusCanvas, 600)
          setTimeout(focusCanvas, 1000)
          
          // Also click to ensure focus (Chrome sometimes needs this)
          setTimeout(() => {
            const canvas = document.querySelector('canvas')
            if (canvas) {
              canvas.click()
              focusCanvas()
            }
          }, 200)
        }
        
        // Safari/Mac focus fix
        if (isSafari || isMac) {
          setTimeout(() => {
            focusCanvas()
            window.focus()
          }, 200)
        }
        
        // Also ensure the document has focus
        if (document.body) {
          document.body.focus()
        }
      }
    }, 1600) // Slightly after the 1.5s slide animation
  }
  
  // Fallback: If intro is dismissed but worldSlidingIn never triggered, ensure world is visible
  useEffect(() => {
    if (!showIntro && !worldSlidingIn) {
      // Intro was dismissed but transition never happened - show world immediately
      setWorldSlidingIn(true)
    }
  }, [showIntro, worldSlidingIn])
  
  // Chrome-specific: Restore focus after zoom operations
  useEffect(() => {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
    if (!isChrome) return
    
    const handleWheel = (e: WheelEvent) => {
      // If Ctrl+wheel (zoom), restore focus after a delay
      if (e.ctrlKey || e.metaKey) {
        setTimeout(() => {
          const canvas = document.querySelector('canvas')
          if (canvas) {
            canvas.focus()
            window.focus()
          }
        }, 100)
      }
    }
    
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  
  return (
    <WebGLErrorBoundary>
      {/* Preload 3D world in background - always rendered but slides in from right when plane flies */}
      <div 
        className={`${showIntro && !worldSlidingIn ? 'pointer-events-none' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          zIndex: showIntro && !worldSlidingIn ? 30 : 40,
          // Fix: Ensure world is visible when intro is gone, even if worldSlidingIn never triggered
          opacity: (!showIntro || worldSlidingIn) ? 1 : 0,
          transform: (!showIntro || worldSlidingIn) ? 'translateX(0)' : 'translateX(100%)',
          transition: worldSlidingIn 
            ? 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.0s cubic-bezier(0.4, 0, 0.6, 1)'
            : (!showIntro ? 'transform 0.3s ease-out, opacity 0.3s ease-out' : 'none'),
          willChange: worldSlidingIn ? 'transform, opacity' : 'auto',
          overflow: 'hidden'
        }}
      >
      <Canvas 
        camera={{ 
          position: [0, 20, 60], // Start further back and higher to see more of the globe
          fov: 50 // Keep camera FOV fixed at 50
        }}
        style={{ 
          width: '100vw',
          height: '100vh',
          display: 'block'
        }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
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
      
      {/* Tap to Move - Mobile controls */}
      <TapToMove disabled={!!showPopup} />
      
      
      {/* Background Music - part of world entrance animation */}
      <BackgroundMusic isInWorld={!showIntro} />
      
      {/* Spacebar prompt - always visible when near a landmark */}
      <LocationPrompt 
        landmark={showSpacebarPrompt}
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