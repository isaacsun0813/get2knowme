'use client'

import { useEffect, useState } from 'react'

interface MobileLandingPageProps {
  onProceedAnyway?: () => void
}

export default function MobileLandingPage({ onProceedAnyway }: MobileLandingPageProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark that we're now on the client side
    setIsClient(true)
    
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      
      // Only show on actual mobile devices (not just small screens on desktop)
      const shouldShow = (isSmallScreen && (isMobileUserAgent || isTouchDevice)) || isMobileUserAgent || isIOS
      
      // Mobile Landing Page Detection completed
      
      setIsMobile(shouldShow)
    }

    // Run immediately
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Don't render anything during SSR or until client-side hydration is complete
  if (!isClient) return null
  
  // Only show on actual mobile devices
  if (!isMobile) return null

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-blue-50 to-sky-100 overflow-hidden break-words">
      {/* Mobile-optimized layout for iPhone */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 w-full max-w-sm text-center break-words">
          {/* Emoji */}
          <div className="break-words text-5xl mb-6">👋</div>
          
          {/* Main message */}
          <h1 className="break-words text-2xl font-bold text-gray-800 mb-4">
            Hi there!
          </h1>
          
          <p className="break-words text-gray-600 text-lg leading-relaxed break-words mb-6">
            I&apos;m still working on mobile compatibility. For the best experience, please open this site on a computer.
          </p>
          
          
          {/* Optional proceed button */}
          {onProceedAnyway && (
            <button
              onClick={onProceedAnyway}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors mb-4 font-medium"
            >
              Proceed anyway (experimental)
            </button>
          )}
          
          {/* Debug info */}
          {/* <div className="mt-4 text-xs text-gray-400 space-y-1 bg-gray-50 p-3 rounded">
            <div>Screen: {typeof window !== 'undefined' ? window.innerWidth : 0}px</div>
            <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
            <div>Client: {isClient ? 'Yes' : 'No'}</div>
          </div> */}
        </div>
        
      </div>
    </div>
  )
} 