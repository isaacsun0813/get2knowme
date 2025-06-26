'use client'

import { useEffect, useState } from 'react'

interface VibesProps {
  isOpen: boolean
  onClose: () => void
}

export default function Vibes({ isOpen, onClose }: VibesProps) {
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
      {/* Pink/Purple-themed backdrop for Vibes */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-pink-100/70 via-purple-100/60 to-pink-200/70 backdrop-blur-sm transition-all duration-500 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Main container */}
      <div 
        className={`relative w-full max-w-[95vw] max-h-[95vh] mx-4 my-4 transition-all duration-500 ease-out ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Main content container with consistent styling */}
        <div className="relative bg-gradient-to-br from-pink-50/95 via-purple-50/95 to-white/95 backdrop-blur-md overflow-hidden"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(236, 72, 153, 0.3)'
             }}>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full 
                       bg-stone-100/80 hover:bg-white/90 transition-all duration-300 
                       flex items-center justify-center text-stone-600 hover:text-stone-800
                       shadow-lg hover:shadow-xl border border-stone-200/50 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content area */}
          <div className="p-12 overflow-y-auto max-h-[95vh]">
            
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-[8rem] lg:text-[12rem] xl:text-[14rem] font-extrabold text-stone-800 mb-12 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                ✨
              </h1>
              <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-12"></div>
              <p className="text-4xl font-semibold text-stone-600 tracking-wide leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Good Vibes Only
              </p>
            </div>

            {/* Main content */}
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-br from-pink-100/70 via-purple-50/70 to-pink-100/70 p-12 text-center overflow-hidden"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(236, 72, 153, 0.2)'
                   }}>
                
                <h2 className="text-6xl font-extrabold text-stone-800 mb-8 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Coming Soon
                </h2>
                <p className="text-2xl text-stone-700 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  I have no idea what to put here. tbd!
                </p>
                
                <div className="mt-12">
                  <p className="text-lg text-stone-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Press <span className="bg-stone-200 text-stone-800 px-3 py-1 rounded-lg font-semibold">ESC</span> 
                    or click outside to close
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
} 