'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music2 } from 'lucide-react'

interface BackgroundMusicProps {
  isInWorld: boolean
}

export default function BackgroundMusic({ isInWorld }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [isMuted, setIsMuted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      // Only hide on ACTUAL mobile devices, not small desktop windows
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Only consider it mobile if it's actually a mobile device
      // Require mobile user agent AND touch (unless iOS)
      const isTrulyMobile = isIOS || (isMobileDevice && hasTouch)
      return isTrulyMobile
    }
    
    setIsMobile(checkMobile())
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || isMobile || hasUserInteracted) return

    if (isInWorld) {
      audio.volume = 0
      audio.play().then(() => {
        setIsPlaying(true)
        fadeIn(audio, volume)
      }).catch(() => {})
    } else {
      fadeOut(audio, () => {
        audio.pause()
        setIsPlaying(false)
      })
    }
  }, [isInWorld, isMobile, hasUserInteracted, volume])

  const fadeIn = (audio: HTMLAudioElement, targetVolume: number) => {
    const fadeStep = targetVolume / 30
    const fadeInterval = setInterval(() => {
      if (audio.volume < targetVolume - fadeStep) {
        audio.volume = Math.min(audio.volume + fadeStep, targetVolume)
      } else {
        audio.volume = targetVolume
        clearInterval(fadeInterval)
      }
    }, 33)
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
      setHasUserInteracted(true)
    }
  }

  const togglePlayPause = () => {
    setHasUserInteracted(true)
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.volume = volume
        audioRef.current.play().then(() => {
          setIsPlaying(true)
        }).catch(() => {})
      }
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setHasUserInteracted(true)
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = newVolume
    }
  }

  if (isMobile) {
    return null
  }

  if (!isInWorld) {
    return null
  }

  return (
    <>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="/audio/background-music.mp3"
      />
      
      <motion.div
        className="fixed z-30"
        style={{
          bottom: 'var(--music-controls-bottom)',
          right: 'var(--music-controls-right)',
          width: 'var(--music-controls-width)'
        }}
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 25,
          delay: 0.5
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Cassette Tape Design */}
        <div 
          className="relative bg-white/75 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/40"
          style={{
            padding: 'var(--music-controls-padding)'
          }}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-xl bg-white/20 pointer-events-none" />
          
          {/* Title */}
          <div className="relative mb-3">
            <div className="flex items-center justify-center gap-1.5">
              {/* Music icon with pulse */}
              <motion.div
                animate={{
                  scale: isPlaying ? [1, 1.15, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut'
                }}
              >
                <Music2 
                  size={14} 
                  style={{ color: '#6b7280' }}
                />
              </motion.div>
              <span 
                className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: '#374151',
                  letterSpacing: '0.2em'
                }}
              >
                Music
              </span>
            </div>
            <div className="mt-1.5 h-px bg-gray-300/50" />
          </div>

          {/* Cassette Tape Body */}
          <div className="relative">
            {/* Main cassette body */}
            <div className="relative bg-gray-800 rounded-lg p-3 shadow-inner">
              {/* Cassette window (tape reels visible) */}
              <div className="relative bg-black rounded-lg p-2.5 mb-2.5 overflow-hidden">
                {/* Tape reels animation */}
                <div className="flex justify-between items-center" style={{ minWidth: 0 }}>
                  {/* Left reel */}
                  <motion.div
                    className="w-10 h-10 rounded-full border-[3px] border-gray-600 relative flex-shrink-0"
                    style={{
                      aspectRatio: '1 / 1',
                      minWidth: '2.5rem',
                      minHeight: '2.5rem'
                    }}
                    animate={{
                      rotate: isPlaying ? 360 : 0
                    }}
                    transition={{
                      duration: 2,
                      repeat: isPlaying ? Infinity : 0,
                      ease: 'linear'
                    }}
                  >
                    {/* Reel center */}
                    <div 
                      className="absolute inset-1.5 rounded-full bg-gray-800 border-2 border-gray-700"
                      style={{
                        aspectRatio: '1 / 1'
                      }}
                    />
                    {/* Reel spokes */}
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-0"
                        style={{
                          transform: `rotate(${i * 90}deg)`,
                        }}
                      >
                        <div className="absolute top-0 left-1/2 w-0.5 h-1.5 bg-gray-600 -translate-x-1/2" />
                      </div>
                    ))}
                  </motion.div>

                  {/* Tape path */}
                  <div className="flex-1 h-0.5 bg-gray-600 mx-2 rounded" />

                  {/* Right reel */}
                  <motion.div
                    className="w-10 h-10 rounded-full border-[3px] border-gray-600 relative flex-shrink-0"
                    style={{
                      aspectRatio: '1 / 1',
                      minWidth: '2.5rem',
                      minHeight: '2.5rem'
                    }}
                    animate={{
                      rotate: isPlaying ? -360 : 0
                    }}
                    transition={{
                      duration: 2,
                      repeat: isPlaying ? Infinity : 0,
                      ease: 'linear'
                    }}
                  >
                    {/* Reel center */}
                    <div 
                      className="absolute inset-1.5 rounded-full bg-gray-800 border-2 border-gray-700"
                      style={{
                        aspectRatio: '1 / 1'
                      }}
                    />
                    {/* Reel spokes */}
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-0"
                        style={{
                          transform: `rotate(${i * 90}deg)`,
                        }}
                      >
                        <div className="absolute top-0 left-1/2 w-0.5 h-1.5 bg-gray-600 -translate-x-1/2" />
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Control buttons row */}
              <div className="flex items-center justify-center gap-2.5">
                {/* Play/Pause button */}
                <motion.button
                  onClick={togglePlayPause}
                  className={`
                    relative
                    w-8 h-8
                    rounded-lg
                    flex items-center justify-center
                    transition-all duration-300
                    ${isPlaying 
                      ? 'bg-blue-500 shadow-lg' 
                      : 'bg-gray-600 shadow-md'
                    }
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    boxShadow: isPlaying 
                      ? '0 4px 16px rgba(59,130,246,0.4), inset 0 1px 2px rgba(255,255,255,0.2)'
                      : '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <span className="relative z-10 text-white">
                    {isPlaying ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </span>
                </motion.button>

                {/* Mute/Unmute button */}
                <motion.button
                  onClick={toggleMute}
                  className={`
                    relative
                    w-7 h-7
                    rounded-lg
                    flex items-center justify-center
                    transition-all duration-200
                    ${isMuted 
                      ? 'bg-red-500' 
                      : 'bg-gray-600'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMuted ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Volume Slider - appears on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Volume icon */}
                    <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    
                    {/* Slider */}
                    <div className="flex-1 relative">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer volume-slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                        }}
                      />
                    </div>
                    
                    {/* Volume percentage */}
                    <span 
                      className="text-[10px] tabular-nums flex-shrink-0 w-8 text-right text-gray-400"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    >
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(59,130,246,0.4);
          transition: all 0.2s ease;
        }
        .volume-slider::-webkit-slider-thumb:hover {
          background: #2563eb;
          transform: scale(1.15);
          box-shadow: 0 3px 8px rgba(59,130,246,0.5);
        }
        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(59,130,246,0.4);
        }
        .volume-slider::-moz-range-thumb:hover {
          background: #2563eb;
          transform: scale(1.15);
        }
      `}</style>
    </>
  )
}
