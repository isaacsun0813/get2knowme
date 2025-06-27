'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'

interface AdventureProps {
  isOpen: boolean
  onClose: () => void
}

export default function Adventure({ isOpen, onClose }: AdventureProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())

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

  // Preload all images in the background
  useEffect(() => {
    const preloadImages = () => {
      adventurePhotos.forEach((photo) => {
        const img = new window.Image()
        img.onload = () => {
          setPreloadedImages(prev => new Set(prev).add(photo.src))
        }
        img.onerror = () => {
          console.warn(`Failed to preload image: ${photo.src}`)
        }
        img.src = photo.src
      })
    }

    // Start preloading immediately when component mounts
    preloadImages()
  }, [adventurePhotos])

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

  // Reset image loaded state when photo changes
  useEffect(() => {
    const currentPhotoSrc = adventurePhotos[currentPhotoIndex].src
    // If image is already preloaded, mark it as loaded immediately
    if (preloadedImages.has(currentPhotoSrc)) {
      setImageLoaded(true)
    } else {
      setImageLoaded(false)
    }
  }, [currentPhotoIndex, preloadedImages, adventurePhotos])

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
      {/* Green adventure-themed backdrop */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-green-100/70 via-emerald-100/60 to-green-200/70 backdrop-blur-sm transition-all duration-500 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup Container with organic animation - Made much wider */}
      <div 
        className={`relative w-full max-w-[95vw] max-h-[95vh] mx-4 my-4 transition-all duration-500 ease-out ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Main content container with green adventure styling */}
        <div className="relative bg-gradient-to-br from-green-50/95 via-emerald-50/95 to-white/95 backdrop-blur-md overflow-hidden break-words"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(34, 197, 94, 0.3)' // Green
             }}>
          
          {/* Decorative green shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-200/30 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
          
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
              <h1 className="break-words text-emerald-700 mb-6 tracking-wide">
                Adventure
              </h1>

            </div>

            {/* Story Section */}
            <div className="max-w-6xl mx-auto mb-6 md:mb-8 lg:mb-12">
              <div className="relative bg-gradient-to-br from-green-100/70 via-emerald-50/70 to-green-100/70 p-10 overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(34, 197, 94, 0.2)'
                   }}>
                
                <div className="break-words text-center break-words relative z-10">
                  
                  <div className="break-words text-emerald-800 leading-relaxed break-words">
                    <p className="break-words text-xl md:text-2xl lg:text-3xl font-medium">
                      I&apos;m a nature guy. Check out some of my favorite places!
                    </p>
                  </div>
                </div>
              </div>
            </div>

                        {/* Photo Collage Section - Dominating images */}
            <div className="max-w-7xl mx-auto mb-6 md:mb-8 lg:mb-12">
              <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-3 overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(100, 116, 139, 0.2)'
                   }}>
                
                 {/* Photo Display - Dominating page size */}
                 <div className="relative flex justify-center">
                   <div className="relative w-full max-w-5xl aspect-square rounded-xl overflow-hidden shadow-lg bg-gray-200">
                     {/* Placeholder when no image loads - only show when image hasn't loaded */}
                     {!imageLoaded && (
                       <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 z-10">
                         <div className="break-words text-center break-words">
                           <span className="break-words text-3xl md:text-4xl lg:text-6xl mb-4 block">📸</span>
                           <p className="break-words text-gray-600 text-xl md:text-2xl lg:text-3xl">
                             {preloadedImages.size === 0 ? 'Loading photos...' : 
                              preloadedImages.size < adventurePhotos.length ? 
                              `Loading photos... (${preloadedImages.size}/${adventurePhotos.length})` :
                              'Loading current photo...'}
                           </p>
                           <p className="break-words text-gray-600 font-mono text-lg">/photos/adventure/</p>
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

                {/* Photo Caption - Below image, center aligned */}
                <div className="text-center mt-4 mb-6">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-stone-700">
                    {adventurePhotos[currentPhotoIndex].caption}
                  </h3>
                </div>

                {/* Photo Dots Navigation */}
                <div className="flex justify-center mt-6 gap-2 flex-wrap">
                  {adventurePhotos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToPhoto(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentPhotoIndex 
                          ? 'bg-green-600 scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Attack on Titan Section */}
            <div className="max-w-5xl mx-auto mb-6 md:mb-8 lg:mb-12">
              <div className="relative bg-gradient-to-br from-red-100/70 via-orange-50/70 to-red-100/70 p-10 overflow-hidden break-words"
                   style={{
                     borderRadius: '2rem',
                     boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(239, 68, 68, 0.2)'
                   }}>
                
                <div className="break-words text-center break-words relative z-10">
                  
                  {/* Attack on Titan GIF */}
                  <div className="mb-8">
                    <div className="w-full max-w-lg mx-auto h-80 rounded-xl overflow-hidden shadow-lg bg-gray-200 relative">
                      {/* Placeholder when no GIF loads */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100">
                        <div className="break-words text-center break-words">
                          <span className="break-words text-2xl md:text-3xl lg:text-4xl mb-2 block">🎌</span>
                          <p className="break-words text-gray-600 text-xl md:text-2xl lg:text-3xl">Add aot.gif to</p>
                          <p className="break-words text-gray-600 font-mono text-lg">/photos/adventure/</p>
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
                     <p className="break-words text-xl md:text-2xl lg:text-3xl font-medium">
                       I was <span className="font-medium text-red-600">obsessed with AOT</span> as a kid because I wanted to 
                       <span className="font-medium text-blue-600"> fly around like Erin does</span> in this scene. 
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