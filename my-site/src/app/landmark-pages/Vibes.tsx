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
      {/* Shanghai-inspired gold/amber backdrop */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-amber-100/70 via-yellow-100/60 to-orange-200/70 backdrop-blur-sm transition-all duration-500 ${
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
        {/* Main content container with Shanghai-inspired gold styling */}
        <div className="relative bg-gradient-to-br from-amber-50/95 via-yellow-50/95 to-orange-50/95 backdrop-blur-md overflow-hidden break-words"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(245, 158, 11, 0.4)'
             }}>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 md:w-12 md:h-12 rounded-full 
                       bg-stone-100/80 hover:bg-white/90 transition-all duration-300 
                       flex items-center justify-center text-stone-600 hover:text-stone-800
                       shadow-lg hover:shadow-xl border border-stone-200/50 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content area */}
          <div className="break-words p-12 overflow-y-auto max-h-[95vh]">
            
            {/* Header */}
            <div className="break-words text-center break-words mb-16">

              <p className="break-words text-2xl md:text-3xl lg:text-4xl font-semibold text-stone-600 tracking-wide leading-relaxed break-words">
                Inspiration
              </p>
            </div>

            {/* Main content */}
            <div className="max-w-4xl mx-auto break-words">
              <div className="relative bg-gradient-to-br from-amber-100/70 via-yellow-50/70 to-orange-100/70 p-12 text-left break-words overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(245, 158, 11, 0.3)'
                   }}>
                
                <h2 className="break-words text-3xl md:text-4xl lg:text-6xl font-extrabold text-stone-800 mb-8 tracking-tight">
                  I wanted to fly.
                </h2>
                
                <div className="break-words text-xl md:text-2xl lg:text-3xl text-stone-700 leading-relaxed break-words space-y-8">
                  <p>
                    That was my childhood dream. I would always think about it. I would make every type of paper airplane possible, ran parkour over our elementary school roof, and jumped off of way too many tall structures to chase that dream.
                    I still remember when my cousin offered me to fly his drone before school in 2nd grade right before I subsequently crashed it into the ground.
                  </p>
                  <div className="my-8 flex justify-center">
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-stone-400 to-transparent"></div>
                  </div>
                  As I grew older, I developed a larger interest in the systems that power the world and specifically the ones that impact Mother Earth. As I was thinking about how to build out my personal site, it seemed to make sense to create a modal for flight (plane) over my interest in climate (earth). I chose 5 locations that were important to me: Saratoga (where I grew up), SF (startup central), Chicago (where I went to college), Zurich (where I studied abroad) and Shanghai (my ancestral home).

                  <div className="my-8 flex justify-center">
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-stone-400 to-transparent"></div>
                  </div>
                  
                  <p>
                    I have a lot of dreams and am actively working to bring them to life. Thanks for viewing my site :D and my message to you is this: keep dreaming because those dreams impact more people than you would think.
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