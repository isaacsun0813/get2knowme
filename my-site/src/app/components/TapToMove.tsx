'use client'

import { useEffect, useState, useRef } from 'react'

interface TapToMoveProps {
  disabled?: boolean
}

/**
 * Tap to Move - Mobile touch controls
 * Tap and hold anywhere on screen to move the plane in that direction
 */
export default function TapToMove({ disabled = false }: TapToMoveProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const activeKeysRef = useRef<Set<string>>(new Set())
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

  // Simulate keyboard events
  const simulateKeyEvent = (keyCode: string, type: 'keydown' | 'keyup') => {
    const keyMap: Record<string, string> = {
      'KeyW': 'w',
      'KeyA': 'a',
      'KeyD': 'd'
    }

    const event = new KeyboardEvent(type, {
      code: keyCode,
      key: keyMap[keyCode] || '',
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(event)
  }

  // Setup touch event listeners
  useEffect(() => {
    if (!isMobile || !isClient || disabled) return

    // Release all keys
    const releaseAllKeys = () => {
      activeKeysRef.current.forEach(key => {
        simulateKeyEvent(key, 'keyup')
      })
      activeKeysRef.current.clear()
    }

    // Handle tap/hold - convert position to movement direction
    const updateMovement = (clientX: number, clientY: number) => {
      // Get screen center (where plane appears to be)
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      // Calculate direction from center to tap point
      const deltaX = clientX - centerX
      const deltaY = clientY - centerY
      
      // Calculate distance from center
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      // Calculate angle from center (0 = right, 90 = down, 180 = left, 270 = up)
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
      
      // Calculate horizontal and vertical ratios
      const horizontalRatio = deltaX / (window.innerWidth / 2) // -1 to 1
      const verticalRatio = Math.abs(deltaY) / (window.innerHeight / 2) // 0 to 1
      
      // Determine if tap is mostly "forward" (small horizontal relative to vertical)
      // If the tap is mostly forward, don't turn - just go straight
      const horizontalThreshold = 0.15 // Increased threshold - only turn if significant horizontal offset
      const forwardThreshold = 0.3 // If vertical movement is significant, allow more horizontal before turning
      
      // If tap is mostly forward (small horizontal relative to vertical), don't turn
      const isMostlyForward = Math.abs(horizontalRatio) < horizontalThreshold || 
                              (verticalRatio > forwardThreshold && Math.abs(horizontalRatio) < horizontalThreshold * 1.5)

      // Determine movement direction
      const newActiveKeys = new Set<string>()

      // Always speed up when holding
      newActiveKeys.add('KeyW')

      // Only turn if there's significant horizontal offset AND it's not mostly forward
      // This prevents over-turning when the plane is already facing the right direction
      if (!isMostlyForward && distance > 20) {
        if (horizontalRatio < -horizontalThreshold) {
          // Left side - turn left
          newActiveKeys.add('KeyA')
        } else if (horizontalRatio > horizontalThreshold) {
          // Right side - turn right
          newActiveKeys.add('KeyD')
        }
      }

      // Release keys that are no longer active
      const currentKeys = activeKeysRef.current
      currentKeys.forEach(key => {
        if (!newActiveKeys.has(key)) {
          simulateKeyEvent(key, 'keyup')
          currentKeys.delete(key)
        }
      })

      // Press new keys
      newActiveKeys.forEach(key => {
        if (!currentKeys.has(key)) {
          simulateKeyEvent(key, 'keydown')
          currentKeys.add(key)
        }
      })
    }

    // Handle touch start - begin hold
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      isHoldingRef.current = true
      const touch = e.touches[0]
      updateMovement(touch.clientX, touch.clientY)
    }

    // Handle touch move - update direction while holding
    const handleTouchMove = (e: TouchEvent) => {
      if (!isHoldingRef.current) return
      e.preventDefault()
      const touch = e.touches[0]
      updateMovement(touch.clientX, touch.clientY)
    }

    // Handle touch end - release keys
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      isHoldingRef.current = false
      releaseAllKeys()
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
      releaseAllKeys()
    }
  }, [isMobile, isClient, disabled])


  return null
}
