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
      
      {/* Main container - WIDER */}
      <div 
        className={`relative w-full max-w-7xl max-h-[95vh] mx-4 my-4 transition-all duration-500 ease-out ${
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
          <div className="break-words p-12 overflow-y-auto max-h-[95vh]">
            
            {/* Header */}
            <div className="break-words text-center break-words mb-16">
              <h1 className="landmark-title" style={{ color: 'var(--color-sky-primary)' }}>Home</h1>
              <div className="landmark-divider"></div>
              <p className="break-words text-2xl md:text-3xl lg:text-4xl font-semibold text-stone-600 tracking-wide leading-relaxed break-words">
                Welcome Home
              </p>
            </div>

            {/* Main content */}
            <div className="max-w-4xl mx-auto break-words">
              <div className="relative theme-home theme-card p-12 text-center break-words overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)'
                   }}>
                
                <h2 className="break-words text-3xl md:text-4xl lg:text-6xl font-extrabold text-stone-800 mb-8 tracking-tight">
                  Coming Soon
                </h2>
                <p className="break-words text-2xl text-stone-700 leading-relaxed break-words">
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