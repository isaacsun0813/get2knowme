'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VisitedLandmarksProps {
  visitedLandmarks: Set<string>
  totalLandmarks: number
}

export default function VisitedLandmarks({ visitedLandmarks, totalLandmarks }: VisitedLandmarksProps) {
  const visitedCount = visitedLandmarks.size
  const isComplete = visitedCount >= totalLandmarks
  const [prevCount, setPrevCount] = useState(visitedCount)
  const [isAnimating, setIsAnimating] = useState(false)

  // Detect mobile
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

  // Trigger animation when count changes
  useEffect(() => {
    if (visitedCount > prevCount) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }
    setPrevCount(visitedCount)
  }, [visitedCount, prevCount])

  if (isMobile) return null

  const progress = (visitedCount / totalLandmarks) * 100
  const circumference = 2 * Math.PI * 20 // radius of 20
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <motion.div
      className="fixed top-6 right-6 z-30 pointer-events-none"
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: 0.3
      }}
    >
      {/* Glass morphism container */}
      <div className={`
        relative
        bg-white/75 backdrop-blur-xl
        rounded-2xl
        px-5 py-4
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        border border-white/40
        transition-all duration-500 ease-out
        ${isComplete ? 'bg-gradient-to-br from-emerald-50/80 to-green-50/80 border-emerald-200/60' : ''}
      `}>
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative flex items-center gap-4">
          {/* Circular Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 44 44">
              {/* Background ring */}
              <circle
                cx="22"
                cy="22"
                r="20"
                fill="none"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="3"
              />
              {/* Progress ring */}
              <motion.circle
                cx="22"
                cy="22"
                r="20"
                fill="none"
                stroke={isComplete ? '#10b981' : '#3b82f6'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                  duration: 0.8
                }}
                style={{
                  filter: isComplete ? 'drop-shadow(0 0 8px rgba(16,185,129,0.4))' : 'drop-shadow(0 0 6px rgba(59,130,246,0.3))'
                }}
              />
            </svg>
            
            {/* Center number */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                key={visitedCount}
                className="text-lg font-bold tabular-nums"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: isComplete ? '#10b981' : '#1f2937'
                }}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ 
                  scale: isAnimating ? [1.3, 1.5, 1] : 1,
                  opacity: 1
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 20,
                  duration: 0.4
                }}
              >
                {visitedCount}
              </motion.span>
            </div>
            
            {/* Pulse effect on increment */}
            <AnimatePresence>
              {isAnimating && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-400"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Text content */}
          <div className="flex flex-col">
            <span 
              className="text-xs font-medium uppercase tracking-[0.15em]"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#6b7280',
                letterSpacing: '0.15em'
              }}
            >
              Visited
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <motion.span
                key={`${visitedCount}-${totalLandmarks}`}
                className="text-2xl font-bold tabular-nums"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: isComplete ? '#10b981' : '#1f2937'
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20
                }}
              >
                {visitedCount}
              </motion.span>
              <span 
                className="text-sm font-medium"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: '#9ca3af'
                }}
              >
                / {totalLandmarks}
              </span>
            </div>
          </div>
        </div>

        {/* Completion celebration */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              className="absolute -top-1 -right-1"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 15
              }}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
                <motion.svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </motion.svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
