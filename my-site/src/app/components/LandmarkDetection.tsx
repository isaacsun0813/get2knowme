'use client'

import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { LandmarkConfig } from './LocationPrompt'

// Landmark data - configure your landmarks here
// Based on the actual object names found in your Blender scene
// Components will be assigned in Experience.tsx
export const landmarkConfig: Omit<LandmarkConfig, 'component'>[] = [
  {
    name: "Chicago_Pin", 
    displayName: "Chicago",
    subtitle: "Career", 
    triggerDistance: 28  
  },
  {
    name: "San_Francisco_Pin", 
    displayName: "San Francisco",
    subtitle: "Ambition", 
    triggerDistance: 28 
  },
  {
    name: "Saratoga_Pin", 
    displayName: "Saratoga",
    subtitle: "About Me", 
    triggerDistance: 28  
  },
  {
    name: "Shanghai_Pin",
    displayName: "Shanghai",
    subtitle: "Inspiration", 
    triggerDistance: 28  
  },
  {
    name: "Zurich_Pin",
    displayName: "Zurich",
    subtitle: "Adventure", 
    triggerDistance: 28 
  }
]

type BaseLandmarkConfig = Omit<LandmarkConfig, 'component'>

// Helper type for closest landmark tracking
interface ClosestLandmark {
  object: THREE.Object3D
  config: BaseLandmarkConfig
  distance: number
}

interface LandmarkDetectionProps {
  earthScene: THREE.Group | null
  planeRef: React.RefObject<THREE.Group | null>
  onLandmarkNear: (landmark: BaseLandmarkConfig) => void
  onLandmarkLeft: () => void
}

export default function LandmarkDetection({
  earthScene,
  planeRef,
  onLandmarkNear,
  onLandmarkLeft
}: LandmarkDetectionProps) {
  const landmarks = useRef<Array<{ object: THREE.Object3D, config: BaseLandmarkConfig }>>([])
  const currentActiveLandmark = useRef<string | null>(null)
  const lastTriggeredTime = useRef<Record<string, number>>({})

  // Find landmark objects in the scene
  useEffect(() => {
    if (!earthScene) return
    
    landmarks.current = []
    // Reset any existing triggers when scene changes
    currentActiveLandmark.current = null
    lastTriggeredTime.current = {}
    
    earthScene.traverse((child) => {
      const config = landmarkConfig.find(l => l.name === child.name)
      if (config) {
        landmarks.current.push({ object: child, config })
      }
    })
  }, [earthScene])

  // Throttle debug logs
  const debugTimer = useRef<number>(0)
  // Prevent immediate triggering on mount
  const mountTimer = useRef<number>(0)

  useFrame(() => {
    if (!planeRef.current || landmarks.current.length === 0) {
      return
    }

    const planePosition = planeRef.current.position
    debugTimer.current += 0.016 // ~60fps
    mountTimer.current += 0.016 // ~60fps
    
    // Reduce mount timer to 0.5 seconds for faster testing
    if (mountTimer.current < 0.5) {
      return
    }

    // Check if plane position is valid
    if (!planePosition || planePosition.length() === 0) {
      return
    }

    // Find the closest landmark within range
    let closestLandmark: ClosestLandmark | null = null

    landmarks.current.forEach(({ object, config }) => {
      // Check if object position is valid
      if (!object.position) {
        return
      }

      const distance = planePosition.distanceTo(object.position)
      
      // Check for NaN or invalid distances
      if (isNaN(distance) || distance === Infinity) {
        return
      }
      
      // Check if this landmark is in range
      if (distance < config.triggerDistance) {
        // If this is closer than our current closest, update it
        if (!closestLandmark || distance < closestLandmark.distance) {
          closestLandmark = { object, config, distance }
        }
      }
    })

    // Reset debug timer
    if (debugTimer.current > 2.0) {
      debugTimer.current = 0
    }

    const currentTime = Date.now()

    // If we have a closest landmark and it's different from the current active one
    if (closestLandmark) {
      const lm = closestLandmark as ClosestLandmark
      const { config, distance } = lm
      
      // Check if enough time has passed since last trigger (reduce to 3 seconds for testing)
      const lastTriggered = lastTriggeredTime.current[config.name] || 0
      const timeSinceLastTrigger = currentTime - lastTriggered
      
      if (currentActiveLandmark.current !== config.name && timeSinceLastTrigger > 3000) {
        currentActiveLandmark.current = config.name
        lastTriggeredTime.current[config.name] = currentTime
        onLandmarkNear(config)
      }
    } else {
      // No landmarks in range - dismiss popup if we had one active
      if (currentActiveLandmark.current !== null) {
        currentActiveLandmark.current = null
        onLandmarkLeft()
      }
    }

    // Additional check: if we have an active landmark, verify we're still close enough
    // Use a slightly larger dismissal radius (trigger + 5) to prevent flickering
    if (currentActiveLandmark.current !== null) {
      const activeLandmarkData = landmarks.current.find(l => l.config.name === currentActiveLandmark.current)
      if (activeLandmarkData) {
        const dismissalDistance = activeLandmarkData.config.triggerDistance + 5
        const distanceToActive = planePosition.distanceTo(activeLandmarkData.object.position)
        
        if (distanceToActive > dismissalDistance) {
          currentActiveLandmark.current = null
          onLandmarkLeft()
        }
      }
    }
  })

  return null
} 