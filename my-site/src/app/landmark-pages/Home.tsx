'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HomeProps {
  isOpen: boolean
  onClose: () => void
}

export default function Home({ isOpen, onClose }: HomeProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setTimeout(() => setIsAnimating(true), 50)
      document.body.style.overflow = 'hidden'
    } else {
      setIsAnimating(false)
      setTimeout(() => setShouldRender(false), 1000)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleClose = () => {
    // Call onClose immediately to trigger exit animation
    onClose()
  }

  if (!shouldRender) return null

  return (
    <AnimatePresence>
      {shouldRender && (
        <>
          {/* Home themed backdrop - Increased dimming */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50"
            onClick={handleClose}
            style={{
              backdropFilter: 'blur(40px) saturate(0.3)',
              background: 'rgba(0,0,0,0.55)'
            }}
          />
          
          {/* Main container - Gradual appearance */}
          <motion.div
            key="modal"
            initial={{ 
              opacity: 0, 
              scale: 0.92,
              filter: 'blur(12px)'
            }}
            animate={{ 
              opacity: isOpen ? 1 : 0, 
              scale: isOpen ? 1 : 0.92,
              filter: isOpen ? 'blur(0px)' : 'blur(8px)'
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.92,
              filter: 'blur(8px)'
            }}
            transition={{
              duration: 0.8,
              ease: [0.23, 1, 0.32, 1]
            }}
            className="fixed inset-0 z-[52] flex items-start sm:items-center justify-center pt-4 sm:pt-0 pointer-events-none"
          >
            <div className="relative landmark-container my-2 sm:my-4 pointer-events-auto">
        {/* Main content container with cohesive Home styling */}
        <div className="relative theme-home theme-container backdrop-blur-md overflow-hidden break-words"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0px 20px 60px rgba(0,0,0,0.4), 0px 0px 0px 1px rgba(255,255,255,0.8), inset 0px 1px 0px rgba(255,255,255,0.95), 0px 0px 100px rgba(255,255,255,0.4), 0px 0px 0px 2px rgba(37,99,235,0.1)',
               border: '2px solid rgba(135, 206, 235, 0.3)'
             }}>
          
          {/* Close button - Larger */}
          <motion.button
            onClick={handleClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center group"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.5)'
            }}
            whileHover={{ 
              scale: 1.1, 
              rotate: 90,
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)'
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>

          {/* Content area */}
          <div className="break-words landmark-content overflow-y-auto max-h-[95vh]">
            
            {/* Header */}
            <div className="break-words text-center break-words pt-3 sm:pt-4 md:pt-5 pb-4 sm:pb-5 md:pb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4" style={{ color: 'var(--color-sky-primary)' }}>Home</h1>
              <div className="landmark-divider"></div>
              <p className="break-words font-medium text-stone-600 tracking-wide leading-relaxed break-words text-sm sm:text-base md:text-lg mt-3 sm:mt-4">
                Welcome to my interactive world! Click and drag to fly around and discover landmarks that tell my story.
              </p>
            </div>

            {/* Main content */}
            <div className="max-w-4xl mx-auto break-words">
              <div className="relative theme-home theme-card landmark-card text-center break-words overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)'
                   }}>
                
                <h2 className="break-words font-extrabold text-stone-800 mb-8 tracking-tight">
                  Ready to explore?
                </h2>
                <p className="break-words text-stone-700 leading-relaxed break-words">
                  This section is currently under development. Stay tuned for updates!
                </p>
                

              </div>
            </div>

          </div>
        </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 