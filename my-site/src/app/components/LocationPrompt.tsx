'use client'

import { useEffect, useState } from 'react'
import { User, Briefcase, Rocket, Heart, Mountain } from 'lucide-react'

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
  onClose: _,
  onSpacePressed
}: LocationPromptProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unused = _;
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
    // LocationPrompt useEffect - landmark updated
    if (landmark) {
              // Setting popup visible
      setIsVisible(true)
    } else {
              // Hiding popup
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
      icon: User,
      spaceButton: 'bg-gradient-to-r from-sky-400 to-blue-500'
    },
    'Career': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: Briefcase,
      spaceButton: 'bg-gradient-to-r from-blue-400 to-blue-600'
    },
    'Ambition': {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: Rocket,
      spaceButton: 'bg-gradient-to-r from-gray-400 to-gray-600'
    },
    'Inspiration': {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      icon: Heart,
      spaceButton: 'bg-gradient-to-r from-amber-400 to-orange-500'
    },
    'Adventure': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: Mountain,
      spaceButton: 'bg-gradient-to-r from-green-400 to-green-600'
    }
  }[landmark.subtitle] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: User,
    spaceButton: 'bg-gradient-to-r from-gray-400 to-gray-600'
  }

  const IconComponent = styling.icon

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 sm:pb-6 z-50 pointer-events-none">
      <div 
        className={`${styling.bg} ${styling.text} px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl shadow-lg backdrop-blur-sm border border-white/60 ${
          isMobile ? 'pointer-events-auto cursor-pointer active:scale-95 transition-transform' : ''
        }`}
        onClick={isMobile ? handleTap : undefined}
        onTouchStart={isMobile ? handleTap : undefined}
      >
        <div className="text-center">
          <div className="flex justify-center mb-1 sm:mb-2">
            <IconComponent size={16} className={`${styling.text} sm:w-5 sm:h-5`} />
          </div>
          <h2 className={`text-xs sm:text-sm md:text-base font-bold mb-1 ${styling.text} font-mono uppercase tracking-wide`}>
            {landmark.displayName}
          </h2>
          <h3 className={`text-xs sm:text-sm font-semibold mb-2 ${styling.text} font-mono uppercase tracking-wider opacity-80`}>
            {landmark.subtitle}
          </h3>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {isMobile ? (
              <>
                <span className={`text-xs sm:text-sm font-semibold ${styling.text} font-mono uppercase tracking-wide`}>
                  Tap to Explore
                </span>
              </>
            ) : (
              <>
                <span className={`text-xs sm:text-sm font-semibold ${styling.text} font-mono uppercase tracking-wide`}>Press</span>
                <kbd className={`${styling.spaceButton} text-white px-2 py-1 sm:px-3 sm:py-1 rounded font-mono font-bold text-xs sm:text-sm shadow-md animate-pulse`}>
                  SPACE
                </kbd>
                <span className={`text-xs sm:text-sm font-semibold ${styling.text} font-mono uppercase tracking-wide`}>to Explore</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 