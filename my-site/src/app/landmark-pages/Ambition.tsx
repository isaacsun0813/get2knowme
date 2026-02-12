'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useTransform, useMotionValue, useSpring } from 'framer-motion'
import Image from 'next/image'
import { X, Rocket, Github } from 'lucide-react'

interface AmbitionProps {
  isOpen: boolean
  onClose: () => void
}

interface Project {
  id: string
  title: string
  category: string
  categoryColor: string
  description: string
  details?: string
  image?: string
  link?: string
  status: 'building' | 'researching' | 'discontinued' | 'active' | 'inactive'
}

const projects: Project[] = [
  {
    id: 'verdra',
    title: 'Verdra',
    category: 'BUILDING',
    categoryColor: '#F59E0B',
    description: 'Cloud Compute Optimization',
    details: 'Reduces infrastructure costs and improves carbon footprint by detecting common cloud compute inefficiencies',
    image: '/photos/projects/Verdra.png',
    link: 'https://verdratech.github.io/Verdra-Site/',
    status: 'inactive'
  },
  {
    id: 'prizesole',
    title: 'PrizeSole',
    category: 'DISCONTINUED',
    categoryColor: '#94A3B8',
    description: 'B2B eCommerce sneaker sweepstakes platform',
    image: '/photos/projects/PrizeSole.png',
    status: 'discontinued'
  },
  {
    id: 'sneaker-marketplace',
    title: 'Grey Market Sneaker Marketplace',
    category: 'BUILDING',
    categoryColor: '#F59E0B',
    description: 'A sneaker inventory management platform featuring agent-driven workflows, automated SKU detection, and real-time access to available wholesale inventory.',
    status: 'inactive'
  },
  {
    id: 'carbon-aware',
    title: 'Carbon Aware Scheduling for ML Training/Inference',
    category: 'RESEARCHING',
    categoryColor: '#34D399',
    description: 'Also interested in greener CI/CD pipelines, distributed systems, and broadly security specifically attacks.',
    status: 'active'
  }
]

