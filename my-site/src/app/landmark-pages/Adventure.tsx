'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { Mountain } from 'lucide-react'

interface AdventureProps {
  isOpen: boolean
  onClose: () => void
}

export default function Adventure({ isOpen, onClose }: AdventureProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(true) // Start as true since images are pre-loaded globally

  const adventurePhotos = useMemo(() => [
    { src: '/photos/adventure/adventure1.jpg', caption: 'Ticino' },
    { src: '/photos/adventure/adventure2.jpg', caption: 'Skiing in Alestch' },
    { src: '/photos/adventure/adventure3.jpg', caption: 'El Yunque' },
    { src: '/photos/adventure/adventure4.jpg', caption: 'Milan' },
    { src: '/photos/adventure/adventure5.jpg', caption: 'Monte Carlo' },
    { src: '/photos/adventure/adventure6.jpg', caption: 'Stoos Ridge Hike' },
    { src: '/photos/adventure/adventure7.jpg', caption: 'Oktoberfest' },
    { src: '/photos/adventure/adventure8.jpg', caption: 'swimming in zurich' },
    { src: '/photos/adventure/adventure9.jpg', caption: 'Interlaken' },
    { src: '/photos/adventure/adventure10.jpg', caption: 'Alestch' },
    { src: '/photos/adventure/adventure11.jpg', caption: 'Zurich' },
    { src: '/photos/adventure/adventure12.jpg', caption: 'Zurich' },
    { src: '/photos/adventure/adventure13.jpg', caption: 'Ticino' },
    { src: '/photos/adventure/adventure14.jpg', caption: 'Zermatt' },
    { src: '/photos/adventure/adventure15.jpg', caption: 'Wicker Park' },
    { src: '/photos/adventure/adventure16.jpg', caption: 'Interlaken' },
    { src: '/photos/adventure/adventure17.jpg', caption: 'Stoos' },
  ], [])

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

  // Images are preloaded globally, so they should be ready immediately
  useEffect(() => {
    setImageLoaded(true)
  }, [currentPhotoIndex])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % adventurePhotos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + adventurePhotos.length) % adventurePhotos.length)
  }

  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex(index)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageLoaded(false)
  }

  if (!shouldRender) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Adventure themed backdrop */}
      <div 
        className={`absolute inset-0 theme-adventure theme-backdrop backdrop-blur-sm transition-all duration-500 ${
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
        {/* Main content container with cohesive Adventure styling */}
        <div className="relative theme-adventure theme-container backdrop-blur-md overflow-hidden break-words"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(95, 184, 95, 0.3)'
             }}>
          
          {/* Decorative themed shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full transform translate-x-16 -translate-y-16" style={{ background: 'radial-gradient(circle, rgba(95, 184, 95, 0.2) 0%, transparent 70%)' }}></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full transform -translate-x-12 translate-y-12" style={{ background: 'radial-gradient(circle, rgba(95, 184, 95, 0.15) 0%, transparent 70%)' }}></div>
          
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
                <Mountain size={40} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" style={{ color: 'var(--color-earth-green)' }} />
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight" style={{ color: 'var(--color-earth-green)' }}>Adventure</h1>
              </div>
              <div className="landmark-divider"></div>
            </div>

            {/* Story Section */}
            <div className="max-w-6xl mx-auto landmark-section-spacing">
              <div className="relative bg-gradient-to-r from-green-50/60 to-transparent landmark-card-compact border-l-4 border-green-400"
                   style={{
                     borderRadius: '0 1rem 1rem 0'
                   }}>
                
                <div className="text-left">
                  <p className="font-medium text-stone-700 italic">
                    I&apos;m a nature guy. Check out some of my favorite places!
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Collage Section - More compact images */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-3 overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(100, 116, 139, 0.2)'
                   }}>
                
                 {/* Photo Display - More reasonable size */}
                 <div className="relative flex justify-center">
                   <div className="relative w-full max-w-2xl aspect-[4/3] rounded-xl overflow-hidden shadow-lg bg-gray-200">
                     {/* Minimal placeholder for any brief loading - should rarely show since images are preloaded */}
                     {!imageLoaded && (
                       <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 z-10">
                         <div className="break-words text-center break-words">
                           <span className="break-words text-3xl mb-4 block">📸</span>
                           <p className="break-words text-gray-600">Loading photo...</p>
                         </div>
                       </div>
                     )}
                     
                     {/* Actual photo - HD quality with proper fitting */}
                     <Image 
                       src={adventurePhotos[currentPhotoIndex].src}
                       alt={adventurePhotos[currentPhotoIndex].caption}
                       fill
                       className="object-cover"
                       sizes="(max-width: 768px) 95vw, (max-width: 1200px) 80vw, 70vw"
                       onLoad={handleImageLoad}
                       onError={handleImageError}
                     />
                   </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 
                               bg-white/80 hover:bg-white/95 rounded-full p-4 shadow-lg 
                               transition-all duration-300 hover:scale-110 z-50"
                  >
                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 
                               bg-white/80 hover:bg-white/95 rounded-full p-4 shadow-lg 
                               transition-all duration-300 hover:scale-110 z-50"
                  >
                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>


                </div>

                {/* Photo Gallery Section */}
                <div className="mt-8">
                  <div className="relative theme-adventure theme-card px-8 py-4 mx-auto max-w-2xl"
                       style={{
                         borderRadius: '1.5rem',
                         boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 10px 25px rgba(0, 0, 0, 0.08)'
                       }}>
                    <h3 className="font-medium text-stone-700 text-center">
                      {adventurePhotos[currentPhotoIndex].caption}
                    </h3>
                  </div>
                  
                  {/* Photo navigation dots */}
                  <div className="flex justify-center gap-3 mt-6 mb-8">
                    {adventurePhotos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToPhoto(index)}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          index === currentPhotoIndex
                            ? 'bg-green-500 scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Attack on Titan Section */}
            <div className="max-w-5xl mx-auto landmark-section-spacing">
              <div className="relative bg-gradient-to-br from-red-100/70 via-orange-50/70 to-red-100/70 landmark-card overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(239, 68, 68, 0.2)'
                   }}>
                
                <div className="break-words text-center break-words relative z-10">
                  
                  {/* Attack on Titan GIF */}
                  <div className="mb-8">
                    <div className="w-full max-w-sm mx-auto h-64 rounded-xl overflow-hidden shadow-lg bg-gray-200 relative">
                      {/* Placeholder when no GIF loads */}
                                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100">
                          <div className="break-words text-center break-words">
                            <span className="break-words mb-2 block">🎌</span>
                            <p className="break-words text-gray-600">Add aot.gif to</p>
                            <p className="break-words text-gray-600 font-mono">/photos/adventure/</p>
                          </div>
                        </div>
                      
                      <Image 
                        src="/photos/adventure/aot.gif"
                        alt="Attack on Titan GIF"
                        fill
                        className="object-cover relative z-10"
                        sizes="(max-width: 768px) 90vw, 512px"
                        unoptimized
                      />
                    </div>
                  </div>
                  
                                     <div className="break-words text-stone-600 leading-relaxed break-words">
                     <p className="break-words font-medium">
                       I was <span className="font-medium text-red-600">obsessed with AOT</span> as a kid because I wanted to 
                       <span className="font-medium text-blue-600"> fly around like Eren does</span> in this scene. 
                       Looking forward to the day this is possible <span>:)</span>
                     </p>
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