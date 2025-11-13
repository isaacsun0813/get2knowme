'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ControlKey {
  key: string
  label: string
  icon?: string
}

const controls: ControlKey[] = [
  { key: 'W', label: 'Speed Up' },
  { key: 'A', label: 'Turn Left' },
  { key: 'D', label: 'Turn Right' }
]

export default function FlightControls() {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    setIsClient(true)
    
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      
      const shouldHide = isSmallScreen || isMobileUserAgent || isIOS || isTouchDevice
      setIsMobile(shouldHide)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Track multiple key presses for visual feedback
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (['W', 'A', 'D'].includes(key)) {
        setPressedKeys(prev => new Set(prev).add(key))
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (['W', 'A', 'D'].includes(key)) {
        setPressedKeys(prev => {
          const newSet = new Set(prev)
          newSet.delete(key)
          return newSet
        })
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  if (!isClient) return null
  if (isMobile || (typeof window !== 'undefined' && window.innerWidth <= 480)) {
    return null
  }

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-30"
      initial={{ opacity: 0, x: -20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: 0.4
      }}
    >
      {/* Glass morphism container with HUD aesthetic */}
      <div className="relative">
        {/* Subtle border animation - altitude-style */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,197,253,0.05) 50%, rgba(59,130,246,0.1) 100%)',
            backgroundSize: '200% 200%'
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Main container */}
        <div className="relative bg-white/75 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/40">
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
          
          {/* Title */}
          <div className="relative mb-4">
            <h3 
              className="text-xs font-semibold uppercase tracking-[0.2em] text-center"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#374151',
                letterSpacing: '0.2em'
              }}
            >
              Flight Controls
            </h3>
            {/* Subtle underline accent */}
            <div className="mt-2 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
          </div>

          {/* Control keys */}
          <div className="space-y-2.5">
            {controls.map((control, index) => {
              const isPressed = pressedKeys.has(control.key)
              
              return (
                <motion.div
                  key={control.key}
                  className="relative"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.5 + index * 0.1,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25
                  }}
                >
                  {/* 3D Soft Key Button */}
                  <motion.div
                    className={`
                      relative flex items-center gap-3
                      px-4 py-2.5
                      rounded-xl
                      cursor-default
                      transition-all duration-200
                      ${isPressed 
                        ? 'bg-gradient-to-br from-blue-100 to-blue-50 shadow-inner' 
                        : 'bg-gradient-to-br from-gray-50/80 to-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                      }
                    `}
                    animate={{
                      scale: isPressed ? 0.95 : 1,
                      y: isPressed ? 2 : 0,
                      boxShadow: isPressed 
                        ? 'inset 0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.05)'
                        : '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25
                    }}
                    whileHover={{
                      scale: 1.02,
                      y: -1,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)'
                    }}
                  >
                    {/* Key badge */}
                    <motion.div
                      className={`
                        relative flex items-center justify-center
                        w-10 h-10
                        rounded-lg
                        font-bold
                        text-sm
                        tabular-nums
                        ${isPressed
                          ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg'
                          : 'bg-gradient-to-br from-gray-700 to-gray-600 text-white shadow-md'
                        }
                      `}
                      style={{
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                      animate={{
                        scale: isPressed ? 0.9 : 1,
                        boxShadow: isPressed
                          ? '0 4px 12px rgba(59,130,246,0.4), inset 0 1px 2px rgba(255,255,255,0.2)'
                          : '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)'
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25
                      }}
                    >
                      {/* Key highlight */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                      <span className="relative z-10">{control.key}</span>
                    </motion.div>

                    {/* Label */}
                    <span 
                      className="text-sm font-medium"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        color: isPressed ? '#1e40af' : '#4b5563',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {control.label}
                    </span>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
