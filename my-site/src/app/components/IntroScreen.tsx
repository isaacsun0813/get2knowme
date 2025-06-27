'use client'

import { useState, useEffect } from 'react'
import { Plane } from 'lucide-react'

interface IntroScreenProps {
  onEnter: () => void
}

export default function IntroScreen({ onEnter }: IntroScreenProps) {
  const [, setShowEnterPrompt] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Show enter prompt immediately
    setShowEnterPrompt(true)
  }, [])

  const handleEnter = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      // Quick transition
      setTimeout(() => {
        onEnter()
      }, 800)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden break-words">
      {/* Static gradient background - matching 3D world blue */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #87CEEB, #B0E0E6, #E0F6FF)' }} />
      
      {/* Enhanced vertical parallax clouds - back to original style but improved */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Layer 1 - Fastest, largest clouds */}
        <div className="absolute w-full h-full opacity-90">
          <div className="cloud-large cloud-1 animate-cloud-fastest"></div>
          <div className="cloud-large cloud-2 animate-cloud-fastest" style={{ animationDelay: '-2s' }}></div>
          <div className="cloud-large cloud-3 animate-cloud-fastest" style={{ animationDelay: '-4s' }}></div>
          <div className="cloud-large cloud-4 animate-cloud-fastest" style={{ animationDelay: '-6s' }}></div>
        </div>
        
        {/* Layer 2 - Fast, medium clouds */}
        <div className="absolute w-full h-full opacity-75">
          <div className="cloud-medium cloud-5 animate-cloud-fast"></div>
          <div className="cloud-medium cloud-6 animate-cloud-fast" style={{ animationDelay: '-3s' }}></div>
          <div className="cloud-medium cloud-7 animate-cloud-fast" style={{ animationDelay: '-6s' }}></div>
          <div className="cloud-medium cloud-8 animate-cloud-fast" style={{ animationDelay: '-9s' }}></div>
        </div>
        
        {/* Layer 3 - Medium speed, smaller clouds */}
        <div className="absolute w-full h-full opacity-60">
          <div className="cloud-small cloud-9 animate-cloud-medium"></div>
          <div className="cloud-small cloud-10 animate-cloud-medium" style={{ animationDelay: '-4s' }}></div>
          <div className="cloud-small cloud-11 animate-cloud-medium" style={{ animationDelay: '-8s' }}></div>
          <div className="cloud-small cloud-12 animate-cloud-medium" style={{ animationDelay: '-12s' }}></div>
        </div>

        {/* Layer 4 - Slowest, background clouds */}
        <div className="absolute w-full h-full opacity-40">
          <div className="cloud-tiny cloud-13 animate-cloud-slow"></div>
          <div className="cloud-tiny cloud-14 animate-cloud-slow" style={{ animationDelay: '-5s' }}></div>
          <div className="cloud-tiny cloud-15 animate-cloud-slow" style={{ animationDelay: '-10s' }}></div>
        </div>
      </div>

      {/* Main content */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center text-center break-words transition-all duration-800 ${isTransitioning ? 'opacity-0 scale-[0.3]' : ''}`}>
        <div className="relative bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl p-16 overflow-hidden break-words w-[90%] max-w-4xl mx-4"
             style={{
               borderRadius: '2.5rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
               border: '2px solid rgba(255, 255, 255, 0.3)'
             }}>
          
          {/* Decorative shapes matching landmark pages */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/30 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/30 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 mb-8">
            <div className="flex flex-row items-center justify-center gap-6">
              <h1 className="break-words text-8xl font-extrabold text-stone-800 tracking-tight">
                Hello
              </h1>
              <span className="break-words text-6xl animate-wave-slow">👋</span>
            </div>
          </div>
          <p className="relative z-10 text-center text-4xl mb-16 leading-tight font-semibold text-stone-700">
            Welcome to Isaac&apos;s World
          </p>
          
          <div className="relative z-10">
            {/* Wind animation elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="wind-line wind-1"></div>
              <div className="wind-line wind-2"></div>
              <div className="wind-line wind-3"></div>
              <div className="wind-line wind-4"></div>
              <div className="wind-line wind-5"></div>
              <div className="wind-line wind-6"></div>
            </div>
            
            <button
              onClick={handleEnter}
              className="group btn-primary px-16 py-5"
            >
              <span className="relative z-10 flex items-center gap-3 tracking-normal text-2xl">
                Take Flight
                <Plane className="w-8 h-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* CSS for enhanced vertical cloud animations */}
      <style jsx>{`
        .cloud-large, .cloud-medium, .cloud-small, .cloud-tiny {
          position: absolute;
          border-radius: 100px;
          filter: blur(1px);
        }
        
        /* Large clouds - closest layer with improved gradients */
        .cloud-large { 
          background: radial-gradient(ellipse 60% 40% at 40% 50%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 40%, rgba(245,245,245,0.4) 70%, transparent 100%);
          filter: blur(0.5px); 
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .cloud-1 { width: 400px; height: 120px; left: 5%; }
        .cloud-2 { width: 500px; height: 150px; left: 55%; }
        .cloud-3 { width: 450px; height: 135px; left: 25%; }
        .cloud-4 { width: 380px; height: 115px; left: 75%; }

        /* Medium clouds with softer appearance */
        .cloud-medium { 
          background: radial-gradient(ellipse 65% 45% at 45% 50%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.5) 50%, rgba(240,240,240,0.3) 75%, transparent 100%);
          filter: blur(1px); 
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
        }
        .cloud-5 { width: 300px; height: 90px; left: 15%; }
        .cloud-6 { width: 350px; height: 105px; left: 65%; }
        .cloud-7 { width: 320px; height: 95px; left: 45%; }
        .cloud-8 { width: 280px; height: 85px; left: 85%; }

        /* Small clouds - more wispy */
        .cloud-small { 
          background: radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.4) 60%, rgba(235,235,235,0.2) 80%, transparent 100%);
          filter: blur(1.5px); 
          box-shadow: 0 1px 5px rgba(0,0,0,0.04);
        }
        .cloud-9 { width: 200px; height: 60px; left: 35%; }
        .cloud-10 { width: 220px; height: 65px; left: 10%; }
        .cloud-11 { width: 180px; height: 55px; left: 70%; }
        .cloud-12 { width: 210px; height: 63px; left: 90%; }

        /* Tiny clouds - distant background */
        .cloud-tiny { 
          background: radial-gradient(ellipse 75% 55% at 50% 50%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 70%, rgba(230,230,230,0.15) 85%, transparent 100%);
          filter: blur(2px); 
        }
        .cloud-13 { width: 120px; height: 36px; left: 20%; }
        .cloud-14 { width: 140px; height: 42px; left: 60%; }
        .cloud-15 { width: 130px; height: 39px; left: 80%; }

        @keyframes cloud-fastest {
          0% { transform: translateY(-120vh) scale(0.3); opacity: 0; }
          8% { opacity: 0.9; }
          92% { opacity: 0.9; }
          100% { transform: translateY(120vh) scale(1.8); opacity: 0; }
        }

        @keyframes cloud-fast {
          0% { transform: translateY(-110vh) scale(0.4); opacity: 0; }
          12% { opacity: 0.75; }
          88% { opacity: 0.75; }
          100% { transform: translateY(110vh) scale(1.6); opacity: 0; }
        }

        @keyframes cloud-medium {
          0% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
          18% { opacity: 0.6; }
          82% { opacity: 0.6; }
          100% { transform: translateY(100vh) scale(1.4); opacity: 0; }
        }

        @keyframes cloud-slow {
          0% { transform: translateY(-90vh) scale(0.6); opacity: 0; }
          22% { opacity: 0.4; }
          78% { opacity: 0.4; }
          100% { transform: translateY(90vh) scale(1.2); opacity: 0; }
        }

        @keyframes wave-slow {
          0%, 85% { transform: rotate(0deg); }
          87%, 91%, 95% { transform: rotate(14deg); }
          89%, 93% { transform: rotate(-14deg); }
          97%, 100% { transform: rotate(0deg); }
        }

        .animate-cloud-fastest { animation: cloud-fastest 7s infinite linear; }
        .animate-cloud-fast { animation: cloud-fast 10s infinite linear; }
        .animate-cloud-medium { animation: cloud-medium 14s infinite linear; }
        .animate-cloud-slow { animation: cloud-slow 20s infinite linear; }
        .animate-wave-slow { animation: wave-slow 4s ease-in-out infinite; }

        /* Enhanced wind animation around the button */
        .wind-line {
          position: absolute;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
          border-radius: 2px;
          opacity: 0;
        }

        .wind-1 {
          width: 40px;
          height: 2px;
          top: 20%;
          left: -60px;
          animation: windFlow1 3s infinite ease-in-out;
        }

        .wind-2 {
          width: 60px;
          height: 1px;
          top: 35%;
          left: -80px;
          animation: windFlow2 3.5s infinite ease-in-out 0.5s;
        }

        .wind-3 {
          width: 50px;
          height: 2px;
          top: 65%;
          left: -70px;
          animation: windFlow3 4s infinite ease-in-out 1s;
        }

        .wind-4 {
          width: 35px;
          height: 1px;
          top: 80%;
          left: -50px;
          animation: windFlow4 3.2s infinite ease-in-out 1.5s;
        }

        .wind-5 {
          width: 45px;
          height: 2px;
          top: 15%;
          right: -70px;
          animation: windFlowReverse1 3.8s infinite ease-in-out 0.8s;
        }

        .wind-6 {
          width: 55px;
          height: 1px;
          top: 70%;
          right: -80px;
          animation: windFlowReverse2 3.3s infinite ease-in-out 2s;
        }

        @keyframes windFlow1 {
          0% { transform: translateX(-20px); opacity: 0; }
          30% { opacity: 0.8; }
          70% { opacity: 0.8; }
          100% { transform: translateX(200px); opacity: 0; }
        }

        @keyframes windFlow2 {
          0% { transform: translateX(-30px); opacity: 0; }
          25% { opacity: 0.6; }
          75% { opacity: 0.6; }
          100% { transform: translateX(250px); opacity: 0; }
        }

        @keyframes windFlow3 {
          0% { transform: translateX(-25px); opacity: 0; }
          35% { opacity: 0.7; }
          65% { opacity: 0.7; }
          100% { transform: translateX(220px); opacity: 0; }
        }

        @keyframes windFlow4 {
          0% { transform: translateX(-15px); opacity: 0; }
          40% { opacity: 0.5; }
          60% { opacity: 0.5; }
          100% { transform: translateX(180px); opacity: 0; }
        }

        @keyframes windFlowReverse1 {
          0% { transform: translateX(20px); opacity: 0; }
          30% { opacity: 0.6; }
          70% { opacity: 0.6; }
          100% { transform: translateX(-200px); opacity: 0; }
        }

        @keyframes windFlowReverse2 {
          0% { transform: translateX(25px); opacity: 0; }
          35% { opacity: 0.7; }
          65% { opacity: 0.7; }
          100% { transform: translateX(-220px); opacity: 0; }
        }

        /* Enhanced button hover effects with wind interaction */
        .group:hover .wind-line {
          animation-duration: 1.5s;
        }
      `}</style>
    </div>
  )
} 