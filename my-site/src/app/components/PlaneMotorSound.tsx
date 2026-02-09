'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface PlaneMotorSoundProps {
  planeRef: React.RefObject<THREE.Group | null>
  isInWorld: boolean
}

export default function PlaneMotorSound({ planeRef, isInWorld }: PlaneMotorSoundProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const isPlayingRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Set up audio properties
    audio.loop = true
    audio.volume = 0.4 // Adjust volume as needed
    audio.preload = 'auto'

    // Check plane speed and play/pause accordingly
    const checkSpeed = () => {
      if (!planeRef.current || !isInWorld) {
        // Pause if plane doesn't exist or we're not in world
        if (isPlayingRef.current) {
          audio.pause()
          isPlayingRef.current = false
        }
        return
      }

      const speed = planeRef.current.userData.speed || 0
      const isMoving = speed > 0.1 // Small threshold to avoid flickering

      if (isMoving && !isPlayingRef.current) {
        // Start playing motor sound
        audio.play().catch((error) => {
          // Auto-play may be blocked, but that's okay - it will play when user interacts
          console.log('Motor sound play blocked:', error)
        })
        isPlayingRef.current = true
      } else if (!isMoving && isPlayingRef.current) {
        // Stop playing motor sound
        audio.pause()
        audio.currentTime = 0 // Reset to start for next play
        isPlayingRef.current = false
      }

      // Adjust volume based on speed (optional - makes it more dynamic)
      if (isMoving && speed > 0) {
        const maxSpeed = 60 // Match Plane.tsx maxSpeed
        const speedRatio = Math.min(speed / maxSpeed, 1)
        // Volume ranges from 0.2 to 0.5 based on speed
        audio.volume = 0.2 + (speedRatio * 0.3)
      }
    }

    // Check speed on every frame
    const animate = () => {
      checkSpeed()
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start checking
    animate()

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      isPlayingRef.current = false
    }
  }, [planeRef, isInWorld])

  // Clean up when component unmounts
  useEffect(() => {
    const audio = audioRef.current
    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [])

  return (
    <audio
      ref={audioRef}
      src="/audio/plane-motor.mp3"
      preload="auto"
    />
  )
}
