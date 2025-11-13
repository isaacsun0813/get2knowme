'use client'

import { useGLTF, useAnimations } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Plane({ 
  planeRef, 
  controlsDisabled = false,
  worldJustAppeared = false
}: { 
  planeRef: React.RefObject<THREE.Group | null>
  controlsDisabled?: boolean
  worldJustAppeared?: boolean
}) {
  const { scene, animations } = useGLTF('/models/newPlane.glb')
  const group = useRef<THREE.Group>(null)
  
  // Animation setup
  const { actions } = useAnimations(animations, group)

  // Globe parameters
  const earthRadius = 25
  const flightAltitude = 4
  
  // Physics constants
  const maxSpeed = 60
  const acceleration = 20
  const dragFactor = 2.5

  // Flight state - using quaternion-based orientation instead of euler angles
  // Start the plane directly over Saratoga (AboutMe landmark) - coordinates from flight testing
  const targetPosition = new THREE.Vector3(-10.360, 18.038, 29.206)
  const position = useRef(targetPosition.clone())
  const speed = useRef(0)
  const orientation = useRef(new THREE.Quaternion()) // Store orientation directly as quaternion
  
  // Drop-in animation state
  const dropInStartTime = useRef<number | null>(null)
  const dropInDuration = 1.0 // 1 second to drop in (faster)
  const dropInHeightMultiplier = 2.5 // Start 2.5x higher than target altitude
  const hasDroppedIn = useRef(false)
  const dropInProgress = useRef(0) // Track drop-in progress (0-1) for camera zoom
  
  // Input state
  const keysPressed = useRef<Record<string, boolean>>({})

  // Initialize planeRef with group when component mounts
  useEffect(() => {
    if (group.current && planeRef && !planeRef.current) {
      planeRef.current = group.current
      // Set initial position
      planeRef.current.position.copy(position.current)
      planeRef.current.quaternion.copy(orientation.current)
    }
  }, [])
  
  // Initialize drop-in animation when world appears
  useEffect(() => {
    if (worldJustAppeared && dropInStartTime.current === null) {
      // Calculate starting position (higher altitude)
      const targetDistance = earthRadius + flightAltitude
      const startDistance = targetDistance * dropInHeightMultiplier
      
      // Start plane at higher altitude, same direction from center
      const direction = targetPosition.clone().normalize()
      const startPosition = direction.clone().multiplyScalar(startDistance)
      position.current.copy(startPosition)
      
      // Initialize drop-in animation
      dropInStartTime.current = Date.now()
    }
  }, [worldJustAppeared])

  // Initialize the plane orientation to be properly aligned with the surface
  useEffect(() => {
    if (group.current) {
      // Start with plane oriented properly on the surface
      const up = position.current.clone().normalize()
      
      // Create a stable initial orientation
      const worldUp = new THREE.Vector3(0, 1, 0)
      
      // Create a rotation that aligns world Y with surface normal
      const quaternionToSurface = new THREE.Quaternion()
      quaternionToSurface.setFromUnitVectors(worldUp, up)
      
      // Set initial orientation
      orientation.current.copy(quaternionToSurface)
      
      // Apply initial state
      group.current.position.copy(position.current)
      group.current.setRotationFromQuaternion(orientation.current)
      
      // Plane initialized
      
      // Log available animations but don't start them yet
      if (actions && Object.keys(actions).length > 0) {
        // Animations available
        // Prepare animations but don't play them yet
        Object.values(actions).forEach(action => {
          if (action) {
            action.reset()
            action.setLoop(THREE.LoopRepeat, Infinity)
            action.paused = true // Start paused
          }
        })
      } else {
        // No animations found in the model
      }
    }
  }, [actions])

  // Track if listeners are active
  const listenersActive = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  // Keyboard handlers with enhanced cross-browser compatibility
  useEffect(() => {
    // Suppress React DevTools semver errors that can interfere with functionality
    const originalError = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      // Suppress React DevTools semver errors
      if (typeof message === 'string' && message.includes('semver')) {
        return true // Suppress the error
      }
      // Let other errors through
      if (originalError) {
        return originalError(message, source, lineno, colno, error)
      }
      return false
    }
    
    // Browser detection for compatibility fixes
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    // Improved Chrome detection - check for Chrome but not Edge/Opera
    const isChrome = /Chrome/.test(navigator.userAgent) && 
                     !/Edg/.test(navigator.userAgent) && 
                     !/OPR/.test(navigator.userAgent) &&
                     (/Google Inc/.test(navigator.vendor) || navigator.vendor === '')
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    
    // Get canvas reference - retry if not found immediately
    let canvas = document.querySelector('canvas') as HTMLCanvasElement | null
    if (canvas) {
      canvasRef.current = canvas
    } else {
      // Retry finding canvas with multiple attempts
      const findCanvas = (attempts = 0) => {
        canvas = document.querySelector('canvas') as HTMLCanvasElement | null
        if (canvas) {
          canvasRef.current = canvas
        } else if (attempts < 10) {
          setTimeout(() => findCanvas(attempts + 1), 100)
        }
      }
      findCanvas()
    }
    
    // Key code mapping for fallback support
    const keyCodeMap: Record<string, string> = {
      'w': 'KeyW', 'W': 'KeyW',
      'a': 'KeyA', 'A': 'KeyA',
      's': 'KeyS', 'S': 'KeyS',
      'd': 'KeyD', 'D': 'KeyD',
      'ArrowUp': 'ArrowUp',
      'ArrowDown': 'ArrowDown',
      'ArrowLeft': 'ArrowLeft',
      'ArrowRight': 'ArrowRight'
    }
    
    const down = (e: KeyboardEvent) => {
      try {
        // Safely get code and key properties first
        const eventCode = (e && typeof e.code === 'string') ? e.code : ''
        const eventKey = (e && typeof e.key === 'string') ? e.key : ''
        
        // Use code if available, fallback to key mapping
        const code = eventCode || (eventKey ? keyCodeMap[eventKey] : '') || ''
        
        // Prevent default for flight controls to avoid page scrolling
        const controlKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
        
        // Process control keys regardless of focus - this ensures keys always work
        if (code && controlKeys.includes(code)) {
          // Chrome: Try to restore focus, but don't block key processing
          if (isChrome) {
            const canvas = canvasRef.current || document.querySelector('canvas') as HTMLCanvasElement | null
            if (canvas && document.activeElement !== canvas) {
              try {
                // Try to restore focus, but continue processing the key anyway
                if (canvas) {
                  canvas.focus()
                }
                window.focus()
              } catch {
                // Silently handle focus errors - continue processing key
              }
            }
          }
          
          // Always process the key, even if focus isn't perfect
          if (e.preventDefault) e.preventDefault()
          // Don't stop propagation - let FlightControls component also receive the event
          // Only stop propagation if it's not a control key (to prevent page scrolling)
          keysPressed.current[code] = true
          
          // Also handle by key for maximum compatibility - store in multiple formats
          if (eventKey && ['w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(eventKey)) {
            const mappedCode = keyCodeMap[eventKey]
            if (mappedCode) {
              keysPressed.current[mappedCode] = true
            }
            // Also store by key name for extra compatibility
            keysPressed.current[eventKey.toLowerCase()] = true
            keysPressed.current[eventKey.toUpperCase()] = true
          }
        }
      } catch {
        // Silently handle any errors in keyboard event handling
      }
    }
    
    const up = (e: KeyboardEvent) => {
      try {
        // Safely get code and key properties
        const eventCode = (e && typeof e.code === 'string') ? e.code : ''
        const eventKey = (e && typeof e.key === 'string') ? e.key : ''
        
        // Use code if available, fallback to key mapping
        const code = eventCode || (eventKey ? keyCodeMap[eventKey] : '') || ''
        const controlKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
        
        if (code && controlKeys.includes(code)) {
          if (e.preventDefault) e.preventDefault()
          // Don't stop propagation - let FlightControls component also receive the event
          keysPressed.current[code] = false
          
          // Also handle by key for maximum compatibility - clear all formats
          if (eventKey && ['w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(eventKey)) {
            const mappedCode = keyCodeMap[eventKey]
            if (mappedCode) {
              keysPressed.current[mappedCode] = false
            }
            // Also clear by key name
            keysPressed.current[eventKey.toLowerCase()] = false
            keysPressed.current[eventKey.toUpperCase()] = false
          }
        }
      } catch {
        // Silently handle any errors in keyboard event handling
      }
    }
    
    
    // Focus management for Mac/Safari/Chrome
    // Chrome especially needs proactive focus management
    // Use the canvas we already found above
    const cleanupFunctions: Array<() => void> = []
    
    if (canvas) {
      canvas.setAttribute('tabindex', '0')
      canvas.style.outline = 'none'
      canvas.style.cursor = 'default'
      
      // Make canvas focusable and ensure it gets focus
      const focusCanvas = () => {
        try {
          if (canvas) {
            canvas.focus()
          }
          window.focus()
        } catch {
          // Silently handle focus errors
        }
      }
      
      // Focus on click (persistent, not once)
      canvas.addEventListener('click', focusCanvas)
      cleanupFunctions.push(() => {
        if (canvas) {
          canvas.removeEventListener('click', focusCanvas)
        }
      })
      
      // Chrome-specific: More aggressive focus management
      if (isChrome) {
        // Focus immediately when component mounts
        setTimeout(focusCanvas, 100)
        setTimeout(focusCanvas, 500)
        setTimeout(focusCanvas, 1000)
        
        // Focus on any mouse interaction with canvas
        canvas.addEventListener('mousedown', focusCanvas)
        cleanupFunctions.push(() => {
          if (canvas) {
            canvas.removeEventListener('mousedown', focusCanvas)
          }
        })
        
        canvas.addEventListener('mouseenter', focusCanvas)
        cleanupFunctions.push(() => {
          if (canvas) {
            canvas.removeEventListener('mouseenter', focusCanvas)
          }
        })
        
        // Restore focus after zoom operations
        const wheelHandler = (e: WheelEvent) => {
          if (e.ctrlKey || e.metaKey) {
            setTimeout(focusCanvas, 200)
          }
        }
        window.addEventListener('wheel', wheelHandler, { passive: true })
        cleanupFunctions.push(() => window.removeEventListener('wheel', wheelHandler))
        
        // Proactively restore focus before keyboard events
        // This is critical - Chrome needs focus BEFORE keydown
        const restoreFocusBeforeKey = (e: KeyboardEvent) => {
          try {
            // Safely check event code
            const eventCode = (e && typeof e.code === 'string') ? e.code : ''
            if (!eventCode) return
            
            // Only for control keys
            const controlKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
            if (controlKeys.includes(eventCode)) {
              // Check if canvas has focus
              if (document.activeElement !== canvas) {
                focusCanvas()
              }
            }
          } catch {
            // Silently handle errors
          }
        }
        
        // Use capture phase to restore focus BEFORE the event reaches handlers
        window.addEventListener('keydown', restoreFocusBeforeKey, { capture: true, passive: true })
        cleanupFunctions.push(() => window.removeEventListener('keydown', restoreFocusBeforeKey, { capture: true }))
        
        document.addEventListener('keydown', restoreFocusBeforeKey, { capture: true, passive: true })
        cleanupFunctions.push(() => document.removeEventListener('keydown', restoreFocusBeforeKey, { capture: true }))
        
        // Also restore on window focus
        window.addEventListener('focus', focusCanvas)
        cleanupFunctions.push(() => window.removeEventListener('focus', focusCanvas))
        
        const blurHandler = () => {
          setTimeout(focusCanvas, 100)
        }
        window.addEventListener('blur', blurHandler)
        cleanupFunctions.push(() => window.removeEventListener('blur', blurHandler))
      }
      
      // Safari/Mac focus management
      if (isSafari || isMac) {
        window.addEventListener('load', focusCanvas)
        cleanupFunctions.push(() => window.removeEventListener('load', focusCanvas))
        
        window.addEventListener('focus', focusCanvas)
        cleanupFunctions.push(() => window.removeEventListener('focus', focusCanvas))
        
        const visibilityHandler = () => {
          if (!document.hidden) {
            focusCanvas()
          }
        }
        document.addEventListener('visibilitychange', visibilityHandler)
        cleanupFunctions.push(() => document.removeEventListener('visibilitychange', visibilityHandler))
      }
    }
    
    // Add event listeners with multiple options for compatibility
    const options: AddEventListenerOptions = { 
      passive: false,
      capture: false
    }
    
    // Try multiple targets and phases for maximum compatibility
    // Capture phase listeners (catch events early, before React DevTools can interfere)
    window.addEventListener('keydown', down, { passive: false, capture: true })
    window.addEventListener('keyup', up, { passive: false, capture: true })
    document.addEventListener('keydown', down, { passive: false, capture: true })
    document.addEventListener('keyup', up, { passive: false, capture: true })
    
    // Bubble phase listeners (backup)
    window.addEventListener('keydown', down, options)
    window.addEventListener('keyup', up, options)
    document.addEventListener('keydown', down, options)
    document.addEventListener('keyup', up, options)
    
    // Also attach to document.body as final fallback
    if (document.body) {
      document.body.addEventListener('keydown', down, { passive: false, capture: true })
      document.body.addEventListener('keyup', up, { passive: false, capture: true })
      cleanupFunctions.push(() => {
        document.body.removeEventListener('keydown', down, { capture: true })
        document.body.removeEventListener('keyup', up, { capture: true })
      })
    }
    
    // Mark listeners as active
    listenersActive.current = true
    
    // Chrome-specific: Periodic focus check to ensure canvas stays focused
    let focusCheckInterval: NodeJS.Timeout | null = null
    if (isChrome && canvas) {
      const focusCanvas = () => {
        try {
          if (canvas) {
            canvas.focus()
          }
          window.focus()
        } catch {
          // Silently handle focus errors
        }
      }
      
      // Check focus every 2 seconds and restore if needed
      focusCheckInterval = setInterval(() => {
        if (document.activeElement !== canvas && listenersActive.current) {
          focusCanvas()
        }
      }, 2000)
    }
    
    return () => {
      listenersActive.current = false
      // Restore original error handler
      if (originalError) {
        window.onerror = originalError
      } else {
        window.onerror = null
      }
      // Remove all event listeners (both capture and non-capture)
      window.removeEventListener('keydown', down, { capture: true })
      window.removeEventListener('keyup', up, { capture: true })
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      document.removeEventListener('keydown', down, { capture: true })
      document.removeEventListener('keyup', up, { capture: true })
      document.removeEventListener('keydown', down)
      document.removeEventListener('keyup', up)
      if (document.body) {
        document.body.removeEventListener('keydown', down, { capture: true })
        document.body.removeEventListener('keyup', up, { capture: true })
      }
      // Run all cleanup functions
      cleanupFunctions.forEach(cleanup => cleanup())
      // Clear focus check interval
      if (focusCheckInterval) {
        clearInterval(focusCheckInterval)
      }
    }
  }, [])

  useFrame((state, delta) => {
    if (!group.current) return

    // 0. HANDLE DROP-IN ANIMATION
    if (dropInStartTime.current !== null) {
      const elapsed = (Date.now() - dropInStartTime.current) / 1000
      
      if (elapsed < dropInDuration) {
        // Smooth ease-out curve for natural drop
        const t = elapsed / dropInDuration
        const easedT = 1 - Math.pow(1 - t, 3) // Ease-out cubic
        
        // Track progress for camera zoom
        dropInProgress.current = t
        
        // Interpolate from start to target position
        const targetDistance = earthRadius + flightAltitude
        const startDistance = targetDistance * dropInHeightMultiplier
        const currentDistance = startDistance + (targetDistance - startDistance) * easedT
        
        // Maintain same direction, just change distance from center
        const direction = targetPosition.clone().normalize()
        const currentPosition = direction.clone().multiplyScalar(currentDistance)
        position.current.copy(currentPosition)
        
        // Update orientation to align with surface at current position
        const surfaceNormal = currentPosition.clone().normalize()
        const worldUp = new THREE.Vector3(0, 1, 0)
        const quaternionToSurface = new THREE.Quaternion()
        quaternionToSurface.setFromUnitVectors(worldUp, surfaceNormal)
        orientation.current.copy(quaternionToSurface)
        
        // Update visual immediately
        group.current.position.copy(position.current)
        group.current.setRotationFromQuaternion(orientation.current)
        
        // Update planeRef for camera (include drop-in progress for zoom effect)
        if (planeRef.current) {
          planeRef.current.position.copy(position.current)
          planeRef.current.quaternion.copy(orientation.current)
          planeRef.current.userData.dropInProgress = dropInProgress.current
          
          // Set forward vector for camera (plane's forward is +X in local space)
          const cameraForward = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation.current)
          planeRef.current.userData.forward = cameraForward
          planeRef.current.userData.up = surfaceNormal
          planeRef.current.userData.speed = 0
        }
        
        // Don't process other movement during drop-in
        return
      } else {
        // Drop-in complete, snap to final position
        position.current.copy(targetPosition)
        dropInStartTime.current = null
        dropInProgress.current = 1
        hasDroppedIn.current = true
        
        // Clear drop-in progress after a moment
        if (planeRef.current) {
          planeRef.current.userData.dropInProgress = 1
        }
      }
    } else {
      // Clear drop-in progress when not dropping
      dropInProgress.current = 1
      if (planeRef.current) {
        planeRef.current.userData.dropInProgress = 1
      }
    }

    // 1. HANDLE SPEED CONTROL
    let isThrottling = false
    
    // Skip controls if disabled (e.g., when popup is open)
    if (controlsDisabled) {
      // Apply stronger drag to gradually slow down the plane
      speed.current -= dragFactor * speed.current * delta * 2
    } else {
      // Enhanced key detection with fallbacks for compatibility
      // Check all possible key formats to ensure we catch the key
      const wPressed = keysPressed.current['KeyW'] || 
                       keysPressed.current['w'] || 
                       keysPressed.current['W'] ||
                       keysPressed.current['keyw'] ||
                       keysPressed.current['KEYW']
      const sPressed = keysPressed.current['KeyS'] || 
                       keysPressed.current['s'] || 
                       keysPressed.current['S'] ||
                       keysPressed.current['keys'] ||
                       keysPressed.current['KEYS']
      
      if (wPressed) {
        isThrottling = true
        speed.current += acceleration * delta
        // Ensure speed increases even if drag is strong
        if (speed.current < 0.5) {
          speed.current = Math.max(speed.current, 0.5) // Minimum speed when throttling
        }
      }
      if (sPressed) {
        speed.current -= acceleration * delta
      }

      // Apply normal drag
      const currentDrag = isThrottling ? dragFactor * 0.4 : dragFactor * 1.2
      speed.current -= currentDrag * speed.current * delta
    }
    
    speed.current = THREE.MathUtils.clamp(speed.current, 0, maxSpeed)
    
    if (speed.current < 0.3) speed.current = 0

    // ANIMATION CONTROL - Play when flying, pause when stopped
    if (actions && Object.keys(actions).length > 0) {
      Object.values(actions).forEach(action => {
        if (action) {
          if (speed.current > 0.1) {
            // Flying - play animation
            if (action.paused) {
              action.paused = false
              action.play()
            }
          } else {
            // Stopped - pause animation
            if (!action.paused) {
              action.paused = true
            }
          }
        }
      })
    }

    // 2. HANDLE ROTATIONS - Apply incremental rotations to current orientation
    const rotationSpeed = 1.5
    const maxPitchAngle = Math.PI / 6 // 30 degrees max pitch
    const maxBankAngle = Math.PI / 4 // 45 degrees max bank
    
    // Get current surface normal for reference
    const surfaceNormal = position.current.clone().normalize()
    
    // Calculate current orientation vectors
    const currentRight = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation.current)

    // Track turning input for banking
    let turnInput = 0

    // Only apply rotations if controls are not disabled
    if (!controlsDisabled) {
      // Enhanced key detection with fallbacks for compatibility
      const aPressed = keysPressed.current['KeyA'] || keysPressed.current['a'] || keysPressed.current['A'] || keysPressed.current['ArrowLeft']
      const dPressed = keysPressed.current['KeyD'] || keysPressed.current['d'] || keysPressed.current['D'] || keysPressed.current['ArrowRight']
      const upPressed = keysPressed.current['ArrowUp']
      const downPressed = keysPressed.current['ArrowDown']
      
      // Apply yaw (heading) rotations around surface normal WITH BANKING
      if (aPressed) {
        const yawRotation = new THREE.Quaternion()
        yawRotation.setFromAxisAngle(surfaceNormal, rotationSpeed * delta)
        orientation.current.premultiply(yawRotation)
        turnInput = 1 // Left turn
      }
      if (dPressed) {
        const yawRotation = new THREE.Quaternion()
        yawRotation.setFromAxisAngle(surfaceNormal, -rotationSpeed * delta)
        orientation.current.premultiply(yawRotation)
        turnInput = -1 // Right turn
      }

      // Apply pitch rotations around current right vector
      if (upPressed) {
        const pitchRotation = new THREE.Quaternion()
        pitchRotation.setFromAxisAngle(currentRight, -rotationSpeed * delta)
        orientation.current.multiply(pitchRotation)
      }
      if (downPressed) {
        const pitchRotation = new THREE.Quaternion()
        pitchRotation.setFromAxisAngle(currentRight, rotationSpeed * delta)
        orientation.current.multiply(pitchRotation)
      }
    }

    // REALISTIC BANKING DURING TURNS
    if (speed.current > 5) { // Only bank when actually moving
      const bankingForce = turnInput * maxBankAngle * 0.3 // 30% of max bank
      const currentForwardVector = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation.current)
      
      // Apply banking rotation around the forward axis (roll)
      if (Math.abs(bankingForce) > 0.01) {
        const bankRotation = new THREE.Quaternion()
        bankRotation.setFromAxisAngle(currentForwardVector, bankingForce * delta * 3)
        orientation.current.multiply(bankRotation)
        
        // Banking applied
      }
    }

    // DYNAMIC PITCH BASED ON SPEED CHANGES
    const speedChangeThreshold = 2
    if (isThrottling && speed.current > speedChangeThreshold) {
      // Climbing - slight nose up attitude
      const climbPitch = 0.1 // Gentle climb angle
      const climbRotation = new THREE.Quaternion()
      climbRotation.setFromAxisAngle(currentRight, climbPitch * delta * 0.5)
      orientation.current.multiply(climbRotation)
    } else if (!isThrottling && speed.current > speedChangeThreshold) {
      // Descending - slight nose down attitude  
      const divePitch = -0.05 // Gentle dive angle
      const diveRotation = new THREE.Quaternion()
      diveRotation.setFromAxisAngle(currentRight, divePitch * delta * 0.5)
      orientation.current.multiply(diveRotation)
    }

    // 3. CONSTRAIN ORIENTATION to prevent excessive pitch and maintain surface alignment
    // Recalculate vectors after rotation
    const newUp = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation.current)
    
    // Limit pitch by ensuring up vector doesn't deviate too much from surface normal
    const pitchAngle = Math.acos(THREE.MathUtils.clamp(newUp.dot(surfaceNormal), -1, 1))
    if (pitchAngle > maxPitchAngle) {
      // Correct orientation to limit pitch
      const correctionAxis = new THREE.Vector3().crossVectors(newUp, surfaceNormal).normalize()
      const correctionAngle = pitchAngle - maxPitchAngle
      const correctionQuat = new THREE.Quaternion()
      correctionQuat.setFromAxisAngle(correctionAxis, -correctionAngle)
      orientation.current.multiply(correctionQuat)
    }

    // 4. MOVEMENT - Only if we have speed
    if (speed.current > 0.1) {
      // Get the current forward direction (nose of the model points +X in local space)
      const forwardDirection = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation.current)
      
      // Calculate movement
      const movement = forwardDirection.clone().multiplyScalar(speed.current * delta)
      position.current.add(movement)
      

    }

    // 5. MAINTAIN ALTITUDE - Keep plane at proper distance from Earth center
    const targetDistance = earthRadius + flightAltitude
    position.current.normalize().multiplyScalar(targetDistance)

    // 6. SURFACE ALIGNMENT - Gradually align plane orientation with new surface position
    const newSurfaceNormal = position.current.clone().normalize()
    const currentUpDirection = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation.current)
    
    // Calculate how much the surface normal has changed
    const alignmentAmount = 0.1 // How quickly to align with surface (0.1 = gentle)
    const surfaceAlignment = new THREE.Quaternion()
    surfaceAlignment.setFromUnitVectors(currentUpDirection, newSurfaceNormal)
    
    // Apply a small portion of the alignment each frame
    surfaceAlignment.slerp(new THREE.Quaternion(), 1 - alignmentAmount)
    orientation.current.premultiply(surfaceAlignment)

    // 7. APPLY TO VISUAL ELEMENTS
    group.current.position.copy(position.current)
    group.current.setRotationFromQuaternion(orientation.current)

    // Update planeRef for camera - ensure it's always set
    if (planeRef.current) {
      planeRef.current.position.copy(position.current)
      planeRef.current.quaternion.copy(orientation.current)
      
      const cameraForward = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation.current)
      planeRef.current.userData.forward = cameraForward
      planeRef.current.userData.up = newSurfaceNormal
      planeRef.current.userData.speed = speed.current
      planeRef.current.userData.dropInProgress = dropInProgress.current
    } else {
      // Initialize planeRef if it doesn't exist
      if (group.current && planeRef) {
        planeRef.current = group.current
      }
    }
  })

  // Error boundary for GLTF loading
  if (!scene) {
    return null
  }

  return <primitive ref={group} object={scene} scale={1.1} />
}

// Preload plane model with error handling
try {
  useGLTF.preload('/models/newPlane.glb')
} catch {
  // Silently handle preload errors
}