export default function Ambition({ isOpen, onClose }: AmbitionProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)
  // Removed unused transforms to reduce computation

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      document.body.style.overflow = 'hidden'
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 800)
      document.body.style.overflow = 'unset'
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

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
        if (modalRef.current) {
          const rect = modalRef.current.getBoundingClientRect()
          setMousePosition({
            x: (e.clientX - rect.left - rect.width / 2) / rect.width,
            y: (e.clientY - rect.top - rect.height / 2) / rect.height
          })
        }
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

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedProject) {
          setSelectedProject(null)
        } else {
          handleClose()
        }
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, selectedProject, handleClose])

  // Show all projects (no filtering)
  const filteredProjects = projects

  if (!shouldRender) return null

  return (
    <AnimatePresence>
      {shouldRender && (
        <>
          {/* Backdrop */}
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

          {/* Main Modal Container */}
          <motion.div
            key="modal"
            ref={modalRef}
            initial={{ 
              opacity: 0, 
              scale: 0.95,
              y: 40,
              filter: 'blur(12px) brightness(0.8)'
            }}
            animate={{ 
              opacity: isOpen ? 1 : 0, 
              scale: isOpen ? 1 : 0.95,
              y: isOpen ? 0 : 40,
              filter: isOpen ? 'blur(0px) brightness(1)' : 'blur(8px) brightness(0.8)',
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              y: 40,
              filter: 'blur(8px) brightness(0.8)'
            }}
            transition={{
              duration: 0.8,
              ease: [0.23, 1, 0.32, 1]
            }}
            className="fixed inset-0 z-[52] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translate(${mousePosition.x * 5}px, ${mousePosition.y * 5}px)`
            }}
          >
            {/* Skyglass Modal Container */}
            <motion.div
              className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto pointer-events-auto ambition-scroll"
             style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                backdropFilter: 'blur(40px)',
                boxShadow: `
                  0px 20px 60px rgba(0,0,0,0.4),
                  0px 0px 0px 1px rgba(255,255,255,0.8),
                  inset 0px 1px 0px rgba(255,255,255,0.95),
                  0px 0px 120px rgba(255,200,100,0.15),
                  0px 0px 0px 2px rgba(245,158,11,0.1)
                `,
                border: '2px solid rgba(255,255,255,0.9)',
                transform: 'translateZ(0)',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(245,158,11,0.3) transparent'
              }}
            >
              <style dangerouslySetInnerHTML={{__html: `
                .ambition-scroll::-webkit-scrollbar {
                  width: 8px;
                }
                .ambition-scroll::-webkit-scrollbar-track {
                  background: transparent;
                  border-radius: 4px;
                }
                .ambition-scroll::-webkit-scrollbar-thumb {
                  background: rgba(245,158,11,0.3);
                  border-radius: 4px;
                }
                .ambition-scroll::-webkit-scrollbar-thumb:hover {
                  background: rgba(245,158,11,0.5);
                }
              `}} />

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
                <X size={24} className="text-gray-600 group-hover:text-gray-800" strokeWidth={2.5} />
              </motion.button>

              {/* Content Area */}
              <div className="relative p-8 sm:p-10 md:p-12 pb-16">
            
            {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="text-center mb-8"
                >
                  <h1 className="flex items-center justify-center gap-4 mb-4">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      <Rocket size={48} style={{ color: '#F59E0B' }} />
                    </motion.div>
                    {['P', 'r', 'o', 'j', 'e', 'c', 't', 's'].map((letter, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
                        transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold"
                        style={{
                          fontFamily: 'Satoshi, Manrope, General Sans, system-ui, sans-serif',
                          color: '#F59E0B'
                        }}
                      >
                        {letter === ' ' ? '\u00A0' : letter}
                      </motion.span>
                    ))}
                  </h1>
                  
                  <motion.p
                    className="text-xl sm:text-2xl md:text-3xl mt-4 mb-6 font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isOpen ? 1 : 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    style={{
                      fontFamily: 'Inter, Nunito, Lato, system-ui, sans-serif',
                      lineHeight: '1.6',
                      fontWeight: '600',
                      color: '#000000',
                      textShadow: '0 1px 3px rgba(255,255,255,0.8), 0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    I&apos;m a builder. Here&apos;s what I&apos;m up to:
                  </motion.p>

                </motion.div>

                {/* Floating Capsules Gallery - Vertical Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-8">
                  {filteredProjects.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      index={index}
                      isOpen={isOpen}
                    />
                  ))}
               </div>

                {/* GitHub CTA - Retro 90s Pokemon Style */}
                <motion.div
                  className="text-center mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
                  transition={{ delay: 0.9, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                  {/* Retro Pokemon-style dialogue box */}
                  <motion.div
                    className="inline-block p-6 sm:p-8"
                    style={{
                      background: '#FFFFFF',
                      border: '3px solid #000000',
                      boxShadow: 'inset 0 0 0 1px #000000'
                    }}
                  >
                    <p
                      className="text-xl sm:text-2xl font-bold mb-6"
                      style={{
                        fontFamily: 'var(--font-plus-jakarta-sans)',
                        color: '#000000',
                        fontWeight: '700',
                        lineHeight: '1.4'
                      }}
                    >
                      Check out what else I&apos;m working on:
                    </p>
                    
                    <motion.a
                      href="https://github.com/isaacsun0813"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4"
                      style={{
                        background: '#FFA500',
                        color: '#000000',
                        fontWeight: '700',
                        fontSize: '16px',
                        border: '3px solid #000000',
                        fontFamily: 'var(--font-plus-jakarta-sans)'
                      }}
                      whileHover={{
                        background: '#FFB733'
                      }}
                      whileTap={{ 
                        background: '#FF9500'
                      }}
                    >
                      <Github size={20} className="relative z-10" fill="#000000" />
                      <span className="relative z-10">View GitHub</span>
                    </motion.a>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

        </>
      )}
    </AnimatePresence>
  )
}

