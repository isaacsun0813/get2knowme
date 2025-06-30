'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

interface AboutMeProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutMe({ isOpen, onClose }: AboutMeProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Profile image to preload
  const profileImage = '/photos/profilePic.jpeg'

  // Preload profile image in the background
  useEffect(() => {
    const img = new window.Image()
    // Image loads in background - no need to track state
    img.onerror = () => {
      console.warn(`Failed to preload profile image: ${profileImage}`)
    }
    img.src = profileImage
  }, [])

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

  const handleClose = useCallback(() => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }, [onClose])

  if (!shouldRender) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* About Me themed backdrop */}
      <div 
        className={`absolute inset-0 theme-about theme-backdrop backdrop-blur-sm transition-all duration-500 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup Container with organic animation - RESPONSIVE */}
      <div 
        className={`relative landmark-container my-2 sm:my-4 transition-all duration-500 ease-out ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Main content container with cohesive About Me styling */}
        <div className="relative theme-about theme-container backdrop-blur-md overflow-hidden break-words"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(125, 211, 219, 0.3)'
             }}>
          
          {/* Decorative themed shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full transform translate-x-16 -translate-y-16" style={{ background: 'radial-gradient(circle, rgba(125, 211, 219, 0.2) 0%, transparent 70%)' }}></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full transform -translate-x-12 translate-y-12" style={{ background: 'radial-gradient(circle, rgba(125, 211, 219, 0.15) 0%, transparent 70%)' }}></div>
          
          {/* Close button with organic styling */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-50 btn-close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content area with artistic layout */}
          <div className="break-words landmark-content overflow-y-auto max-h-[95vh]">
            
            {/* Header */}
            <div className="break-words text-center break-words pt-3 sm:pt-4 md:pt-5 pb-4 sm:pb-5 md:pb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4" style={{ color: 'var(--color-soft-cyan)' }}>About Me</h1>
              <div className="landmark-divider"></div>
            </div>

            {/* About Me Sections */}
            <div className="max-w-6xl mx-auto">
              {/* Main Combined Introduction and Bio Card */}
              <div className="relative theme-about theme-card landmark-card landmark-section-spacing overflow-hidden break-words"
                    style={{
                      borderRadius: '2rem',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)'
                    }}>
                
                <div className="relative text-center break-words space-y-12 break-words">
                  {/* Profile Photo */}
                  <div className="w-80 h-80 rounded-full shadow-2xl border-8 border-white/80 relative overflow-hidden backdrop-blur-sm mx-auto">
                    <Image 
                      src="/photos/profilePic.jpeg" 
                      alt="Isaac Sun" 
                      fill
                      className="object-cover"
                      style={{ objectPosition: '50% 25%' }}
                      sizes="320px"
                      priority
                    />
                  </div>

                  {/* Name and Title */}
                  <div className="w-full space-y-4">
                    <h2 className="break-words text-stone-800 mb-6">
                      Isaac Sun
                    </h2>
                    <p className="break-words text-black font-semibold"> SWE/Climate Advocate</p>
                  </div>

                  {/* Bio Content */}
                  <div className="break-words text-stone-600 leading-relaxed break-words space-y-8 break-words max-w-4xl mx-auto break-words">
                    <p>
                      My name is Isaac Sun and I&apos;m a recent graduate of 
                      <span className="font-medium text-purple-600"> Northwestern University</span> with a 
                      BS/MS in Computer Science and a 
                      minor in Music. 
                    </p>
                    
                    <div className="flex items-center justify-center py-8">
                      <div className="w-32 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent"></div>
                    </div>

                    <p>
                      My interests lie within scalable sustainable computing, 
                      AI × climate modeling, and 
                      environmental policy. More broadly I&apos;m also 
                      interested in distributed systems and 
                      sociology.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connect Section */}
            <div className="relative bg-gradient-to-r from-green-100/60 via-stone-100/60 to-amber-100/60 landmark-card-compact text-center break-words overflow-hidden break-words"
                 style={{
                   borderRadius: '1.5rem',
                   boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 10px 25px rgba(0, 0, 0, 0.08)',
                   border: '1px solid rgba(255, 255, 255, 0.3)'
                 }}>
              
              <div className="flex items-center justify-center gap-6 mb-10">
                <h3 className="break-words text-stone-800">Let&apos;s Connect</h3>
              </div>
              <p className="break-words text-stone-600 leading-relaxed break-words mb-8">
                Always excited to discuss climate tech, sustainable computing, or startups
              </p>
              
              {/* Social Media Icons */}
              <div className="flex justify-center gap-8">
                <a 
                  href="https://www.linkedin.com/in/isaacsun1/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 
                           flex items-center justify-center text-white shadow-lg hover:shadow-xl 
                           transform hover:scale-110 transition-all duration-300 hover:from-blue-500 hover:to-blue-700"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                
                <a 
                  href="https://github.com/isaacsun0813" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 
                           flex items-center justify-center text-white shadow-lg hover:shadow-xl 
                           transform hover:scale-110 transition-all duration-300 hover:from-gray-600 hover:to-gray-800"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                
                <a 
                  href="https://www.youtube.com/@staysunnytoday" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 
                           flex items-center justify-center text-white shadow-lg hover:shadow-xl 
                           transform hover:scale-110 transition-all duration-300 hover:from-red-400 hover:to-red-600"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                
                <a 
                  href="https://isaacsun.substack.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 
                           flex items-center justify-center text-white shadow-lg hover:shadow-xl 
                           transform hover:scale-110 transition-all duration-300 hover:from-orange-400 hover:to-amber-500"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                  </svg>
                </a>

                <a 
                  href="mailto:isaacsun0813@gmail.com" 
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-600 
                           flex items-center justify-center text-white shadow-lg hover:shadow-xl 
                           transform hover:scale-110 transition-all duration-300 hover:from-red-300 hover:to-red-500"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.887.732-1.636 1.636-1.636h.273L12 9.548l10.091-5.727h.273c.904 0 1.636.732 1.636 1.636Z"/>
                  </svg>
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 