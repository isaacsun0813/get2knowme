'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Linkedin, Github, Youtube, Mail, FileText } from 'lucide-react'

interface AboutMeProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutMe({ isOpen, onClose }: AboutMeProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [, setIsAnimating] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Profile image to preload
  const profileImage = '/photos/profilePic.jpeg'

  useEffect(() => {
    const img = new window.Image()
    img.onerror = () => {}
    img.src = profileImage
  }, [])

  const handleClose = useCallback(() => {
    // Call onClose immediately to trigger exit animation
    onClose()
  }, [onClose])

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleClose])

  // Mouse parallax for profile image - throttled with RAF
  useEffect(() => {
    if (!isOpen || !profileRef.current) return

    let rafId: number | null = null
    let lastTime = 0
    const throttleMs = 16 // ~60fps

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastTime < throttleMs) return
      lastTime = now

      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }

      rafId = requestAnimationFrame(() => {
        const rect = profileRef.current?.getBoundingClientRect()
        if (!rect) return

        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        const deltaX = (e.clientX - centerX) / rect.width
        const deltaY = (e.clientY - centerY) / rect.height
        
        setMousePosition({
          x: deltaX * 2, // ±2px max
          y: deltaY * 2
        })
        rafId = null
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isOpen])

  // Animation handling - keep component mounted during exit animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsAnimating(true)
      }, 10)
      return () => clearTimeout(timer)
    } else {
      // Keep shouldRender true during exit animation, then unmount
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 800) // Match exit animation duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!shouldRender) return null

  return (
    <AnimatePresence>
      {shouldRender && (
            <>
              {/* Backdrop with blur and desaturation - Increased dimming */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="fixed inset-0 z-50"
        onClick={handleClose}
                style={{
                  backdropFilter: 'blur(40px) saturate(0.3)',
                  background: 'rgba(0,0,0,0.55)'
                }}
              />
          
          {/* Floating Dust Particles */}
          <div className="fixed inset-0 z-[51] pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`,
                  background: 'rgba(255,255,255,0.05)',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100],
                  opacity: [0, 0.05, 0]
                }}
                transition={{
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>

              {/* Skyglass Identity Card - Gradual appearance */}
              <motion.div
                key="modal"
                ref={modalRef}
                initial={{ 
                  opacity: 0, 
                  scale: 0.92,
                  filter: 'blur(12px)'
                }}
                animate={{ 
                  opacity: isOpen ? 1 : 0, 
                  scale: isOpen ? 1 : 0.92,
                  filter: isOpen ? 'blur(0px)' : 'blur(8px)'
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.92,
                  filter: 'blur(8px)'
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.23, 1, 0.32, 1] // easeOutQuint approximation
                }}
                onClick={(e) => e.stopPropagation()}
                className="fixed inset-0 z-[52] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
              >
                <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto">
                  {/* Ambient Light Streaks */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-full h-px"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                          top: `${20 + i * 30}%`,
                          filter: 'blur(1px)'
                        }}
                        animate={{
                          x: ['-100%', '200%']
                        }}
                        transition={{
                          duration: 8 + i * 2,
                          repeat: Infinity,
                          ease: 'linear',
                          delay: i * 2
                        }}
                      />
                    ))}
                  </div>

                  {/* Main Glass Container - More opaque for readability */}
                  <div 
              className="relative w-full rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(240,248,255,0.90) 50%, rgba(255,255,255,0.92) 100%)',
                backdropFilter: 'blur(30px)',
                boxShadow: `
                  0px 30px 60px rgba(0,0,0,0.2),
                  0px 0px 0px 1px rgba(255,255,255,0.8),
                  inset 0px 1px 0px rgba(255,255,255,0.9),
                  0px 0px 100px rgba(255,255,255,0.4),
                  0px 0px 0px 1px rgba(0,0,0,0.05)
                `,
                border: '1px solid rgba(255,255,255,0.6)'
              }}
            >
              {/* Bloom Edge Highlight */}
              <div 
                className="absolute inset-0 pointer-events-none"
             style={{
                  borderRadius: '1.5rem',
                  boxShadow: 'inset 0px 0px 40px rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              />

              {/* Close Button - Larger Glass Orb */}
              <motion.button
            onClick={handleClose}
                className="absolute top-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center group"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.5)'
                }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 90,
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <X 
                  size={24} 
                  className="text-gray-600 group-hover:text-gray-800 transition-colors duration-200"
                  strokeWidth={2.5}
                />
              </motion.button>

              {/* Content - Scrollable */}
              <div className="relative overflow-y-auto max-h-[90vh] p-8 sm:p-10 md:p-12">
                
                {/* Header - Asymmetric Left-Aligned */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, duration: 0.4 }}
                  className="mb-10"
                >
                  <h1 
                    className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4"
                    style={{
                      fontFamily: 'Satoshi, Manrope, system-ui, sans-serif',
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #4a6eff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.04em',
                      lineHeight: '1.1'
                    }}
                  >
                    About Me
                  </h1>
                  <div 
                    className="h-px mt-6"
                    style={{
                      width: '120px',
                      background: 'linear-gradient(to right, rgba(74,110,255,0.4), transparent)'
                    }}
                  />
                </motion.div>

                {/* Profile Section - Floating Orb with Parallax */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="mb-12"
                >
                  <motion.div
                    ref={profileRef}
                    className="relative inline-block mb-6"
                    animate={{
                      y: [0, -8, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    style={{
                      transform: `translateX(${mousePosition.x}px) translateY(${mousePosition.y}px)`
                    }}
                  >
                    <div 
                      className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden"
                      style={{
                        boxShadow: `
                          0 20px 40px rgba(0,0,0,0.12),
                          0 0 0 3px rgba(194,240,255,0.6),
                          0 0 0 6px rgba(183,186,255,0.3),
                          inset 0 2px 8px rgba(0,0,0,0.1)
                        `,
                        border: '2px solid rgba(255,255,255,0.8)'
                      }}
                    >
                    <Image 
                      src="/photos/profilePic.jpeg" 
                      alt="Isaac Sun" 
                      fill
                      className="object-cover"
                      style={{ objectPosition: '50% 25%' }}
                        sizes="224px"
                        priority
                      />
                      {/* Glow ring */}
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          boxShadow: 'inset 0 0 40px rgba(194,240,255,0.2)'
                        }}
                    />
                  </div>
                  </motion.div>

                  {/* Name and Title - Left Aligned */}
                  <div className="space-y-2">
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                      className="text-4xl sm:text-5xl font-bold"
                      style={{
                        fontFamily: 'Satoshi, Manrope, system-ui, sans-serif',
                        color: '#1f2937',
                        letterSpacing: '-0.03em'
                      }}
                    >
                      Isaac Sun
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="text-xl sm:text-2xl font-medium"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        color: '#6b7280',
                        letterSpacing: '0.01em'
                      }}
                    >
                    </motion.p>
                  </div>
                </motion.div>

                {/* Bio Content - Staggered Text Lines */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="max-w-2xl space-y-6 mb-12"
                >
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-lg sm:text-xl leading-relaxed"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      color: '#374151',
                      lineHeight: '1.8'
                    }}
                  >
                    My name is Isaac Sun and I&apos;m a recent graduate of{' '}
                    <span 
                      className="font-semibold"
                      style={{ color: '#6366f1' }}
                    >
                      Northwestern University
                    </span>
                    {' '}with a BS/MS in Computer Science and a minor in Music.
                  </motion.p>
                  
                  {/* Decorative divider */}
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                    className="h-px"
                    style={{
                      background: 'linear-gradient(to right, transparent, rgba(74,110,255,0.2), transparent)',
                      transformOrigin: 'left'
                    }}
                  />

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="text-lg sm:text-xl leading-relaxed"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      color: '#374151',
                      lineHeight: '1.8'
                    }}
                  >
                    My interests lie within scalable sustainable computing,{' '}
                    <span className="font-medium" style={{ color: '#10b981' }}>AI × climate modeling</span>, and{' '}
                    environmental policy. More broadly I&apos;m also interested in distributed systems and sociology.
                  </motion.p>
                </motion.div>

                {/* Connect Section - Floating Capsule Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                  className="space-y-6"
                >
                  <h3 
                    className="text-2xl sm:text-3xl font-semibold"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      color: '#1f2937',
                      letterSpacing: '0.01em'
                    }}
                  >
                    Let&apos;s Connect
                  </h3>
                  <p 
                    className="text-base sm:text-lg text-gray-600 mb-8"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                  >
                    Always excited to discuss climate tech, sustainable computing, or startups
                  </p>
                  
                  {/* Social Links - Floating Capsules with Drift */}
                  <div className="flex flex-wrap gap-4">
                    {[
                      { 
                        href: 'https://www.linkedin.com/in/isaacsun1/', 
                        icon: Linkedin, 
                        label: 'LinkedIn',
                        color: '#0a66c2',
                        delay: 0.1
                      },
                      { 
                        href: 'https://github.com/isaacsun0813', 
                        icon: Github, 
                        label: 'GitHub',
                        color: '#24292e',
                        delay: 0.15
                      },
                      { 
                        href: 'https://www.youtube.com/@staysunnytoday', 
                        icon: Youtube, 
                        label: 'YouTube',
                        color: '#ff0000',
                        delay: 0.2
                      },
                      { 
                        href: 'https://isaacsun.substack.com/', 
                        icon: FileText, 
                        label: 'Substack',
                        color: '#ff6719',
                        delay: 0.25
                      },
                      { 
                        href: 'mailto:isaacsun0813@gmail.com', 
                        icon: Mail, 
                        label: 'Email',
                        color: '#ea4335',
                        delay: 0.3
                      }
                    ].map((social) => {
                      const driftAmount = (Math.random() - 0.5) * 2
                      const driftDuration = 6 + Math.random() * 2
                      const driftDelay = Math.random() * 2

                      return (
                        <motion.a
                          key={social.href}
                          href={social.href}
                          target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                          rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            delay: 0.5 + social.delay * 0.3, 
                            type: 'spring', 
                            stiffness: 300, 
                            damping: 25 
                          }}
                          whileHover={{ 
                            scale: 1.05, 
                            y: -4,
                            boxShadow: '0 8px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.6)'
                          }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-3 px-5 py-3 rounded-full"
                          style={{
                            height: '36px',
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: `
                              0 4px 12px rgba(0,0,0,0.08),
                              inset 0 1px 0 rgba(255,255,255,0.8),
                              0 0 0 1px rgba(0,0,0,0.05)
                            `,
                            color: '#374151',
                            textDecoration: 'none'
                          }}
                        >
                          {/* Drift animation */}
                          <motion.div
                            animate={{
                              y: [0, driftAmount, 0]
                            }}
                            transition={{
                              duration: driftDuration,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: driftDelay
                            }}
                            className="flex items-center gap-3"
                          >
                            <social.icon 
                              size={18} 
                              style={{ color: social.color }}
                            />
                            <span 
                              className="text-sm font-medium"
                              style={{
                                fontFamily: 'Inter, system-ui, sans-serif'
                              }}
                            >
                              {social.label}
                            </span>
                          </motion.div>
                        </motion.a>
                      )
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
              </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
