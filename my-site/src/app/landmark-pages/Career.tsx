'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion'
import { 
  Briefcase, 
  FileText, 
  X, 
  Plane, 
  UtensilsCrossed, 
  Dumbbell, 
  Target, 
  BookOpen, 
  Music, 
  Sparkles, 
  Video 
} from 'lucide-react'

interface CareerProps {
  isOpen: boolean
  onClose: () => void
}

// Goal icons mapping with lucide-react icons
const goalIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'Paragliding license': Plane,
  'Beef Wellington': UtensilsCrossed,
  'Squat 500, bench 300, deadlift 400': Dumbbell,
  'Dunk': Target, // Using Target icon for basketball dunk
  'Study Sociology': BookOpen,
  'Play Tuba/Euphonium': Music,
  'Backflip': Sparkles,
  'Vlog': Video
}

export default function Career({ isOpen, onClose }: CareerProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollRef })
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const underlineWidth = useTransform(smoothProgress, [0, 1], [0.5, 1])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Handle escape key and space to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
      // Only close on space if not typing in an input
      if (e.key === ' ' && isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        handleClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleClose])

  // Animation handling - keep component mounted during exit animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!shouldRender) return null

  return (
    <AnimatePresence>
      {shouldRender && (
        <>
          {/* Backdrop - Increased dimming */}
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

          {/* Skyglass Journal Modal */}
          <motion.div
            key="modal"
            initial={{ 
              opacity: 0, 
              scale: 0.94,
              filter: 'blur(12px)'
            }}
            animate={{ 
              opacity: isOpen ? 1 : 0, 
              scale: isOpen ? 1 : 0.94,
              filter: isOpen ? 'blur(0px)' : 'blur(8px)'
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.94,
              filter: 'blur(10px)'
            }}
            transition={{
              duration: 0.8,
              ease: [0.23, 1, 0.32, 1]
            }}
            className="fixed inset-0 z-[52] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Glass Container - Skyglass Journal */}
            <motion.div
              ref={scrollRef}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  backdropFilter: 'blur(40px)',
                  border: '2px solid rgba(0,0,0,0.1)',
                  boxShadow: `
                    0px 20px 60px rgba(0,0,0,0.4),
                    0px 0px 0px 1px rgba(255,255,255,0.8),
                    inset 0px 1px 0px rgba(255,255,255,0.95),
                    0px 0px 100px rgba(255,255,255,0.4),
                    0px 0px 0px 2px rgba(37,99,235,0.1)
                  `,
                  scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.2) transparent'
              }}
            >

              {/* Close Button */}
              <motion.button
                onClick={handleClose}
                className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center group border-2 border-black bg-white rounded-full"
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

              {/* Content */}
              <div className="relative p-8 sm:p-10 md:p-12">
                {/* Header - Glowing Embossed */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
                  transition={{ delay: 0.15, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="text-center mb-12"
                >
                  <motion.div
                    className="flex items-center justify-center gap-4 mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <div className="relative">
                      <Briefcase 
                        size={48} 
                        className="relative"
                        style={{
                          color: '#2563eb',
                          filter: 'drop-shadow(0 4px 8px rgba(37,99,235,0.3))'
                        }}
                      />
                    </div>
                    <h1 
                      className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight"
                      style={{
                        fontFamily: 'Satoshi, Manrope, General Sans, system-ui, sans-serif',
                        color: '#2563eb',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      Career
                    </h1>
                  </motion.div>
                  
                  {/* Animated Underline */}
                  <motion.div
                    className="h-0.5 mx-auto"
                    style={{
                      background: '#2563eb',
                      width: '120px',
                      scaleX: isOpen ? underlineWidth : 0,
                      transformOrigin: 'center'
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />

                </motion.div>

                {/* Stacked Floating Panels */}
                <div className="space-y-6">
                  {/* Panel 1: My Career Goal */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                    animate={{ 
                      opacity: isOpen ? 1 : 0, 
                      y: isOpen ? 0 : 30,
                      filter: isOpen ? 'blur(0px)' : 'blur(8px)'
                    }}
                    exit={{
                      opacity: 0,
                      y: 30,
                      filter: 'blur(8px)'
                    }}
                    transition={{ delay: 0.3, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className="relative p-8 sm:p-10 rounded-2xl"
                    style={{
                      background: '#FFFFFF',
                      backdropFilter: 'blur(20px)',
                      boxShadow: `
                        0px 16px 32px rgba(0,0,0,0.15),
                        0px 0px 0px 1px rgba(255,255,255,0.8),
                        inset 0px 1px 0px rgba(255,255,255,0.95)
                      `,
                      border: '1px solid rgba(255,255,255,0.6)',
                      transform: 'translateZ(0)'
                    }}
                  >
                    <h2 
                      className="text-center mb-6 text-lg sm:text-xl font-semibold uppercase tracking-wider"
                      style={{
                        fontFamily: 'Satoshi, Manrope, system-ui, sans-serif',
                        color: '#2563eb',
                        letterSpacing: '0.1em'
                      }}
                    >
                      My Career Goal
                    </h2>
                    <p 
                      className="text-center text-base sm:text-lg leading-relaxed max-w-3xl mx-auto"
                      style={{
                        color: 'rgba(15,23,42,1)',
                        fontFamily: 'Satoshi, Manrope, system-ui, sans-serif',
                        lineHeight: '1.7',
                        fontWeight: '400'
                      }}
                    >
                      Tackle climate and environmental policy challenges through scalable, efficient technology solutions
                    </p>
                  </motion.div>

                  {/* Panel 2: Future Opportunities */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                    animate={{ 
                      opacity: isOpen ? 1 : 0, 
                      y: isOpen ? -8 : 30,
                      filter: isOpen ? 'blur(0px)' : 'blur(10px)'
                    }}
                    exit={{
                      opacity: 0,
                      y: 30,
                      filter: 'blur(10px)'
                    }}
                    transition={{ delay: 0.42, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className="relative p-8 sm:p-10 rounded-2xl"
                    style={{
                      background: '#FFFFFF',
                      backdropFilter: 'blur(18px)',
                      boxShadow: `
                        0px 16px 32px rgba(0,0,0,0.15),
                        0px 0px 0px 1px rgba(255,255,255,0.7),
                        inset 0px 1px 0px rgba(255,255,255,0.9)
                      `,
                      border: '1px solid rgba(255,255,255,0.5)',
                      transform: 'translateZ(0)',
                      marginTop: '-8px'
                    }}
                  >
                    <h2 
                      className="text-center mb-6 text-lg sm:text-xl font-semibold uppercase tracking-wider"
                      style={{
                        fontFamily: 'Satoshi, Manrope, system-ui, sans-serif',
                        color: '#2563eb',
                        letterSpacing: '0.1em'
                      }}
                    >
                      Future Opportunities
                    </h2>
                    
                    <div className="mb-6">
                      <p 
                        className="mb-6"
                        style={{
                          color: 'rgba(15,23,42,1)',
                          fontFamily: 'Satoshi, Manrope, system-ui, sans-serif',
                          fontSize: '16px',
                          lineHeight: '1.7',
                          fontWeight: '400',
                          paddingLeft: '0px'
                        }}
                      >
                        I&apos;m interested in climate tech specifically:
                      </p>
                      
                      <ul className="space-y-4 mb-10" style={{ paddingLeft: '0px', listStyle: 'none' }}>
                        {[
                          'Scope 2 Emissions tracking and optimization platforms',
                          'Carbon Reduction measurement and verification systems',
                          'Scalable Data Infrastructure'
                        ].map((item, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
                            transition={{ delay: 0.54 + index * 0.1, duration: 0.4 }}
                            className="flex items-start gap-3"
                            style={{
                              color: 'rgba(15,23,42,1)',
                              fontFamily: 'Satoshi, Manrope, system-ui, sans-serif',
                              fontSize: '16px',
                              lineHeight: '1.7',
                              fontWeight: '400'
                            }}
                          >
                            <span className="text-blue-500 font-bold text-lg flex-shrink-0" style={{ marginTop: '0.125rem' }}>•</span>
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Resume Button - Retro Pokemon Style */}
                    <div className="text-center">
                      <motion.a
                        href="https://drive.google.com/file/d/130KQWH7hviU7HDY7dztdG4wLoJAI8ryw/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4"
                        style={{
                          background: '#1E5F8B',
                          color: '#FFFFFF',
                          fontWeight: '700',
                          fontSize: '16px',
                          border: '3px solid #000000',
                          fontFamily: 'var(--font-plus-jakarta-sans)',
                          textDecoration: 'none'
                        }}
                        whileHover={{
                          background: '#0F4A7A'
                        }}
                        whileTap={{
                          background: '#1E5F8B'
                        }}
                        transition={{ duration: 0.15 }}
                      >
                        <FileText size={20} />
                        <span>View Resume</span>
                      </motion.a>
                    </div>
                  </motion.div>

                  {/* Panel 3: Non-Career Goals */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
                    animate={{ 
                      opacity: isOpen ? 1 : 0, 
                      y: isOpen ? -12 : 30,
                      filter: isOpen ? 'blur(0px)' : 'blur(12px)'
                    }}
                    exit={{
                      opacity: 0,
                      y: 30,
                      filter: 'blur(12px)'
                    }}
                    transition={{ delay: 0.54, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className="relative p-8 sm:p-10 rounded-2xl"
                    style={{
                      background: '#FFFFFF',
                      backdropFilter: 'blur(16px)',
                      boxShadow: `
                        0px 16px 32px rgba(0,0,0,0.15),
                        0px 0px 0px 1px rgba(255,255,255,0.6),
                        inset 0px 1px 0px rgba(255,255,255,0.85)
                      `,
                      border: '1px solid rgba(255,255,255,0.45)',
                      transform: 'translateZ(0)',
                      marginTop: '-12px'
                    }}
                  >

                    <h2 
                      className="text-center mb-8 text-lg sm:text-xl font-semibold uppercase tracking-wider relative z-10"
                      style={{
                        fontFamily: 'Satoshi, Manrope, system-ui, sans-serif',
                        color: '#2563eb',
                        letterSpacing: '0.1em'
                      }}
                    >
                      Non-Career Goals
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-4 relative z-10">
                      {[
                        'Paragliding license',
                        'Beef Wellington',
                        'Squat 500, bench 300, deadlift 400',
                        'Dunk',
                        'Study Sociology',
                        'Play Tuba/Euphonium',
                        'Backflip',
                        'Vlog'
                      ].map((goal, index) => {
                        const IconComponent = goalIcons[goal]
                        return (
                          <motion.div
                            key={goal}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
                            transition={{ delay: 0.66 + index * 0.08, duration: 0.4 }}
                            className="flex items-center gap-3 p-3 rounded-xl group"
                            style={{
                              background: 'rgba(255,255,255,0.3)',
                              backdropFilter: 'blur(8px)',
                              transition: 'all 0.3s ease'
                            }}
                            whileHover={{
                              background: 'rgba(255,255,255,0.5)',
                              scale: 1.02,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          >
                            {IconComponent && (
                              <IconComponent 
                                size={24} 
                                className="text-blue-500 flex-shrink-0"
                              />
                            )}
                            <span 
                              className="text-base flex-1"
                              style={{
                                color: 'rgba(15,23,42,1)',
                                fontFamily: 'Satoshi, Manrope, system-ui, sans-serif',
                                lineHeight: '1.7',
                                fontWeight: '400'
                              }}
                            >
                              {goal}
                            </span>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
