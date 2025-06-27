'use client'

import { useEffect, useState } from 'react'

export default function FlightControls() {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Detect if device is mobile
  useEffect(() => {
    // Mark that we're now on the client side
    setIsClient(true)
    
    const checkMobile = () => {
      // More comprehensive mobile detection
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      
      // More aggressive mobile detection
      const shouldHide = isSmallScreen || isMobileUserAgent || isIOS || isTouchDevice
      
      console.log('🔍 FlightControls detection (DETAILED):', {
        userAgent: userAgent,
        isMobileUserAgent,
        isTouchDevice,
        isSmallScreen,
        isIOS,
        screenWidth: window.innerWidth,
        maxTouchPoints: navigator.maxTouchPoints,
        shouldHide,
        windowType: typeof window
      })
      
      setIsMobile(shouldHide)
    }

    // Run immediately and on resize
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Also run after a small delay to ensure everything is loaded
    const timer = setTimeout(checkMobile, 100)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(timer)
    }
  }, [])

  // Don't render anything during SSR or until client-side hydration is complete
  if (!isClient) return null

  // Force hide on very small screens as backup
  const forceHideOnSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 480

  // Don't render on mobile
  if (isMobile || forceHideOnSmallScreen) {
    console.log('🚫 FlightControls hidden on mobile (mobile:', isMobile, ', smallScreen:', forceHideOnSmallScreen, ')')
    return null
  }

  console.log('✅ FlightControls showing on desktop')
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-gray-200">
        <h3 className="break-words text-xl font-bold text-gray-800 mb-4 text-center break-words font-mono uppercase tracking-wider">
          Flight Controls
        </h3>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <kbd className="bg-gray-700 text-white px-3 py-2 rounded font-mono font-bold text-sm shadow-md">W</kbd>
            <span className="break-words text-gray-700 font-mono font-semibold uppercase tracking-wide">Speed up</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <kbd className="bg-gray-700 text-white px-3 py-2 rounded font-mono font-bold text-sm shadow-md">A</kbd>
            <span className="break-words text-gray-700 font-mono font-semibold uppercase tracking-wide">Turn left</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <kbd className="bg-gray-700 text-white px-3 py-2 rounded font-mono font-bold text-sm shadow-md">D</kbd>
            <span className="break-words text-gray-700 font-mono font-semibold uppercase tracking-wide">Turn right</span>
          </div>
        </div>
      </div>
    </div>
  )
} 