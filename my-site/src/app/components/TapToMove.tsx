'use client'

import { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'

interface TapToMoveProps {
  disabled?: boolean
}

/**
 * Tap to Move - Mobile touch controls (DOM event handler)
 * Plane flies directly to where user taps (straight line flight)
 */
export default function TapToMove({ disabled = false }: TapToMoveProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const isHoldingRef = useRef(false)

  useEffect(() => {
    setIsClient(true)
    
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent)
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const shouldShow = isIOS || (isMobileUserAgent && hasTouch)
      setIsMobile(shouldShow)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Setup touch event listeners
  useEffect(() => {
    if (!isMobile || !isClient || disabled) return

    // Handle tap - call handler from TapToMoveHandler
    const handleTap = (clientX: number, clientY: number) => {
      const handler = (window as Window & { __tapToMoveHandler?: (x: number, y: number) => void }).__tapToMoveHandler
      if (handler) {
        handler(clientX, clientY)
      }
    }

    // Handle touch start
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      isHoldingRef.current = true
      const touch = e.touches[0]
      handleTap(touch.clientX, touch.clientY)
    }

    // Handle touch move - update target while dragging
    const handleTouchMove = (e: TouchEvent) => {
      if (!isHoldingRef.current) return
      e.preventDefault()
      const touch = e.touches[0]
      handleTap(touch.clientX, touch.clientY)
    }

    // Handle touch end - clear target
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      isHoldingRef.current = false
      // Clear target by calling handler with null
      const windowWithRefs = window as Window & { 
        __planeRef?: React.RefObject<THREE.Object3D | null>
      }
      const planeRef = windowWithRefs.__planeRef
      if (planeRef?.current) {
        planeRef.current.userData.mobileTarget = null
      }
    }

    const canvas = document.querySelector('canvas')
    const targetElement = canvas || document.body

    targetElement.addEventListener('touchstart', handleTouchStart, { passive: false })
    targetElement.addEventListener('touchmove', handleTouchMove, { passive: false })
    targetElement.addEventListener('touchend', handleTouchEnd, { passive: false })
    targetElement.addEventListener('touchcancel', handleTouchEnd, { passive: false })

    return () => {
      targetElement.removeEventListener('touchstart', handleTouchStart)
      targetElement.removeEventListener('touchmove', handleTouchMove)
      targetElement.removeEventListener('touchend', handleTouchEnd)
      targetElement.removeEventListener('touchcancel', handleTouchEnd)
      isHoldingRef.current = false
    }
  }, [isMobile, isClient, disabled])

  return null
}
