'use client'

import { useEffect, useState } from 'react'

interface AmbitionProps {
  isOpen: boolean
  onClose: () => void
}

export default function Ambition({ isOpen, onClose }: AmbitionProps) {
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
      {/* Grey backdrop like other pages */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-purple-100/70 via-indigo-100/60 to-purple-200/70 backdrop-blur-sm transition-all duration-500 ${
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
        <div className="relative bg-gradient-to-br from-purple-50/95 via-indigo-50/95 to-white/95 backdrop-blur-md overflow-hidden"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(139, 69, 19, 0.3)'
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
             <div className="text-center mb-32">
               <h1 className="text-[8rem] lg:text-[12rem] xl:text-[14rem] font-extrabold text-stone-800 mb-12 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                 Projects
               </h1>
               <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-12"></div>
               <p className="text-4xl font-semibold text-stone-600 tracking-wide leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                 I'm a builder. I love to make things happen.<br />Here's what I'm up to:
               </p>
             </div>

                         {/* Projects Grid */}
             <div className="max-w-5xl mx-auto space-y-24">
              
                             {/* Verdra Project */}
               <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-12 overflow-hidden"
                    style={{
                      borderRadius: '2rem',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(100, 116, 139, 0.2)'
                    }}>
                 
                 <div className="relative flex flex-col items-center text-center space-y-8">
                   {/* Title and Description */}
                   <div className="w-full">
                     <h2 className="text-9xl font-extrabold text-stone-800 mb-8 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                       Verdra
                     </h2>
                     <p className="text-4xl text-blue-700 mb-10 font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Cloud Compute Optimization</p>
                     <p className="text-2xl text-stone-700 mb-12 leading-relaxed max-w-4xl mx-auto" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                       Advanced cloud compute optimization tool that reduces infrastructure costs by up to 40% 
                       through intelligent resource allocation and real-time monitoring algorithms.
                     </p>
                   </div>
                   
                   {/* Image */}
                   <div className="w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-lg">
                     <a href="https://drive.google.com/file/d/1sUSc109rf_TQ7-Dn2wbfKeLBoJqlnddl/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                       <img src="/photos/projects/Verdra.png" alt="Verdra Demo" className="w-full h-auto object-contain" />
                     </a>
                   </div>
                   
                   {/* Live Site Link */}
                   <div className="mt-12">
                     <a 
                       href="https://verdratech.github.io/Verdra-Site/" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="inline-flex items-center justify-center gap-4 bg-slate-700 hover:bg-slate-800 text-white px-16 py-6 rounded-md font-semibold transition-all duration-200 ease-out text-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[300px]"
                       style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                     >
                       <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                       </svg>
                       <span>Check it out</span>
                     </a>
                   </div>
                 </div>
               </div>

                             {/* PrizeSole Project */}
               <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-12 overflow-hidden"
                    style={{
                      borderRadius: '2rem',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(100, 116, 139, 0.2)'
                    }}>
                 
                 <div className="relative flex flex-col items-center text-center space-y-8">
                   {/* Title and Description */}
                   <div className="w-full">
                     <h2 className="text-9xl font-extrabold text-stone-800 mb-8 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                       PrizeSole
                     </h2>
                     <p className="text-4xl text-purple-700 mb-10 font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>B2B eCommerce Platform</p>
                     <p className="text-2xl text-stone-700 mb-12 leading-relaxed max-w-4xl mx-auto" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                       Full-stack B2B eCommerce platform built for scale. Features real-time inventory management, 
                       automated order processing, and advanced analytics dashboard.
                     </p>
                   </div>
                   
                   {/* Image */}
                   <div className="w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-lg">
                     <img 
                       src="/photos/projects/PrizeSole.png"
                       alt="PrizeSole B2B eCommerce Platform"
                       className="w-full h-auto object-contain"
                     />
                   </div>
                 </div>
               </div>

                             {/* Current Work Section */}
               <div className="grid md:grid-cols-2 gap-12">
                 {/* Sneaker IMS */}
                 <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-10 overflow-hidden"
                      style={{
                        borderRadius: '2rem',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(100, 116, 139, 0.2)'
                      }}>
                   
                   <div className="relative">
                     <div className="flex items-center gap-4 mb-8">
                       <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                       <span className="text-lg font-bold text-yellow-600 tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>BUILDING</span>
                     </div>
                     <h3 className="text-5xl font-extrabold text-stone-800 mb-8 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Sneaker IMS</h3>
                     <p className="text-stone-700 mb-8 text-2xl leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                       Advanced inventory management system for sneaker retailers with ML-powered authentication, 
                       real-time market analytics, and automated restocking algorithms.
                     </p>
                   </div>
                 </div>

                 {/* Scope 2 Emissions Research */}
                 <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-10 overflow-hidden"
                      style={{
                        borderRadius: '2rem',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(100, 116, 139, 0.2)'
                      }}>
                   
                   <div className="relative">
                     <div className="flex items-center gap-4 mb-8">
                       <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                       <span className="text-lg font-bold text-yellow-600 tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>RESEARCHING</span>
                     </div>
                     <h3 className="text-5xl font-extrabold text-stone-800 mb-8 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Scope 2 Emissions</h3>
                     <p className="text-stone-700 mb-8 text-2xl leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                       Deep research into carbon footprint reduction through optimized data infrastructure, 
                       exploring energy-efficient algorithms and sustainable computing practices.
                     </p>
                   </div>
                 </div>
               </div>

                             {/* GitHub CTA */}
               <div className="relative bg-gradient-to-br from-slate-100/70 via-gray-50/70 to-slate-100/70 p-8 text-center overflow-hidden"
                    style={{
                      borderRadius: '2rem',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 15px 35px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(100, 116, 139, 0.2)'
                    }}>
                 <p className="text-3xl font-bold text-stone-800 mb-8" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                   Check out what I'm working on:
                 </p>
                 <a 
                   href="https://github.com/isaacsun0813" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-4 bg-black hover:bg-stone-800 text-white px-16 py-6 rounded-xl font-bold transition-all duration-300 hover:scale-105 text-2xl shadow-2xl min-w-[400px]"
                   style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                 >
                   <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                   </svg>
                   <span>View GitHub</span>
                 </a>
               </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 