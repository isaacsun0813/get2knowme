'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

interface IntroScreenProps {
  onLaunch: () => void
  onEnter: () => void
}

// Interactive Nature Garden Component - shows current activities with vanishing effect
function NatureGarden() {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
  const [activities, setActivities] = useState([
    { text: 'Growing 3D worlds', icon: '🌱', color: '#22c55e' },
    { text: 'Crafting motion stories', icon: '🍃', color: '#16a34a' },
    { text: 'Planting playful ideas', icon: '🌿', color: '#15803d' },
    { text: 'Nurturing design systems', icon: '🌳', color: '#166534' },
  ])
  const [fadingActivities, setFadingActivities] = useState<Set<number>>(new Set())

  useEffect(() => {
    const interval = setInterval(() => {
      setFadingActivities(prev => {
        const newSet = new Set(prev)
        newSet.add(currentActivityIndex)
        return newSet
      })
      
      setTimeout(() => {
        setCurrentActivityIndex((prev) => (prev + 1) % activities.length)
        setFadingActivities(prev => {
          const newSet = new Set(prev)
          newSet.delete(currentActivityIndex)
          return newSet
        })
      }, 800)
    }, 3000)

    return () => clearInterval(interval)
  }, [currentActivityIndex, activities.length])

  return (
    <div className="relative w-64 h-96 flex flex-col items-center justify-end pb-8">
      {/* Pot/Container */}
      <motion.div
        className="nature-pot relative z-10"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="120" height="80" viewBox="0 0 120 80" className="nature-pot-svg">
          <path
            d="M 20 80 Q 20 60, 30 50 L 90 50 Q 100 60, 100 80 Z"
            fill="#8b5a3c"
            stroke="#6b4423"
            strokeWidth="2"
          />
          <path
            d="M 25 80 Q 25 65, 32 55 L 88 55 Q 95 65, 95 80 Z"
            fill="#a67c52"
          />
        </svg>
      </motion.div>

      {/* Growing Stem */}
      <motion.div
        className="nature-stem absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
      />

      {/* Leaves with activities */}
      <div className="relative w-full h-64 mt-4">
        {activities.map((activity, idx) => {
          const isActive = idx === currentActivityIndex
          const isFading = fadingActivities.has(idx)
          const angle = (idx * 90) - 45 // Distribute leaves around
          const distance = 80

          return (
            <motion.div
              key={idx}
              className="absolute left-1/2 top-1/2"
              style={{
                x: Math.cos((angle * Math.PI) / 180) * distance - 50,
                y: Math.sin((angle * Math.PI) / 180) * distance - 30,
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: isActive ? 1 : isFading ? 0 : 0.3,
                rotate: isActive ? [0, 5, -5, 0] : 0,
                opacity: isActive ? 1 : isFading ? 0 : 0.2,
              }}
              transition={{
                scale: { duration: 0.5, ease: 'easeOut' },
                rotate: isActive
                  ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.5 },
                opacity: { duration: 0.8, ease: 'easeInOut' },
              }}
              whileHover={isActive ? { scale: 1.15, rotate: 10 } : {}}
            >
              {/* Leaf shape */}
              <div className="nature-leaf">
                <div className="nature-leaf-content">
                  <span className="text-3xl mb-2">{activity.icon}</span>
                  <span
                    className="nature-leaf-text"
                    style={{ color: activity.color }}
                  >
                    {activity.text}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Floating particles */}
      {[0, 1, 2, 3, 4].map((particle) => (
        <motion.div
          key={particle}
          className="nature-particle"
          style={{
            left: `${20 + particle * 20}%`,
            bottom: `${10 + particle * 15}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, (particle % 2 === 0 ? 1 : -1) * 15, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + particle * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle * 0.3,
          }}
        />
      ))}
    </div>
  )
}


// Flying button plane - flies off screen to the right
function FlyingButtonPlane({ onComplete }: { onComplete: () => void }) {
  const { scene } = useGLTF('/models/newPlane.glb')
  const groupRef = useRef<THREE.Group>(null)
  const startTime = useRef(Date.now())
  const prevPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, -80))
  const planeScene = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(0, 0, -80)
      groupRef.current.rotation.set(0, 0, 0)
      groupRef.current.scale.setScalar(0.35)
    }
  }, [])
  
  useFrame(() => {
    if (!groupRef.current) return
    
    const elapsed = (Date.now() - startTime.current) / 1000
    const duration = 1.5 // 1.5 seconds to fly off
    
    if (elapsed < duration) {
      const t = elapsed / duration
      const easedT = 1 - Math.pow(1 - t, 3) // Ease-out cubic
      
      // Fly from center to right off-screen (in 3D space)
      // Convert screen coordinates to 3D space
      const startX = 0
      const endX = 200 // Far to the right in 3D space
      const x = startX + (endX - startX) * easedT
      
      // Slight upward arc
      const y = 10 * Math.sin(t * Math.PI)
      
      // Move forward (toward camera) slightly
      const z = -80 - (easedT * 40)
      
      const pos = new THREE.Vector3(x, y, z)
      groupRef.current.position.copy(pos)
      
      // Orient plane along flight path
      if (elapsed > 0.05) {
        const direction = pos.clone().sub(prevPos.current)
        if (direction.length() > 0.01) {
          direction.normalize()
          // Plane's forward is typically along -Z, but we need to align with direction
          const forward = new THREE.Vector3(0, 0, -1)
          const quaternion = new THREE.Quaternion()
          quaternion.setFromUnitVectors(forward, direction)
          groupRef.current.setRotationFromQuaternion(quaternion)
        }
      }
      
      prevPos.current.copy(pos)
      
      // Scale up slightly as it flies
      const scale = 0.12 + (easedT * 0.03)
      groupRef.current.scale.setScalar(scale)
    } else if (elapsed >= duration) {
      onComplete()
    }
  })
  
  return (
    <primitive 
      ref={groupRef} 
      object={planeScene} 
    />
  )
}

export default function IntroScreen({ onLaunch, onEnter }: IntroScreenProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showButton, setShowButton] = useState(true)
  const [buttonPlaneFlying, setButtonPlaneFlying] = useState(false)
  const [showLiftOffOverlay, setShowLiftOffOverlay] = useState(false)
  
  // Pre-generate particle data for consistent animation
  const particleData = useMemo(() => {
    return Array.from({ length: 15 }, (_, idx) => ({
      top: 10 + (idx * 6) + (Math.random() * 3),
      left: 20 + (Math.random() * 60),
      size: 4 + (Math.random() * 6),
      y: (Math.random() - 0.5) * 80,
      delay: Math.random() * 0.3,
      duration: 0.6 + (Math.random() * 0.4),
    }))
  }, [])
  const handleEnter = () => {
    if (!isTransitioning && !buttonPlaneFlying) {
      onLaunch?.()
      setIsTransitioning(true)
      setButtonPlaneFlying(true)
      setShowButton(false)
      setShowLiftOffOverlay(true)
      
      setTimeout(() => {
        setShowLiftOffOverlay(false)
      }, 1600)
      
      // Complete transition after plane flies off
      setTimeout(() => {
        onEnter()
      }, 1650)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Sky gradient background */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ 
          background: 'linear-gradient(to bottom, #a8d8f0 0%, #87CEEB 30%, #6BB6D6 70%, #4A9BC4 100%)',
          opacity: isTransitioning ? 0 : 1
        }} 
      />
      
      <motion.div
        className="absolute inset-0 overflow-hidden"
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Cloud layer 1 - Large, slow moving */}
        <div className="absolute inset-0">
          <div className="realistic-cloud cloud-1" style={{ 
            left: '10%', 
            top: '15%',
            width: '600px',
            height: '200px',
            animation: 'cloud-drift-1 45s infinite ease-in-out',
            opacity: 0.9
          }}></div>
          <div className="realistic-cloud cloud-2" style={{ 
            left: '60%', 
            top: '25%',
            width: '500px',
            height: '180px',
            animation: 'cloud-drift-2 50s infinite ease-in-out',
            opacity: 0.85,
            animationDelay: '-10s'
          }}></div>
        </div>
        
        {/* Cloud layer 2 - Medium, medium speed */}
        <div className="absolute inset-0">
          <div className="realistic-cloud cloud-3" style={{ 
            left: '30%', 
            top: '40%',
            width: '400px',
            height: '150px',
            animation: 'cloud-drift-3 35s infinite ease-in-out',
            opacity: 0.8,
            animationDelay: '-5s'
          }}></div>
          <div className="realistic-cloud cloud-4" style={{ 
            left: '70%', 
            top: '50%',
            width: '450px',
            height: '160px',
            animation: 'cloud-drift-4 40s infinite ease-in-out',
            opacity: 0.75,
            animationDelay: '-15s'
          }}></div>
        </div>
        
        {/* Cloud layer 3 - Small, fast moving */}
        <div className="absolute inset-0">
          <div className="realistic-cloud cloud-5" style={{ 
            left: '5%', 
            top: '60%',
            width: '300px',
            height: '120px',
            animation: 'cloud-drift-5 25s infinite ease-in-out',
            opacity: 0.7,
            animationDelay: '-8s'
          }}></div>
          <div className="realistic-cloud cloud-6" style={{ 
            left: '80%', 
            top: '70%',
            width: '350px',
            height: '140px',
            animation: 'cloud-drift-6 30s infinite ease-in-out',
            opacity: 0.65,
            animationDelay: '-12s'
          }}></div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showLiftOffOverlay && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Main gradient sweep - faster, more dramatic */}
            <motion.div
              className="liftoff-gradient"
              initial={{ x: '0%', scale: 1 }}
              animate={{ 
                x: ['0%', '-20%', '-50%', '-85%', '-100%'],
                scale: [1, 1.1, 1.3, 1.5, 1.8]
              }}
              transition={{ 
                duration: 1.2, 
                ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for acceleration
                times: [0, 0.3, 0.6, 0.85, 1]
              }}
            />
            
            {/* Wind streaks - more lines, faster, varied speeds */}
            <div className="liftoff-lines">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((line) => (
                <motion.span
                  key={`liftoff-line-${line}`}
                  className="liftoff-line"
                  style={{
                    top: `${5 + line * 9}%`,
                    height: line % 3 === 0 ? '3px' : line % 3 === 1 ? '2px' : '1.5px',
                    opacity: 0.9 - (line * 0.08),
                  }}
                  initial={{ x: '150%', opacity: 0 }}
                  animate={{ 
                    x: '-180%', 
                    opacity: [0, 0.9, 1, 0.7, 0],
                    scale: [0.8, 1, 1.1, 1, 0.9]
                  }}
                  transition={{ 
                    duration: 0.8 + (line * 0.05), 
                    ease: [0.5, 0, 0.8, 1], // Fast acceleration
                    delay: line * 0.03,
                    times: [0, 0.2, 0.5, 0.8, 1]
                  }}
                />
              ))}
            </div>
            
            {/* Motion blur overlay - creates whoosh effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.6) 60%, transparent 100%)',
                filter: 'blur(20px)',
              }}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ 
                x: ['100%', '0%', '-100%'],
                opacity: [0, 0.8, 0]
              }}
              transition={{ 
                duration: 1.0,
                ease: [0.4, 0, 0.6, 1],
                times: [0, 0.5, 1]
              }}
            />
            
            {/* Particle-like dots for speed effect */}
            <div className="liftoff-particles">
              {particleData.map((particle, idx) => (
                <motion.div
                  key={`particle-${idx}`}
                  className="liftoff-particle"
                  style={{
                    top: `${particle.top}%`,
                    left: `${particle.left}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                  }}
                  initial={{ x: 0, opacity: 0, scale: 0 }}
                  animate={{ 
                    x: '-200vw',
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1.2, 0],
                    y: particle.y
                  }}
                  transition={{ 
                    duration: particle.duration,
                    ease: 'easeOut',
                    delay: particle.delay,
                    times: [0, 0.1, 0.7, 1]
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Organic layout with hero text + right-side accent */}
      <motion.div 
        className="absolute inset-0 flex flex-col md:flex-row items-center justify-center px-6 sm:px-12 lg:px-20 gap-12 md:gap-24"
        animate={isTransitioning ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div className="relative flex-1 max-w-xl">
          <AnimatePresence>
            {isTransitioning && (
              <motion.div
                key="text-wash"
                className="absolute inset-0 z-10 rounded-[32px]"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 -40% 0 0)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.9) 55%, rgba(255,255,255,1) 100%)',
                  filter: 'blur(18px)',
                }}
              />
            )}
          </AnimatePresence>
          {/* Hello - large, organic, slightly rotated */}
          <motion.div className="flex flex-col items-center md:items-start text-center md:text-left">
            <motion.h1
              className="text-[clamp(4rem,10vw,8rem)] font-black leading-none flex items-center gap-4"
              style={{
                color: '#1a1a1a',
                textShadow: '2px 2px 0px rgba(255,255,255,0.3), -1px -1px 0px rgba(0,0,0,0.08)',
                letterSpacing: '-0.05em',
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [-4, -3, -4],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              Hello
              <motion.span
                className="text-6xl md:text-7xl inline-block"
                animate={{
                  rotate: [0, 14, -14, 14, -14, 0],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5
                }}
              >
                👋
              </motion.span>
            </motion.h1>
            
            {/* Tagline */}
            <motion.p
              className="text-[clamp(1.6rem,3vw,2.6rem)] font-medium mt-12 leading-tight text-zinc-700"
              style={{
                fontFamily: 'var(--font-plus-jakarta-sans)',
                transformOrigin: 'center',
              }}
              animate={{
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1
              }}
            >
              Welcome to Isaac&apos;s World
            </motion.p>
            
            {/* Button */}
            {showButton && !buttonPlaneFlying && (
              <motion.button
                onClick={handleEnter}
                className="mt-16 px-12 py-6 text-2xl font-semibold relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(240,240,240,0.9) 100%)',
                  border: 'none',
                  borderRadius: '50px',
                  color: '#1a1a1a',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  fontFamily: 'var(--font-plus-jakarta-sans)',
                }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.06,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <span className="relative z-10">
                  Take Flight
                </span>
                
                <motion.div
                  className="absolute inset-0 bg-white/30 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 2, opacity: [0, 0.4, 0] }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Flying button plane - appears when button is clicked */}
      {buttonPlaneFlying && (
        <div className="fixed inset-0 pointer-events-none z-[60]">
          <Canvas
            camera={{ position: [0, 0, 200], fov: 50 }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={0.6} />
            <FlyingButtonPlane onComplete={() => {}} />
          </Canvas>
        </div>
      )}

      {/* Realistic cloud styles */}
      <style jsx>{`
        .realistic-cloud {
          position: absolute;
          background: radial-gradient(
            ellipse 80% 50% at 50% 50%,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.7) 25%,
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 255, 255, 0.3) 75%,
            transparent 100%
          );
          border-radius: 100px;
          filter: blur(20px);
          box-shadow: 
            0 20px 40px rgba(255, 255, 255, 0.3),
            inset -10px -10px 20px rgba(255, 255, 255, 0.5),
            inset 10px 10px 20px rgba(0, 0, 0, 0.05);
        }
        
        /* Multiple cloud puffs for realistic look */
        .realistic-cloud::before,
        .realistic-cloud::after {
          content: '';
          position: absolute;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          border-radius: 50%;
          filter: blur(15px);
        }
        
        .realistic-cloud::before {
          width: 60%;
          height: 60%;
          top: -20%;
          left: 10%;
        }
        
        .realistic-cloud::after {
          width: 50%;
          height: 50%;
          bottom: -15%;
          right: 15%;
        }
        
        @keyframes cloud-drift-1 {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); }
          25% { transform: translateX(55px) translateY(-25px) scale(1.08); }
          50% { transform: translateX(110px) translateY(-18px) scale(1.14); }
          75% { transform: translateX(55px) translateY(-35px) scale(1.08); }
        }
        
        @keyframes cloud-drift-2 {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); }
          33% { transform: translateX(-70px) translateY(25px) scale(0.92); }
          66% { transform: translateX(-130px) translateY(40px) scale(0.88); }
        }
        
        @keyframes cloud-drift-3 {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); }
          50% { transform: translateX(80px) translateY(-22px) scale(1.12); }
        }
        
        @keyframes cloud-drift-4 {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); }
          50% { transform: translateX(-90px) translateY(32px) scale(0.9); }
        }
        
        @keyframes cloud-drift-5 {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); }
          50% { transform: translateX(110px) translateY(-32px) scale(1.16); }
        }
        
        @keyframes cloud-drift-6 {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); }
          50% { transform: translateX(-80px) translateY(36px) scale(0.84); }
        }

        .liftoff-gradient {
          position: absolute;
          inset: -20%;
          background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 40%, transparent 70%), linear-gradient(120deg, rgba(135, 206, 235, 0.9) 0%, rgba(79, 152, 204, 0.7) 40%, rgba(36, 65, 110, 0.65) 100%);
          filter: blur(40px);
          opacity: 0.85;
        }

        .liftoff-lines {
          position: absolute;
          inset: 0;
        }

                .liftoff-line {
                  position: absolute;
                  left: -40%;
                  width: 180%;
                  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 70%, transparent 100%);
                  filter: blur(1.5px);
                  transform-origin: left center;
                }
                
                .liftoff-particles {
                  position: absolute;
                  inset: 0;
                }
                
                .liftoff-particle {
                  position: absolute;
                  background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
                  border-radius: 50%;
                  filter: blur(1px);
                }

                /* Nature Garden Styles */
                .nature-pot {
                  position: relative;
                  z-index: 1;
                }

                .nature-pot-svg {
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
                }

                .nature-stem {
                  position: absolute;
                  width: 8px;
                  height: 120px;
                  background: linear-gradient(to top, #166534 0%, #22c55e 100%);
                  border-radius: 4px;
                  transform-origin: bottom center;
                  z-index: 0;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .nature-leaf {
                  position: relative;
                  width: 100px;
                  height: 80px;
                  background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
                  border-radius: 0 100% 0 100%;
                  transform: rotate(-45deg);
                  box-shadow: 
                    0 4px 12px rgba(34, 197, 94, 0.3),
                    inset 0 2px 4px rgba(255,255,255,0.2);
                  cursor: pointer;
                  transition: all 0.3s ease;
                }

                .nature-leaf::before {
                  content: '';
                  position: absolute;
                  top: 10px;
                  left: 10px;
                  width: 60%;
                  height: 60%;
                  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
                  border-radius: 50%;
                }

                .nature-leaf-content {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%) rotate(45deg);
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  width: 100%;
                  pointer-events: none;
                }

                .nature-leaf-text {
                  font-size: 0.75rem;
                  font-weight: 600;
                  text-align: center;
                  white-space: nowrap;
                  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }

                .nature-particle {
                  position: absolute;
                  width: 6px;
                  height: 6px;
                  background: radial-gradient(circle, #22c55e 0%, #16a34a 50%, transparent 100%);
                  border-radius: 50%;
                  filter: blur(1px);
                  pointer-events: none;
                }
      `}</style>
    </div>
  )
}
