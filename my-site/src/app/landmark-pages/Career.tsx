'use client'

import { useEffect, useState } from 'react'

interface CareerProps {
  isOpen: boolean
  onClose: () => void
}

export default function Career({ isOpen, onClose }: CareerProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Small delay to ensure DOM is ready, then start animation
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  if (!shouldRender) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Northwestern-inspired purple backdrop */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-purple-100/70 via-violet-100/60 to-purple-200/70 backdrop-blur-sm transition-all duration-500 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup Container with organic animation */}
      <div 
        className={`relative w-full max-w-6xl max-h-[95vh] mx-4 my-4 transition-all duration-500 ease-out ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Main content container with Northwestern purple styling */}
        <div className="relative bg-gradient-to-br from-purple-50/95 via-violet-50/95 to-white/95 backdrop-blur-md overflow-hidden break-words"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(95, 39, 205, 0.3)' // Northwestern purple
             }}>
          
          {/* Decorative Northwestern-inspired shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200/30 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-violet-200/30 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
          
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
            <div className="break-words text-center break-words mb-6 md:mb-8 lg:mb-12">
              <h1 className="break-words text-stone-700 mb-6 tracking-normal">
                Career
              </h1>
              <p className="break-words text-purple-600 tracking-normal mb-8">
                Backend Developer • Climate Advocate
              </p>
            </div>
              <div className="max-w-4xl mx-auto break-words mb-6 md:mb-8 lg:mb-12">
              <div className="relative bg-gradient-to-br from-purple-100/70 via-violet-50/70 to-purple-100/70 p-10 overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(95, 39, 205, 0.2)' // Northwestern purple
                   }}>
                
                <div className="break-words text-center break-words relative z-10">
                  <div className="inline-flex items-center gap-4 mb-8">
                    <h2 className="break-words text-purple-700">My career goal</h2>
                  </div>
                  
                  <div className="break-words text-stone-600 leading-relaxed break-words space-y-8 break-words">
                    <p className="break-words text-center break-words max-w-4xl mx-auto break-words">
                      <span className="font-medium text-purple-600">Tackle climate and environmental policy</span> challenges through <span className="font-medium text-stone-700">scalable, efficient technology solutions</span>
                    </p>
                  </div>
                </div>
              </div>
              </div>



            <div className="max-w-4xl mx-auto break-words mb-6 md:mb-8 lg:mb-12">
              <div className="relative bg-gradient-to-br from-purple-100/70 via-violet-50/70 to-purple-100/70 p-10 overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(95, 39, 205, 0.2)'
                   }}>
                
                <div className="break-words text-center break-words relative z-10">
                  <div className="inline-flex items-center gap-4 mb-8">
                    <h2 className="break-words text-purple-700">Future Opportunities</h2>
                  </div>
                  
                  <div className="break-words text-stone-600 leading-relaxed break-words space-y-8 break-words">
                    <p className="break-words text-left">
                      I'm interested in <span className="font-medium text-purple-600">climate tech</span> specifically:
                    </p>
                    
                    <div className="max-w-4xl mx-auto break-words">
                      <ul className="space-y-8 break-words text-left ml-8 text-xl md:text-2xl lg:text-3xl">
                        <li className="flex items-start gap-4">
                          <span className="break-words text-purple-600 font-bold">•</span>
                          <span><span className="font-medium text-purple-600">Scope 2 Emissions</span> tracking and optimization platforms</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="break-words text-purple-600 font-bold">•</span>
                          <span><span className="font-medium text-purple-600">Carbon Reduction</span> measurement and verification systems</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="break-words text-purple-600 font-bold">•</span>
                          <span><span className="font-medium text-purple-600">Scalable Data Infrastructure</span></span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Resume Button */}
                    <div className="break-words text-center break-words mt-12">
                      <a 
                        href="https://drive.google.com/file/d/130KQWH7hviU7HDY7dztdG4wLoJAI8ryw/view?usp=sharing" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 
                                 text-white font-medium text-xl md:text-2xl lg:text-3xl rounded-xl shadow-lg hover:shadow-xl 
                                 transform hover:scale-105 transition-all duration-300 hover:from-purple-500 hover:to-violet-500"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Resume
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Non-Career Goals Section - Moved to End */}
            <div className="max-w-4xl mx-auto break-words mb-6 md:mb-8 lg:mb-12">
              <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-10 overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(100, 116, 139, 0.2)'
                   }}>
                
                <div className="break-words text-center break-words relative z-10">
                  <div className="inline-flex items-center gap-4 mb-8">
                    <h2 className="break-words text-slate-700">Other Goals</h2>
                  </div>
                  
                  <div className="break-words text-stone-600 leading-relaxed break-words space-y-8 break-words">
                    <ul className="break-words text-left max-w-4xl mx-auto break-words space-y-8 break-words text-xl md:text-2xl lg:text-3xl">
                      <li className="flex items-start gap-4">
                        <span className="break-words text-slate-600 font-bold">•</span>
                        <span>Paragliding license</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="break-words text-slate-600 font-bold">•</span>
                        <span>Make a beef wellington</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="break-words text-slate-600 font-bold">•</span>
                        <span>Squat 500, bench 300, deadlift 400</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="break-words text-slate-600 font-bold">•</span>
                        <span>Dunk a basketball</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="break-words text-slate-600 font-bold">•</span>
                        <span>Study more sociology</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="break-words text-slate-600 font-bold">•</span>
                        <span>Learn to play euphonium</span>
                      </li>
                                              <li className="flex items-start gap-4">
                          <span className="break-words text-slate-600 font-bold">•</span>
                          <span>Get back into playing the tuba</span>
                        </li>
                      <li className="flex items-start gap-4">
                        <span className="break-words text-slate-600 font-bold">•</span>
                        <span>Do a backflip</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="break-words text-slate-600 font-bold">•</span>
                        <span>Vlog more</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>


        
          </div>
        </div>
      </div>
    </div>
  )
} 