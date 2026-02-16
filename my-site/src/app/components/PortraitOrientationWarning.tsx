'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Portrait Orientation Warning
 * Shows an animated prompt to rotate device to landscape when in portrait mode
 */
export default function PortraitOrientationWarning() {
  const [isPortrait, setIsPortrait] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window === 'undefined') return

      // Check if mobile device
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent)
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isMobileDevice = isIOS || (isMobileUserAgent && hasTouch)

      setIsMobile(isMobileDevice)

      // Check if portrait (height > width)
      const isPortraitMode = window.innerHeight > window.innerWidth
      setIsPortrait(isPortraitMode && isMobileDevice)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  if (!isPortrait || !isMobile) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white border-4 border-black p-8 max-w-sm mx-4 text-center"
        >
          {/* Rotating arrows animation */}
          <motion.div
            animate={{ rotate: [0, 90, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="text-6xl mb-4"
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <path d="M12 2v20M12 2l4 4M12 2L8 6M12 22l4-4M12 22l-4-4" />
            </svg>
          </motion.div>

          <h2 className="text-xl font-bold uppercase tracking-wide mb-2 text-black">
            Rotate Your Device
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            For the best experience, please rotate your device to landscape mode
          </p>

          {/* Arrow indicators */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <motion.div
              animate={{ x: [-10, 10, -10] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="text-2xl"
            >
              ←
            </motion.div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">
              Landscape
            </div>
            <motion.div
              animate={{ x: [10, -10, 10] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="text-2xl"
            >
              →
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