function ProjectCard({ project, index, isOpen }: { project: Project; index: number; isOpen: boolean }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })

  useEffect(() => {
    // Removed pulsing animation for performance
  }, [project.status])

  useEffect(() => {
    if (!isOpen) return

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
        if (cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          const newX = (e.clientX - centerX) / rect.width
          const newY = (e.clientY - centerY) / rect.height
          x.set(newX)
          y.set(newY)
        }
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
  }, [isOpen, x, y])

  return (
    <motion.div
      ref={cardRef}
      className="w-full"
      initial={{ opacity: 0, y: 50, rotateY: -15 }}
      animate={{ 
        opacity: isOpen ? 1 : 0, 
        y: isOpen ? 0 : 50,
        rotateY: isOpen ? 0 : -15
      }}
      exit={{ opacity: 0, y: 50, rotateY: 15 }}
      transition={{ 
        delay: 0.4 + index * 0.1, 
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1]
      }}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Capsule Container */}
      <motion.div
        className="relative rounded-[18px] p-5 sm:p-6 md:p-7 h-full flex flex-col"
        style={{
          background: project.status === 'discontinued' || project.status === 'inactive'
            ? '#F5F5F5'
            : '#FFFFFF',
          backdropFilter: 'blur(20px)',
          boxShadow: project.status === 'discontinued' || project.status === 'inactive'
            ? `0 8px 24px rgba(0,0,0,0.12),
              0 0 0 1px rgba(148,163,184,0.35),
              inset 0 1px 0 rgba(255,255,255,0.9)`
            : `0 8px 24px rgba(245,158,11,0.3),
              0 0 0 1px ${project.categoryColor}55,
              inset 0 1px 0 rgba(255,255,255,0.9),
              0 0 40px ${project.categoryColor}25`,
          border: `2px solid ${project.status === 'inactive' || project.status === 'discontinued' ? 'rgba(148,163,184,0.4)' : project.categoryColor}70`,
          transformStyle: 'preserve-3d',
          x,
          y,
          rotateX,
          rotateY
        }}
        whileHover={{
          boxShadow: project.status === 'discontinued' || project.status === 'inactive'
            ? `0 16px 40px rgba(0,0,0,0.2),
              0 0 0 1px rgba(148,163,184,0.5),
              inset 0 1px 0 rgba(255,255,255,0.95)`
            : `0 16px 40px rgba(245,158,11,0.45),
              0 0 0 1px ${project.categoryColor}80,
              inset 0 1px 0 rgba(255,255,255,0.95),
              0 0 60px ${project.categoryColor}40`
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Status at top */}
        <div className="mb-2 sm:mb-3">
          <span
            className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
            style={{
              color: project.status === 'active' ? '#10B981' : 
                     project.status === 'discontinued' ? '#94A3B8' : '#6B7280',
              fontFamily: 'var(--font-plus-jakarta-sans)',
              fontWeight: '600'
            }}
          >
            {project.status === 'active' ? 'Active' : 
             project.status === 'discontinued' ? 'Discontinued' : 'Inactive'}
          </span>
        </div>

                   
        {/* Title */}
        <h2
          className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3"
          style={{
            fontFamily: 'Satoshi, Manrope, General Sans, system-ui, sans-serif',
            color: '#000000',
            lineHeight: '1.3',
            fontWeight: '700',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)'
          }}
        >
          {project.title}
        </h2>

        {/* Description */}
        <p
          className="text-xs sm:text-sm md:text-base mb-2 sm:mb-3 flex-grow leading-relaxed"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#000000',
            lineHeight: '1.7',
            fontWeight: '400',
            textShadow: '0 1px 2px rgba(255,255,255,0.6)'
          }}
        >
          {project.description}
        </p>

        {/* Image */}
        {project.image && (
          <div className="relative w-full aspect-video rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 bg-gray-100 flex-shrink-0">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-orange-400 rounded-full animate-spin" />
              </div>
            )}
                       <Image 
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              onLoad={() => setImageLoaded(true)}
              style={{
                filter: imageLoaded ? 'none' : 'blur(10px)',
                transition: 'filter 0.3s'
              }}
                       />
                     </div>
        )}

      </motion.div>
    </motion.div>
  )
}
