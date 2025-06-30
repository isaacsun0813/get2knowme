'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

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
      {/* Vibes themed backdrop */}
      <div 
        className={`absolute inset-0 theme-vibes theme-backdrop backdrop-blur-sm transition-all duration-500 ${
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
        {/* Main content container with cohesive Vibes styling */}
        <div className="relative theme-vibes theme-container backdrop-blur-md overflow-hidden break-words"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(255, 155, 114, 0.3)'
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
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <Star size={40} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" style={{ color: 'var(--color-sunset-orange)' }} />
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight" style={{ color: 'var(--color-sunset-orange)' }}>Inspiration</h1>
              </div>
              <div className="landmark-divider"></div>
            </div>

            {/* Main content */}
            <div className="max-w-4xl mx-auto break-words">
              <div className="relative theme-vibes theme-card landmark-card text-left break-words overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)'
                   }}>
                
                <h2 className="break-words font-extrabold text-stone-800 mb-8 tracking-tight">
                  I wanted to fly.
                </h2>
                
                <div className="break-words text-xl text-black leading-relaxed break-words space-y-6">
                  <p>
                  That was my childhood dream. I would always think about it. I made every type of paper airplane possible, ran parkour over our elementary school roof, and jumped off way too many tall structures chasing that dream. I still remember when my cousin let me fly his drone before school in 2nd grade, right before I crashed it into the ground.                  </p>
                  <div className="my-8 flex justify-center">
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-stone-400 to-transparent"></div>
                  </div>
                  <p>
                  As I grew older, I became more interested in the systems that power the world, especially the ones that impact Mother Earth. When I was thinking about how to build my personal site, it felt fitting to center it around the theme of flight (planes) and my passion for climate (Earth). I chose five locations that shaped me: Saratoga (where I grew up), SF (startup central), Chicago (where I went to college), Zurich (where I studied abroad), and Shanghai (my ancestral home).
                  </p>
                  <div className="my-8 flex justify-center">
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-stone-400 to-transparent"></div>
                  </div>
                  
                  <p>
                  I have a lot of dreams and I&apos;m actively working to bring them to life. Thanks for visiting my site :D                </p>
                </div>
                

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
} 