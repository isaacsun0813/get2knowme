'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Briefcase, Rocket, Heart, Mountain } from 'lucide-react'

export type LandmarkConfig = {
  name: string
  displayName: string
  subtitle: string
  component: React.ComponentType<{ isOpen: boolean; onClose: () => void }>
  triggerDistance: number
}

interface LocationPromptProps {
  landmark: LandmarkConfig | null
  onSpacePressed: () => void
}

export default function LocationPrompt({ 
  landmark, 
  onSpacePressed
}: LocationPromptProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

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
    if (landmark) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [landmark])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && landmark) {
        e.preventDefault()
        setIsPressed(true)
        setTimeout(() => {
          onSpacePressed()
          setIsPressed(false)
        }, 150)
      }
    }

    if (isVisible && !isMobile) {
      window.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isVisible, landmark, onSpacePressed, isMobile])

  const handleTap = () => {
    if (landmark) {
      setIsPressed(true)
      setTimeout(() => {
        onSpacePressed()
        setIsPressed(false)
      }, 150)
    }
  }

  // Generate consistent gate and seat based on landmark name (for performance)
  // Must be called before any conditional returns to follow Rules of Hooks
  const flightDetails = useMemo(() => {
    if (!landmark) return { gate: 'A1', seat: 'B1' }
    
    // Use landmark name hash for consistent values
    const hash = landmark.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const gateNum = (hash % 20) + 1
    const seatLetter = String.fromCharCode(65 + (hash % 6))
    const seatNum = (hash % 30) + 1
    
    return {
      gate: `A${gateNum}`,
      seat: `${seatLetter}${seatNum}`
    }
  }, [landmark])

  const styling = landmark ? {
    'About Me': {
      accent: '#3b82f6',
      icon: User,
      gradient: 'from-blue-50/90 to-sky-50/90'
    },
    'Career': {
      accent: '#2563eb',
      icon: Briefcase,
      gradient: 'from-indigo-50/90 to-blue-50/90'
    },
    'Ambition': {
      accent: '#6366f1',
      icon: Rocket,
      gradient: 'from-purple-50/90 to-indigo-50/90'
    },
    'Inspiration': {
      accent: '#f59e0b',
      icon: Heart,
      gradient: 'from-amber-50/90 to-orange-50/90'
    },
    'Adventure': {
      accent: '#10b981',
      icon: Mountain,
      gradient: 'from-emerald-50/90 to-green-50/90'
    }
  }[landmark?.subtitle] || {
    accent: '#6b7280',
    icon: User,
    gradient: 'from-gray-50/90 to-slate-50/90'
  } : {
    accent: '#6b7280',
    icon: User,
    gradient: 'from-gray-50/90 to-slate-50/90'
  }

  const IconComponent = styling.icon

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
      style={{
        paddingBottom: 'var(--boarding-pass-bottom)'
      }}
    >
      <AnimatePresence mode="wait">
        {isVisible && landmark && (
          <motion.div
            key={landmark.name}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25
            }}
            className={isMobile ? 'pointer-events-auto' : ''}
            onClick={isMobile ? handleTap : undefined}
            onTouchStart={isMobile ? handleTap : undefined}
          >
            {/* Boarding Pass Design - Compact */}
            <div 
              className={`
                relative
bg-white/90
                backdrop-blur-xl
                rounded-xl
                shadow-[0_12px_40px_rgba(0,0,0,0.15)]
                border border-white/50
                mx-auto
                overflow-hidden
              `}
              style={{
                width: 'var(--boarding-pass-width)',
                maxWidth: 'var(--boarding-pass-max-width)'
              }}
            >
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-white/20 pointer-events-none" />
              
              {/* Perforated top edge */}
              <div className="absolute -top-1.5 left-10 right-10 h-0.5 flex gap-0.5 pointer-events-none">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="flex-1 h-full rounded-full bg-white/50" />
                ))}
              </div>

              {/* SunFlights Header - Compact */}
              <div 
                className="relative border-b border-gray-300/30"
                style={{
                  padding: 'var(--boarding-pass-padding)',
                  paddingBottom: 'calc(var(--boarding-pass-padding) * 0.7)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Sun icon - smaller */}
                    <motion.div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: styling.accent,
                      }}
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                      </svg>
                    </motion.div>
                    <div>
                      <h1 
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          color: '#1f2937',
                          letterSpacing: '0.15em'
                        }}
                      >
                        SunFlights
                      </h1>
                      <p 
                        className="text-[9px] text-gray-500 uppercase tracking-widest"
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          letterSpacing: '0.2em'
                        }}
                      >
                        Boarding Pass
                      </p>
                    </div>
                  </div>
                  {/* Icon badge - smaller */}
                  <motion.div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${styling.accent}20`,
                      border: `1.5px solid ${styling.accent}30`
                    }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                      delay: 0.1
                    }}
                  >
                    <IconComponent 
                      size={14} 
                      style={{ 
                        color: styling.accent,
                        display: 'block'
                      }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Main Content - Compact */}
              <div 
                className="relative"
                style={{
                  padding: 'var(--boarding-pass-padding)'
                }}
              >
                {/* Destination - Larger but more compact */}
                <div className="flex flex-col items-center justify-center gap-1 mb-3">
                  <motion.h2
                    className="text-xl font-bold text-center w-full"
                    style={{
                      fontFamily: 'Satoshi, Manrope, system-ui, sans-serif',
                      color: '#1f2937',
                      letterSpacing: '-0.03em',
                      textAlign: 'center'
                    }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {landmark.displayName}
                  </motion.h2>
                </div>

                {/* Flight Details Row - 3 columns with category in middle */}
                <div className="grid grid-cols-3 gap-1.5 md:gap-2.5 mb-3 pb-2.5 border-b border-gray-300/30">
                  <div className="text-center min-w-0">
                    <p 
                      className="text-[8px] md:text-[9px] uppercase tracking-wider mb-0.5 truncate"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        color: '#9ca3af',
                        letterSpacing: '0.1em'
                      }}
                    >
                      Gate
                    </p>
                    <p 
                      className="text-[10px] md:text-xs font-bold tabular-nums"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#374151'
                      }}
                    >
                      {flightDetails.gate}
                    </p>
                  </div>
                  <div className="text-center min-w-0">
                    <p 
                      className="text-[8px] md:text-[9px] uppercase tracking-wider mb-0.5 truncate"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        color: '#9ca3af',
                        letterSpacing: '0.1em'
                      }}
                    >
                      Type
                    </p>
                    <p 
                      className="text-[10px] md:text-xs font-bold truncate"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        color: styling.accent,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {landmark.subtitle}
                    </p>
                  </div>
                  <div className="text-center min-w-0">
                    <p 
                      className="text-[8px] md:text-[9px] uppercase tracking-wider mb-0.5 truncate"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        color: '#9ca3af',
                        letterSpacing: '0.1em'
                      }}
                    >
                      Seat
                    </p>
                    <p 
                      className="text-[10px] md:text-xs font-bold tabular-nums"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#374151'
                      }}
                    >
                      {flightDetails.seat}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <motion.div
                  className="flex items-center justify-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {isMobile ? (
                    <motion.button
                      className={`
                        relative
                        px-6 py-2.5
                        rounded-lg
                        font-semibold
                        text-xs
                        uppercase
                        tracking-wider
                        overflow-hidden
                        w-full
                        ${isPressed ? 'scale-95' : 'scale-100'}
                      `}
                      style={{
                        background: styling.accent,
                        color: 'white',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        boxShadow: `0 4px 16px ${styling.accent}40`
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <span className="relative z-10">Tap to Explore</span>
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: '-100%' }}
                        animate={{ x: isPressed ? '100%' : '-100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  ) : (
                    <>
                      <span 
                        className="text-xs font-medium"
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          color: '#6b7280'
                        }}
                      >
                        Press
                      </span>
                      <motion.kbd
                        className={`
                          relative
                          px-4 py-2.5
                          rounded-lg
                          font-bold
                          text-xs
                          uppercase
                          tracking-wider
                          tabular-nums
                          overflow-hidden
                          ${isPressed ? 'scale-95' : 'scale-100'}
                        `}
                        style={{
                          background: styling.accent,
                          color: 'white',
                          fontFamily: 'JetBrains Mono, monospace',
                          boxShadow: `0 4px 16px ${styling.accent}40`
                        }}
                        animate={{
                          boxShadow: isPressed
                            ? `0 2px 8px ${styling.accent}40`
                            : `0 4px 16px ${styling.accent}40`
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <span>SPACE</span>
                      </motion.kbd>
                      <span 
                        className="text-xs font-medium"
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          color: '#6b7280'
                        }}
                      >
                        to Explore
                      </span>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Perforated bottom edge */}
              <div className="absolute -bottom-1.5 left-10 right-10 h-0.5 flex gap-0.5 pointer-events-none">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="flex-1 h-full rounded-full bg-white/50" />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
