'use client'

import { useEffect, useState } from 'react'

interface VisitedLandmarksProps {
  visitedLandmarks: Set<string>
  totalLandmarks: number
}



export default function VisitedLandmarks({ visitedLandmarks, totalLandmarks }: VisitedLandmarksProps) {
  const visitedCount = visitedLandmarks.size
  const isComplete = visitedCount >= totalLandmarks

  // Don't render on mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768
      
      return (isSmallScreen && (isMobileUserAgent || isTouchDevice)) || isMobileUserAgent
    }
    
    if (checkMobile()) {
      return // Don't render on mobile
    }
  }, [])

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768
      
      const shouldHide = (isSmallScreen && (isMobileUserAgent || isTouchDevice)) || isMobileUserAgent
      setIsMobile(shouldHide)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Don't render on mobile
  if (isMobile) return null

  return (
    <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-30 pointer-events-none">
      {/* Main progress indicator - SMALLER & RESPONSIVE */}
      <div className={`
        bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl px-3 sm:px-4 md:px-6 py-3 sm:py-4 shadow-lg border border-gray-200/50
        transition-all duration-300 ease-out
        ${isComplete ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : ''}
      `}>
        <div className="flex flex-col">
          {/* Text - SMALLER & RESPONSIVE */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm text-gray-800 font-mono uppercase tracking-wider">
              Visited
            </span>
            <span className={`
              text-xs sm:text-sm transition-all duration-300 font-mono
              ${isComplete ? 'text-green-600' : 'text-gray-800'}
            `}>
              {visitedCount}/{totalLandmarks}
            </span>
          </div>
        </div>
        
        {/* Progress bar - SMALLER */}
        <div className="mt-2 sm:mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`
              h-full transition-all duration-500 ease-out rounded-full
              ${isComplete 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                : 'bg-gradient-to-r from-blue-400 to-blue-600'
              }
            `}
            style={{ width: `${(visitedCount / totalLandmarks) * 100}%` }}
          />
        </div>
        
        {/* Completion message - SMALLER */}
        {isComplete && (
          <div className="mt-2 text-center">
            <span className="text-xs text-green-600 animate-pulse font-mono uppercase tracking-wide">
              ✨ All explored! ✨
            </span>
          </div>
        )}
      </div>
      

    </div>
  )
} 