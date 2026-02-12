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
      // Only hide on ACTUAL mobile devices, not small desktop windows
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent)
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      
      // Check for touch device, but require mobile user agent (unless iOS)
      // Don't rely on window size - desktop windows can be resized
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const shouldHide = isIOS || (isMobileUserAgent && hasTouch)
      
      setIsMobile(shouldHide)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Track multiple key presses for visual feedback
    // Use capture phase to catch events early, before they might be stopped
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      const code = e.code || ''
      // Check both key and code for maximum compatibility
      if (['W', 'A', 'D'].includes(key) || ['KeyW', 'KeyA', 'KeyD'].includes(code)) {
        setPressedKeys(prev => new Set(prev).add(key))
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      const code = e.code || ''
      // Check both key and code for maximum compatibility
      if (['W', 'A', 'D'].includes(key) || ['KeyW', 'KeyA', 'KeyD'].includes(code)) {
        setPressedKeys(prev => {
          const newSet = new Set(prev)
          newSet.delete(key)
          return newSet
        })
      }
    }
    
    // Use capture phase to catch events before they might be stopped
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    window.addEventListener('keyup', handleKeyUp, { capture: true })
    // Also add bubble phase as backup
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      window.removeEventListener('keyup', handleKeyUp, { capture: true })
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  if (!isClient) return null
  // Only hide on actual mobile devices, not small desktop windows
  if (isMobile) {
    return null
  }

  return (
      <motion.div
        className="fixed z-30"
        style={{
          bottom: 'var(--flight-controls-bottom)',
          left: 'var(--flight-controls-left)',
          width: 'var(--flight-controls-width)'
        }}
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
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'rgba(59,130,246,0.1)',
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
          <div 
            className="relative bg-white/75 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/40"
            style={{
              padding: 'var(--flight-controls-padding)',
              minWidth: 'fit-content'
            }}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-xl bg-white/20 pointer-events-none" />
            
            {/* Title */}
            <div className="relative mb-2.5">
              <h3 
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-center whitespace-nowrap"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: '#374151',
                  letterSpacing: '0.2em'
                }}
              >
                Flight Controls
              </h3>
              {/* Subtle underline accent */}
              <div className="mt-1.5 h-px bg-blue-300/50" />
            </div>

            {/* Control keys */}
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'var(--flight-controls-gap)',
                alignItems: 'stretch'
              }}
            >
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
                        relative flex items-center gap-2
                        px-2.5 py-1.5
                        rounded-lg
                        cursor-default
                        transition-all duration-200
                        ${isPressed 
                          ? 'bg-blue-100 shadow-inner' 
                          : 'bg-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
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
                          w-7 h-7
                          rounded-md
                          font-bold
                          text-[10px]
                          tabular-nums
                          flex-shrink-0
                          ${isPressed
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-700 text-white shadow-md'
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
                        <div className="absolute inset-0 rounded-lg bg-white/10 pointer-events-none" />
                        <span className="relative z-10">{control.key}</span>
                      </motion.div>

                      {/* Label */}
                      <span 
                        className="text-[11px] font-medium whitespace-nowrap"
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          color: isPressed ? '#1e40af' : '#4b5563',
                          letterSpacing: '0.03em'
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
