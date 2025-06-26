'use client'

import { useEffect, useRef, useState } from 'react'

interface MobileControlsProps {
  disabled?: boolean
}

export default function MobileControls({ disabled = false }: MobileControlsProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })
  const joystickRef = useRef<HTMLDivElement>(null) // eslint-disable-line @typescript-eslint/no-unused-vars
  const containerRef = useRef<HTMLDivElement>(null)
  const activeKeysRef = useRef<Set<string>>(new Set())

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
      const shouldShow = isSmallScreen || isMobileUserAgent || isIOS || isTouchDevice
      
      console.log('🎮 MobileControls detection (DETAILED):', {
        userAgent: userAgent,
        isMobileUserAgent,
        isTouchDevice,
        isSmallScreen,
        isIOS,
        screenWidth: window.innerWidth,
        maxTouchPoints: navigator.maxTouchPoints,
        shouldShow,
        windowType: typeof window
      })
      
      setIsMobile(shouldShow)
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

  // Force show on very small screens as backup
  const forceShowOnSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 480

  // Don't render on desktop
  if (!isMobile && !forceShowOnSmallScreen) {
    console.log('🚫 MobileControls hidden on desktop (mobile:', isMobile, ', smallScreen:', forceShowOnSmallScreen, ')')
    return null
  }

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

  // Calculate movement and simulate keyboard events
  const handleJoystickMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Calculate relative position from center
    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    
    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = rect.width / 2 - 10 // Account for knob size
    
    // Normalize position within circle
    let normalizedX = deltaX / maxDistance
    let normalizedY = deltaY / maxDistance
    
    // Clamp to circle bounds
    if (distance > maxDistance) {
      normalizedX = (deltaX / distance) * (maxDistance / maxDistance)
      normalizedY = (deltaY / distance) * (maxDistance / maxDistance)
    }
    
    // Update visual position
    setJoystickPosition({ 
      x: normalizedX * (maxDistance - 10), 
      y: normalizedY * (maxDistance - 10) 
    })
    
    // Determine which keys should be active based on position
    const newActiveKeys = new Set<string>()
    
    // Up movement = speed up (W)
    if (normalizedY < -0.3) {
      newActiveKeys.add('KeyW')
    }
    
    // Left/Right movement = direct steering
    if (normalizedX < -0.2) {
      newActiveKeys.add('KeyA')
    } else if (normalizedX > 0.2) {
      newActiveKeys.add('KeyD')
    }
    
    // Handle key state changes
    const currentKeys = activeKeysRef.current
    
    // Release keys that are no longer active
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

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setIsActive(true)
    
    const touch = e.touches[0]
    console.log('🎮 Touch start:', touch.clientX, touch.clientY)
    handleJoystickMove(touch.clientX, touch.clientY)
  }

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isActive || disabled) return
    e.preventDefault()
    e.stopPropagation()
    
    const touch = e.touches[0]
    console.log('🎮 Touch move:', touch.clientX, touch.clientY)
    handleJoystickMove(touch.clientX, touch.clientY)
  }

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setIsActive(false)
    setJoystickPosition({ x: 0, y: 0 })
    
    console.log('🎮 Touch end - releasing all keys')
    // Release all active keys
    activeKeysRef.current.forEach(key => {
      simulateKeyEvent(key, 'keyup')
    })
    activeKeysRef.current.clear()
  }

  // Add mouse support for testing on desktop with touch simulation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsActive(true)
    
    console.log('🖱️ Mouse down:', e.clientX, e.clientY)
    handleJoystickMove(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isActive || disabled) return
    e.preventDefault()
    
    console.log('🖱️ Mouse move:', e.clientX, e.clientY)
    handleJoystickMove(e.clientX, e.clientY)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsActive(false)
    setJoystickPosition({ x: 0, y: 0 })
    
    console.log('🖱️ Mouse up - releasing all keys')
    // Release all active keys
    activeKeysRef.current.forEach(key => {
      simulateKeyEvent(key, 'keyup')
    })
    activeKeysRef.current.clear()
  }

  console.log('✅ MobileControls showing on mobile')
  return (
    <div className="fixed bottom-20 right-6 z-50 pointer-events-auto">
      {/* Joystick Container - Made bigger */}
      <div 
        ref={containerRef}
        className={`relative w-40 h-40 rounded-full border-4 transition-all duration-200 select-none ${
          disabled 
            ? 'bg-gray-200/50 border-gray-300/50' 
            : isActive 
              ? 'bg-blue-100/80 border-blue-400/80 shadow-lg' 
              : 'bg-white/80 border-gray-400/80 shadow-md'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Joystick knob */}
        <div 
          className={`absolute w-8 h-8 rounded-full border-2 transition-all duration-100 ${
            disabled 
              ? 'bg-gray-300 border-gray-400' 
              : isActive 
                ? 'bg-blue-500 border-blue-600 shadow-lg' 
                : 'bg-white border-gray-500 shadow-md'
          }`}
          style={{
            left: `calc(50% + ${joystickPosition.x}px - 16px)`,
            top: `calc(50% + ${joystickPosition.y}px - 16px)`,
          }}
        />
        
        {/* Direction indicators */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-gray-600 font-bold text-sm">W</div>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold text-sm">A</div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold text-sm">D</div>
      </div>

      {/* Simplified Instructions */}
      <div className="mt-3 text-center break-words">
        <div className="bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-mono">
          Touch to Fly
        </div>
      </div>
    </div>
  )
} 