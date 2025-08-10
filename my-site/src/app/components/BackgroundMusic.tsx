'use client'

import { useEffect, useRef, useState } from 'react'

interface BackgroundMusicProps {
  isInWorld: boolean // true when user enters the 3D world
}

export default function BackgroundMusic({ isInWorld }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3) // Default to 30% volume
  const [isMuted, setIsMuted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false) // Track if user has manually controlled music

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768
      
      // More strict mobile detection - require both touch AND small screen AND (mobile user agent OR very small screen)
      const isTrulyMobile = isMobileDevice || (isTouchDevice && isSmallScreen && window.innerWidth <= 480)
      
      // Mobile detection completed
      
      return isTrulyMobile
    }
    
    setIsMobile(checkMobile())
  }, [])

  // Handle automatic music start/stop based on world entry (only if user hasn't manually interacted)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || isMobile || hasUserInteracted) return // Don't auto-control if user has taken manual control

    if (isInWorld) {
      // Auto-start when entering world (only if user hasn't manually controlled)
      audio.volume = 0
      audio.play().then(() => {
        setIsPlaying(true)
        fadeIn(audio, volume)
      }).catch(() => {
        // Audio play failed silently
      })
    } else {
      // Auto-stop when leaving world (only if user hasn't manually controlled)
      fadeOut(audio, () => {
        audio.pause()
        setIsPlaying(false)
      })
    }
  }, [isInWorld, isMobile, hasUserInteracted, volume])

  const fadeIn = (audio: HTMLAudioElement, targetVolume: number) => {
    const fadeStep = targetVolume / 30 // 30 steps over ~1 second
    const fadeInterval = setInterval(() => {
      if (audio.volume < targetVolume - fadeStep) {
        audio.volume = Math.min(audio.volume + fadeStep, targetVolume)
      } else {
        audio.volume = targetVolume
        clearInterval(fadeInterval)
      }
    }, 33) // ~30fps
  }

  const fadeOut = (audio: HTMLAudioElement, callback: () => void) => {
    const fadeStep = audio.volume / 30
    const fadeInterval = setInterval(() => {
      if (audio.volume > fadeStep) {
        audio.volume = Math.max(audio.volume - fadeStep, 0)
      } else {
        audio.volume = 0
        clearInterval(fadeInterval)
        callback()
      }
    }, 33)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const togglePlayPause = () => {
    // togglePlayPause called
    
    // Mark that user has manually interacted with music controls
    setHasUserInteracted(true)
    
    if (audioRef.current) {
      if (isPlaying) {
        // Manually pausing music
        // Instant pause for manual control
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        // Manually playing music
        // Instant play for manual control
        audioRef.current.volume = volume // Set to target volume immediately
        audioRef.current.play().then(() => {
          setIsPlaying(true)
        }).catch(() => {
          // Audio play failed silently
        })
      }
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = newVolume
    }
  }

    // Don't render controls on mobile
  if (isMobile) {
    return null
  }

  // Show controls when in world - just like other panels
  const shouldShowControls = isInWorld

  // BackgroundMusic render

  return (
    <>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="/audio/background-music.mp3"
      />
      
      {/* Music Controls */}
      {shouldShowControls && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-30">
          <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 transition-all duration-300 ease-out">
          {/* Music Label - SMALLER */}
          <div className="text-center mb-2">
            <span className="text-gray-700 font-semibold text-xs sm:text-sm tracking-wider uppercase">Music</span>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {/* Play/Pause Button - SMALLER */}
            <button
              onClick={togglePlayPause}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-gray-800 shadow-md group hover:-translate-y-0.5 hover:scale-105 active:scale-95"
              title={isPlaying ? "Pause Music" : "Play Music"}
            >
              {/* Simple toggle between play and pause icons */}
              {(() => {
                // Rendering button
                return isPlaying ? (
                  // Pause Icon (two bars) - shows when music IS playing
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 7v10m4-10v10" />
                  </svg>
                ) : (
                  // Play Icon (triangle) - shows when music is NOT playing
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l8 7-8 7V5z" />
                  </svg>
                )
              })()}
            </button>

            {/* Mute/Unmute Button - SMALLER */}
            <button
              onClick={toggleMute}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-gray-800 shadow-md hover:-translate-y-0.5 hover:scale-105 active:scale-95"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Volume Slider - SMALLER */}
          <div className="mt-2 flex justify-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 sm:w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer music-slider"
            />
          </div>
        </div>
        </div>
      )}

      <style jsx>{`
        .music-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #6b7280;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }
        .music-slider::-webkit-slider-thumb:hover {
          background: #4b5563;
          transform: scale(1.1);
        }
        .music-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #6b7280;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        .music-slider::-moz-range-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </>
  )
} 