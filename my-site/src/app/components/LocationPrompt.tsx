'use client'

import { useEffect, useState } from 'react'

// Type for landmark configuration
export type LandmarkConfig = {
  name: string
  displayName: string
  subtitle: string
  component: React.ComponentType<{ isOpen: boolean; onClose: () => void }>
  triggerDistance: number
}

interface LocationPromptProps {
  landmark: LandmarkConfig | null
  onClose: () => void
  onSpacePressed: () => void
}

export default function LocationPrompt({ 
  landmark, 
  onClose,
  onSpacePressed
}: LocationPromptProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768
      
      setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    console.log('🎪 LocationPrompt useEffect - landmark:', landmark)
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
        onSpacePressed()
      }
    }

    if (isVisible && !isMobile) {
      window.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isVisible, landmark, onSpacePressed, isMobile])

  // Handle tap/click on mobile
  const handleTap = () => {
    if (landmark) {
      onSpacePressed()
    }
  }

  if (!isVisible || !landmark) return null

  // Define styling based on landmark
  const styling = {
    'About Me': {
      bg: 'bg-sky-100',
      text: 'text-sky-800',
      emoji: '🏡',
      spaceButton: 'bg-gradient-to-r from-sky-400 to-blue-500'
    },
    'Career': {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      emoji: '💼',
      spaceButton: 'bg-gradient-to-r from-purple-400 to-purple-600'
    },
    'Ambition': {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      emoji: '🚀',
      spaceButton: 'bg-gradient-to-r from-gray-400 to-gray-600'
    },
    'Home': {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      emoji: '🏠',
      spaceButton: 'bg-gradient-to-r from-orange-400 to-orange-600'
    },
    'Inspiration': {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      emoji: '·⁀ ༄.°✈ ₊⭒˚｡⋆',
      spaceButton: 'bg-gradient-to-r from-amber-400 to-orange-500'
    },
    'Adventure': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      emoji: '🏔️',
      spaceButton: 'bg-gradient-to-r from-green-400 to-green-600'
    }
  }[landmark.subtitle] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    emoji: '📍',
    spaceButton: 'bg-gradient-to-r from-gray-400 to-gray-600'
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8 z-50 pointer-events-none">
      <div 
        className={`${styling.bg} ${styling.text} px-8 py-6 rounded-2xl shadow-xl backdrop-blur-sm border-2 border-white/60 ${
          isMobile ? 'pointer-events-auto cursor-pointer active:scale-95 transition-transform' : ''
        }`}
        onClick={isMobile ? handleTap : undefined}
        onTouchStart={isMobile ? handleTap : undefined}
      >
        <div className="break-words text-center break-words">
          <div className="break-words text-3xl mb-3">{styling.emoji}</div>
          <h2 className={`text-2xl font-bold mb-2 ${styling.text} font-mono uppercase tracking-wider`}>
            {landmark.displayName}
          </h2>
          <h3 className={`text-lg font-bold mb-4 ${styling.text} font-mono uppercase tracking-widest opacity-80`}>
            {landmark.subtitle}
          </h3>
          <div className="flex items-center justify-center gap-3">
            {isMobile ? (
              <>
                <span className={`text-base font-semibold ${styling.text} font-mono uppercase tracking-wide`}>
                  Tap to Explore
                </span>
              </>
            ) : (
              <>
                <span className={`text-base font-semibold ${styling.text} font-mono uppercase tracking-wide`}>Press</span>
                <kbd className={`${styling.spaceButton} text-white px-4 py-2 rounded-lg font-mono font-bold text-base shadow-lg animate-pulse`}>
                  SPACE
                </kbd>
                <span className={`text-base font-semibold ${styling.text} font-mono uppercase tracking-wide`}>to Explore</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 