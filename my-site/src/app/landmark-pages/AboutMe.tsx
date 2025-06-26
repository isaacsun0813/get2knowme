'use client'

import { useEffect, useState } from 'react'

interface AboutMeProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutMe({ isOpen, onClose }: AboutMeProps) {
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
      {/* Blue-themed backdrop for About Me */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-blue-100/70 via-sky-100/60 to-blue-200/70 backdrop-blur-sm transition-all duration-500 ${
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
        {/* Main content container with blue About Me styling */}
        <div className="relative bg-gradient-to-br from-blue-50/95 via-sky-50/95 to-white/95 backdrop-blur-md overflow-hidden"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(37, 99, 235, 0.3)'
             }}>
          
          {/* Decorative blue shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-sky-200/30 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
          
          {/* Close button with organic styling */}
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

          {/* Content area with artistic layout */}
          <div className="p-12 overflow-y-auto max-h-[95vh]">
            
            {/* Centered Profile Photo with artistic frame */}
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="w-64 h-64 rounded-full shadow-2xl border-8 border-white/80 relative overflow-hidden backdrop-blur-sm">
                  <img 
                    src="/photos/profilePic.jpeg" 
                    alt="Isaac Sun" 
                    className="w-full h-full object-cover object-center"
                    style={{ 
                      objectPosition: '50% 25%' 
                    }}
                  />
                </div>
              </div>
            </div>

                         {/* Name and title with artistic typography */}
             <div className="text-center mb-12">
               <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-stone-700 mb-6 tracking-normal" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                 Isaac Sun
               </h1>
               <p className="text-2xl md:text-3xl lg:text-4xl text-stone-500 font-medium tracking-normal mb-8" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                 Climate Tech Enthusiast & Computer Scientist
               </p>
               
               {/* Social Media Icons */}
               <div className="flex justify-center gap-6">
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
               </div>
             </div>

            {/* Main Introduction with artistic card */}
                         <div className="max-w-5xl mx-auto">
              <div className="relative bg-gradient-to-br from-blue-100/70 via-sky-50/70 to-blue-100/70 p-12 mb-10 overflow-hidden"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(37, 99, 235, 0.2)'
                   }}>
                
                                 <div className="text-center relative z-10">
                   <div className="inline-flex items-center gap-4 mb-10">
                     <h2 className="text-5xl font-light text-blue-700" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Hello there!</h2>
                   </div>
                   
                   <div className="text-stone-600 text-3xl leading-relaxed space-y-10 font-light" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <p>
                      My name is <span className="font-medium text-green-600">Isaac Sun</span> and I'm a recent graduate of 
                      <span className="font-medium text-purple-600"> Northwestern University</span> with a 
                      <span className="font-medium text-stone-700"> BS/MS in Computer Science</span> and a 
                      <span className="font-medium text-blue-500"> minor in Music</span>. 
                    </p>
                    
                    <p>
                      My interests lie within <span className="font-medium text-green-600">scalable sustainable computing</span>, 
                      <span className="font-medium text-blue-500"> AI × climate modeling</span>, and 
                      <span className="font-medium text-emerald-600"> environmental policy</span>. More broadly I'm also 
                      interested in <span className="font-medium text-stone-600">distributed systems</span> and 
                      <span className="font-medium text-amber-600"> sociology</span>.
                    </p>

                     <div className="flex items-center justify-center py-10">
                       <div className="flex items-center gap-6">
                         <div className="h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent w-20"></div>
                         <span className="text-5xl">🌿</span>
                         <div className="h-px bg-gradient-to-l from-transparent via-stone-300 to-transparent w-20"></div>
                       </div>
                     </div>

                    <p>
                      I'm very interested in <span className="font-medium text-green-600">creating a greener future</span>. 
                      I want to be part of the generation that can help <span className="font-medium text-emerald-600">curb climate change</span>. 
                      <span className="font-medium text-blue-500"> Please reach out if you have ideas or want to chat!</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Connect section with artistic styling */}
              <div className="relative bg-gradient-to-r from-green-100/60 via-stone-100/60 to-amber-100/60 p-8 text-center overflow-hidden"
                   style={{
                     borderRadius: '1.5rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 10px 25px rgba(0, 0, 0, 0.08)',
                     border: '1px solid rgba(255, 255, 255, 0.3)'
                   }}>
                
                <div className="absolute top-2 left-4 text-xl opacity-20">🌺</div>
                <div className="absolute bottom-2 right-4 text-xl opacity-20">🍀</div>
                
                                 <div className="flex items-center justify-center gap-4 mb-8">
                   <span className="text-4xl">🌱</span>
                   <h3 className="text-3xl font-light text-stone-700" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Let's Connect!</h3>
                   <span className="text-4xl">🌍</span>
                 </div>
                 <p className="text-stone-600 text-2xl font-light" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                   Always excited to discuss climate tech, sustainable computing, or startups opportunities! 
                 </p>
              </div>

                             {/* Footer note with artistic styling */}
               <div className="mt-16 text-center">
                 <p className="text-stone-500 text-xl font-light" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                   Click the X or outside the popup to Exit
                 </p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
} 