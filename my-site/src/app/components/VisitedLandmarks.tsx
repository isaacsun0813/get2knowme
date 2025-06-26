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
    <div className="fixed top-6 right-6 z-40 pointer-events-none">
      {/* Main progress indicator - much larger */}
      <div className={`
        bg-white/95 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-xl border border-gray-200/50
        transition-all duration-300 ease-out
        ${isComplete ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : ''}
      `}>
        <div className="flex flex-col">
          {/* Text - clean with consistent sizing using global fonts */}
          <div className="flex items-baseline gap-3">
            <span className="text-lg text-gray-800 font-mono uppercase tracking-wider">
              Visited
            </span>
            <span className={`
              text-lg transition-all duration-300 font-mono
              ${isComplete ? 'text-green-600' : 'text-gray-800'}
            `}>
              {visitedCount}/{totalLandmarks}
            </span>
          </div>
        </div>
        
        {/* Progress bar - larger */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`
              h-full transition-all duration-500 ease-out rounded-full
              ${isComplete 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                : 'bg-gradient-to-r from-blue-400 to-purple-500'
              }
            `}
            style={{ width: `${(visitedCount / totalLandmarks) * 100}%` }}
          />
        </div>
        
        {/* Completion message - larger */}
        {isComplete && (
          <div className="mt-3 text-center">
            <span className="text-sm text-green-600 animate-pulse font-mono uppercase tracking-wide">
              ✨ All landmarks explored! ✨
            </span>
          </div>
        )}
      </div>
      

    </div>
  )
} 