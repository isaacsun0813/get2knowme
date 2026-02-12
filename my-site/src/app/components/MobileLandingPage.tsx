'use client'

import { useEffect, useState } from 'react'
import MobilePortfolioPage from './MobilePortfolioPage'

interface MobileLandingPageProps {
  onProceedAnyway?: () => void
}

export default function MobileLandingPage({ onProceedAnyway }: MobileLandingPageProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showMobilePortfolio, setShowMobilePortfolio] = useState(false)

  useEffect(() => {
    // Mark that we're now on the client side
    setIsClient(true)
    
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      
      // Check for mobile user agent patterns
      const isMobileUserAgent = /android|webos|iphone|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent)
      const isIOS = /iphone|ipod/.test(userAgent) // iPhone/iPod only, exclude iPad
      const isIPad = /ipad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      
      // Check for touch capability
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Check for mobile device characteristics
      interface NavigatorWithDeviceMemory extends Navigator {
        deviceMemory?: number
      }
      const nav = navigator as NavigatorWithDeviceMemory
      const hasMobileHardware = 
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || // Mobile devices typically have fewer cores
        (nav.deviceMemory && nav.deviceMemory <= 4) || // Mobile devices have less RAM
        window.matchMedia('(pointer: coarse)').matches // Coarse pointer (finger touch)
      
      // Check screen size (but don't rely on it alone)
      const isSmallScreen = window.innerWidth <= 768
      
      // Only show on TRUE mobile devices (phones, not tablets/desktops)
      // Must have mobile user agent AND (touch capability OR mobile hardware characteristics)
      // Exclude iPad explicitly
      const shouldShow = !isIPad && (
        isIOS || // iPhone/iPod
        (isMobileUserAgent && hasTouch && (hasMobileHardware || isSmallScreen)) // Android phones with touch
      )
      
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

  // Show mobile portfolio page instead of landing page
  if (showMobilePortfolio) {
    return (
      <MobilePortfolioPage 
        onClose={onProceedAnyway ? () => {
          setShowMobilePortfolio(false)
          onProceedAnyway()
        } : undefined}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[200] bg-white">
      {/* Sharp, minimal design */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="bg-white border-2 border-black p-8 w-full max-w-sm text-center">
          {/* Header */}
          <h1 className="text-2xl font-bold mb-6 tracking-tight" style={{ color: '#1a1a1a' }}>
            ISAAC SUN
          </h1>
          
          <div className="border-t-2 border-black my-6"></div>
          
          <p className="text-gray-700 text-base leading-relaxed mb-8">
            This is a 3D interactive experience designed for desktop.
          </p>
          
          {/* Action buttons - Sharp */}
          <div className="space-y-3">
            <button
              onClick={() => setShowMobilePortfolio(true)}
              className="bg-black text-white px-6 py-3 text-sm font-semibold uppercase tracking-wide w-full border-2 border-black hover:bg-gray-900 transition-colors"
            >
              Mobile Portfolio
            </button>
            
            {onProceedAnyway && (
              <button
                onClick={onProceedAnyway}
                className="bg-white text-black px-6 py-3 text-sm font-semibold uppercase tracking-wide w-full border-2 border-black hover:bg-gray-50 transition-colors"
              >
                3D Experience
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 