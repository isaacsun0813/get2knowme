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
      <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200">
        <h3 className="break-words text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 text-center break-words font-mono uppercase tracking-wider">
          Flight Controls
        </h3>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <kbd className="bg-gray-700 text-white px-2 py-1 rounded font-mono font-bold text-xs shadow-md">W</kbd>
            <span className="break-words text-gray-700 font-mono font-medium uppercase tracking-wide text-xs">Speed up</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <kbd className="bg-gray-700 text-white px-2 py-1 rounded font-mono font-bold text-xs shadow-md">A</kbd>
            <span className="break-words text-gray-700 font-mono font-medium uppercase tracking-wide text-xs">Turn left</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <kbd className="bg-gray-700 text-white px-2 py-1 rounded font-mono font-bold text-xs shadow-md">D</kbd>
            <span className="break-words text-gray-700 font-mono font-medium uppercase tracking-wide text-xs">Turn right</span>
          </div>
        </div>
      </div>
    </div>
  )
} 