'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { Rocket } from 'lucide-react'

interface AmbitionProps {
  isOpen: boolean
  onClose: () => void
}

export default function Ambition({ isOpen, onClose }: AmbitionProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Project images to preload
  const projectImages = useMemo(() => [
    '/photos/projects/Verdra.png',
    '/photos/projects/PrizeSole.png'
  ], [])

  // Preload all project images in the background
  useEffect(() => {
    const preloadImages = () => {
      projectImages.forEach((imageSrc) => {
        const img = new window.Image()
        // Image loads in background - no need to track state
        img.onerror = () => {
          console.warn(`Failed to preload project image: ${imageSrc}`)
        }
        img.src = imageSrc
      })
    }

    // Start preloading immediately when component mounts
    preloadImages()
  }, [projectImages])

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
      {/* Ambition themed backdrop */}
      <div 
        className={`absolute inset-0 theme-ambition theme-backdrop backdrop-blur-sm transition-all duration-500 ${
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
        {/* Main content container with cohesive Ambition styling */}
        <div className="relative theme-ambition theme-container backdrop-blur-md overflow-hidden break-words"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(230, 176, 104, 0.3)'
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
             <div className="break-words text-center break-words mb-32">
                               <div className="flex justify-center mb-4">
                <Rocket size={80} style={{ color: 'var(--color-warm-amber)' }} />
              </div>
              <h1 className="landmark-title" style={{ color: 'var(--color-warm-amber)' }}>Projects</h1>
               <div className="landmark-divider"></div>
               <p className="break-words text-lg md:text-xl lg:text-2xl font-semibold text-black tracking-wide leading-relaxed break-words">
                 I&apos;m a builder. I love to make things happen.<br />Here&apos;s what I&apos;m up to:
               </p>
             </div>

                         {/* Projects Grid */}
             <div className="max-w-5xl mx-auto space-y-24">
              
                             {/* Verdra Project */}
               <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-12 overflow-hidden break-words"
                    style={{
                      borderRadius: '2rem',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(100, 116, 139, 0.2)'
                    }}>
                 
                 <div className="relative flex flex-col items-center text-center break-words space-y-8 break-words">
                   {/* Title and Description */}
                   <div className="w-full">
                     <h2 className="break-words text-9xl font-extrabold text-stone-800 mb-8 tracking-tight">
                       <span className="break-words text-2xl md:text-3xl lg:text-4xl sm:text-3xl md:text-4xl lg:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">Verdra</span>
                     </h2>
                     <p className="break-words text-lg sm:text-xl md:text-2xl lg:text-3xl text-black mb-10 font-semibold">Cloud Compute Optimization</p>
                     <p className="break-words text-lg sm:text-xl md:text-2xl lg:text-3xl text-black mb-6 md:mb-8 lg:mb-12 leading-relaxed break-words max-w-4xl mx-auto break-words">
                       Reduces infrastructure costs and improves carbon footprint by detecting common cloud compute inefficiencies
                     </p>
                   </div>
                   
                   {/* Image */}
                   <div className="w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-lg">
                     <a href="https://drive.google.com/file/d/1sUSc109rf_TQ7-Dn2wbfKeLBoJqlnddl/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                       <Image 
                         src="/photos/projects/Verdra.png" 
                         alt="Verdra Demo" 
                         width={800}
                         height={600}
                         className="w-full h-auto object-contain" 
                         sizes="(max-width: 768px) 95vw, (max-width: 1200px) 80vw, 800px"
                       />
                     </a>
                   </div>
                   
                   {/* Live Site Link */}
                   <div className="mt-12">
                     <a 
                       href="https://verdratech.github.io/Verdra-Site/" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="group btn-primary inline-flex items-center gap-2 sm:gap-3 md:gap-4 px-8 py-3 sm:px-12 md:px-16 lg:px-20 sm:py-4 md:py-5 lg:py-6 text-lg sm:text-xl md:text-2xl lg:text-3xl"
                     >
                       <span className="relative z-10">Check it out</span>
                       <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6l6 6-6 6" />
                       </svg>
                     </a>
                   </div>
                 </div>
               </div>

                             {/* PrizeSole Project */}
               <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-12 overflow-hidden break-words"
                    style={{
                      borderRadius: '2rem',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(100, 116, 139, 0.2)'
                    }}>
                 
                 <div className="relative flex flex-col items-center text-center break-words space-y-8 break-words">
                   {/* Title and Description */}
                   <div className="w-full">
                     <h2 className="break-words text-9xl font-extrabold text-stone-800 mb-8 tracking-tight">
                       <span className="break-words text-2xl md:text-3xl lg:text-4xl sm:text-3xl md:text-4xl lg:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">PrizeSole</span>
                     </h2>
                     <p className="break-words text-lg sm:text-xl md:text-2xl lg:text-3xl mb-10 font-semibold text-black">B2B eCommerce Platform</p>
                     <p className="break-words text-lg sm:text-xl md:text-2xl lg:text-3xl text-black mb-6 md:mb-8 lg:mb-12 leading-relaxed break-words max-w-4xl mx-auto break-words">
                       B2B eCommerce sneaker sweepstakes platform
                     </p>
                   </div>
                   
                   {/* Image */}
                   <div className="w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-lg">
                     <Image 
                       src="/photos/projects/PrizeSole.png"
                       alt="PrizeSole B2B eCommerce Platform"
                       width={800}
                       height={600}
                       className="w-full h-auto object-contain"
                       sizes="(max-width: 768px) 95vw, (max-width: 1200px) 80vw, 800px"
                     />
                   </div>
                 </div>
               </div>

                             {/* Current Work Section */}
               <div className="grid md:grid-cols-2 gap-12">
                 <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-10 overflow-hidden break-words"
                      style={{
                        borderRadius: '2rem',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(100, 116, 139, 0.2)'
                      }}>
                   
                   <div className="relative">
                     <div className="flex items-center gap-4 mb-8">
                       <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                       <span className="break-words text-xl font-bold text-yellow-600 tracking-wider">BUILDING</span>
                     </div>
                     <h3 className="break-words text-5xl font-extrabold text-stone-800 mb-8 tracking-tight">Grey Market Sneaker Marketplace</h3>
                     <p className="break-words text-black mb-8 text-lg sm:text-xl md:text-2xl leading-relaxed break-words">
                     A sneaker inventory management platform featuring agent-driven workflows, automated SKU detection, 
                     and real-time access to available wholesale inventory.
                     </p>
                   </div>
                 </div>

                 {/* Scope 2 Emissions Research */}
                 <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-10 overflow-hidden break-words"
                      style={{
                        borderRadius: '2rem',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(100, 116, 139, 0.2)'
                      }}>
                   
                   <div className="relative">
                     <div className="flex items-center gap-4 mb-8">
                       <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                       <span className="break-words text-xl font-bold text-yellow-600 tracking-wider">RESEARCHING</span>
                     </div>
                     <h3 className="break-words text-5xl font-extrabold text-stone-800 mb-8 tracking-tight">Cloud spend tied to carbon footprint</h3>
                     <p className="break-words text-black mb-8 text-lg sm:text-xl md:text-2xl leading-relaxed break-words">
                       Also interested in greener CI/CD pipelines and carbon-aware job scheduling for training 
                       ML models 
                     </p>
                   </div>
                 </div>
               </div>

                             {/* GitHub CTA */}
               <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-8 text-center break-words overflow-hidden break-words"
                    style={{
                      borderRadius: '2rem',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(100, 116, 139, 0.2)'
                    }}>
                 <p className="break-words text-xl sm:text-2xl font-bold text-black mb-8">
                   Check out what else I&apos;m working on:
                 </p>
                 <a 
                   href="https://github.com/isaacsun0813" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="group btn-primary inline-flex items-center gap-2 sm:gap-3 md:gap-4 px-8 py-3 sm:px-12 md:px-16 lg:px-20 sm:py-4 md:py-5 lg:py-6 text-lg sm:text-xl md:text-2xl lg:text-3xl"
                 >
                   <span className="relative z-10">View GitHub</span>
                   <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 group-hover:scale-110 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.30 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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