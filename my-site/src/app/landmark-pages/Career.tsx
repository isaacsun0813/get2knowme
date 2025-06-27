'use client'

import { useEffect, useState } from 'react'
import { Briefcase } from 'lucide-react'

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
      {/* Career themed backdrop */}
      <div 
        className={`absolute inset-0 theme-career theme-backdrop backdrop-blur-sm transition-all duration-500 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup Container with organic animation - WIDER */}
      <div 
        className={`relative w-full max-w-7xl max-h-[95vh] mx-4 my-4 transition-all duration-500 ease-out ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Main content container with cohesive Career styling */}
        <div className="relative theme-career theme-container backdrop-blur-md overflow-hidden break-words"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(74, 144, 194, 0.3)'
             }}>
          
          {/* Decorative themed shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full transform translate-x-16 -translate-y-16" style={{ background: 'radial-gradient(circle, rgba(74, 144, 194, 0.2) 0%, transparent 70%)' }}></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full transform -translate-x-12 translate-y-12" style={{ background: 'radial-gradient(circle, rgba(74, 144, 194, 0.15) 0%, transparent 70%)' }}></div>
          
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
            <div className="break-words text-center break-words mb-8">
              <div className="flex justify-center mb-4">
                <Briefcase size={80} style={{ color: 'var(--color-deep-blue)' }} />
              </div>
              <h1 className="landmark-title" style={{ color: 'var(--color-deep-blue)' }}>Career</h1>
              <div className="landmark-divider"></div>
            </div>

            <div className="max-w-4xl mx-auto break-words mb-6 md:mb-8 lg:mb-12">
              <div className="relative theme-career theme-card p-10 overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)'
                   }}>
                
                <div className="break-words text-center break-words relative z-10">
                  <div className="inline-flex items-center gap-4 mb-8">
                    <h2 className="break-words" style={{ color: 'var(--color-deep-blue)' }}>My career goal</h2>
                  </div>
                  
                  <div className="break-words text-black leading-relaxed break-words space-y-8 break-words">
                    <p className="break-words text-center break-words max-w-4xl mx-auto break-words">
                      Tackle climate and environmental policy challenges through scalable, efficient technology solutions
                    </p>
                  </div>
                </div>
              </div>
            </div>



            <div className="max-w-4xl mx-auto break-words mb-6 md:mb-8 lg:mb-12">
              <div className="relative theme-career theme-card p-10 overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)'
                   }}>
                
                <div className="break-words text-center break-words relative z-10">
                  <div className="inline-flex items-center gap-4 mb-8">
                    <h2 className="break-words" style={{ color: 'var(--color-deep-blue)' }}>Future Opportunities</h2>
                  </div>
                  
                  <div className="break-words text-black leading-relaxed break-words space-y-8 break-words">
                    <p className="break-words text-left">
                      I&apos;m interested in climate tech specifically:
                    </p>
                    
                    <div className="max-w-4xl mx-auto break-words">
                      <ul className="space-y-6 break-words text-left ml-8 text-xl">
                        <li className="flex items-start gap-4">
                          <span className="break-words font-bold text-black">•</span>
                          <span>Scope 2 Emissions tracking and optimization platforms</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="break-words font-bold text-black">•</span>
                          <span>Carbon Reduction measurement and verification systems</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="break-words font-bold text-black">•</span>
                          <span>Scalable Data Infrastructure</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Resume Button */}
                    <div className="break-words text-center break-words mt-12">
                      <a 
                        href="https://drive.google.com/file/d/130KQWH7hviU7HDY7dztdG4wLoJAI8ryw/view?usp=sharing" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4"
                        style={{ 
                          background: `linear-gradient(135deg, var(--color-deep-blue) 0%, rgba(74, 144, 194, 0.8) 100%)`,
                          color: 'white',
                          fontWeight: 'medium',
                          fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
                          borderRadius: '0.75rem',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                          transform: 'translateZ(0)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                          e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)'
                          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)'
                        }}
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
                    <h2 className="break-words text-stone-800">Non-Career Goals</h2>
                  </div>
                  
                                     <div className="break-words text-black leading-relaxed break-words space-y-8 break-words">
                                           <ul className="break-words text-left max-w-4xl mx-auto break-words space-y-6 break-words text-xl">
                       <li className="flex items-start gap-4">
                         <span className="break-words text-stone-600 font-bold">•</span>
                         <span>Paragliding license</span>
                       </li>
                       <li className="flex items-start gap-4">
                         <span className="break-words text-stone-600 font-bold">•</span>
                         <span>Make a beef wellington</span>
                       </li>
                       <li className="flex items-start gap-4">
                         <span className="break-words text-stone-600 font-bold">•</span>
                         <span>Squat 500, bench 300, deadlift 400</span>
                       </li>
                       <li className="flex items-start gap-4">
                         <span className="break-words text-stone-600 font-bold">•</span>
                         <span>Dunk a basketball</span>
                       </li>
                       <li className="flex items-start gap-4">
                         <span className="break-words text-stone-600 font-bold">•</span>
                         <span>Study more sociology</span>
                       </li>
                       <li className="flex items-start gap-4">
                         <span className="break-words text-stone-600 font-bold">•</span>
                         <span>Learn to play euphonium</span>
                       </li>
                       <li className="flex items-start gap-4">
                         <span className="break-words text-stone-600 font-bold">•</span>
                         <span>Get back into playing the tuba</span>
                       </li>
                       <li className="flex items-start gap-4">
                         <span className="break-words text-stone-600 font-bold">•</span>
                         <span>Do a backflip</span>
                       </li>
                       <li className="flex items-start gap-4">
                         <span className="break-words text-stone-600 font-bold">•</span>
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