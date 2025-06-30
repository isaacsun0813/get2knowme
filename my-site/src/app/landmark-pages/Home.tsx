'use client'

import { useEffect, useState } from 'react'

interface HomeProps {
  isOpen: boolean
  onClose: () => void
}

export default function Home({ isOpen, onClose }: HomeProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setTimeout(() => setIsAnimating(true), 50)
      document.body.style.overflow = 'hidden'
    } else {
      setIsAnimating(false)
      setTimeout(() => setShouldRender(false), 300)
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
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!shouldRender) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Home themed backdrop */}
      <div 
        className={`absolute inset-0 theme-home theme-backdrop backdrop-blur-sm transition-all duration-500 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Main container - RESPONSIVE */}
      <div 
        className={`relative landmark-container my-2 sm:my-4 transition-all duration-500 ease-out ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Main content container with cohesive Home styling */}
        <div className="relative theme-home theme-container backdrop-blur-md overflow-hidden break-words"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(135, 206, 235, 0.3)'
             }}>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-50 btn-close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

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
    </div>
  )
} 