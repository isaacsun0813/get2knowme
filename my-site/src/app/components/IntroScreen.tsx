'use client'

import { useState, useEffect } from 'react'

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
      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-blue-100 to-blue-50" />
      
      {/* Enhanced parallax clouds */}
      <div className="absolute inset-0">
        {/* Layer 1 - Fastest, largest clouds */}
        <div className="absolute w-full h-full opacity-90">
          <div className="cloud-large cloud-1 animate-cloud-fastest"></div>
          <div className="cloud-large cloud-2 animate-cloud-fastest" style={{ animationDelay: '-3s' }}></div>
          <div className="cloud-large cloud-3 animate-cloud-fastest" style={{ animationDelay: '-6s' }}></div>
          <div className="cloud-large cloud-4 animate-cloud-fastest" style={{ animationDelay: '-9s' }}></div>
        </div>
        
        {/* Layer 2 - Fast, medium clouds */}
        <div className="absolute w-full h-full opacity-75">
          <div className="cloud-medium cloud-5 animate-cloud-fast"></div>
          <div className="cloud-medium cloud-6 animate-cloud-fast" style={{ animationDelay: '-4s' }}></div>
          <div className="cloud-medium cloud-7 animate-cloud-fast" style={{ animationDelay: '-8s' }}></div>
          <div className="cloud-medium cloud-8 animate-cloud-fast" style={{ animationDelay: '-12s' }}></div>
        </div>
        
        {/* Layer 3 - Medium speed, smaller clouds */}
        <div className="absolute w-full h-full opacity-60">
          <div className="cloud-small cloud-9 animate-cloud-medium"></div>
          <div className="cloud-small cloud-10 animate-cloud-medium" style={{ animationDelay: '-5s' }}></div>
          <div className="cloud-small cloud-11 animate-cloud-medium" style={{ animationDelay: '-10s' }}></div>
          <div className="cloud-small cloud-12 animate-cloud-medium" style={{ animationDelay: '-15s' }}></div>
        </div>

        {/* Layer 4 - Slowest, background clouds */}
        <div className="absolute w-full h-full opacity-40">
          <div className="cloud-tiny cloud-13 animate-cloud-slow"></div>
          <div className="cloud-tiny cloud-14 animate-cloud-slow" style={{ animationDelay: '-6s' }}></div>
          <div className="cloud-tiny cloud-15 animate-cloud-slow" style={{ animationDelay: '-12s' }}></div>
        </div>
      </div>

      {/* Main content */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center text-center break-words transition-all duration-800 ${isTransitioning ? 'opacity-0 scale-[0.3]' : ''}`}>
        <div className="bg-white/15 backdrop-blur-xl p-8 sm:p-12 md:p-16 lg:p-24 rounded-3xl sm:rounded-[4rem] lg:rounded-[5rem] border border-white/20 shadow-2xl w-[90%] sm:w-[85%] md:w-[80%] max-w-4xl lg:max-w-7xl mx-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-6 md:mb-8 lg:mb-12 md:mb-16">
            <h1 className="break-words text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] xl:text-[14rem]">
              Hello
            </h1>
            <span className="break-words text-3xl sm:text-5xl md:text-[6rem] lg:text-[8rem] xl:text-[10rem] animate-wave-slow">👋</span>
          </div>
          <p className="whitespace-nowrap text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-8xl mb-12 sm:mb-16 md:mb-20 lg:mb-24 leading-tight">
            <span className="inline-block">Welcome to Isaac&apos;s</span>
            <span className="inline-block ml-4">World</span>
          </p>
          
          <div className="relative">
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
              className="group relative bg-white/90 hover:bg-white text-gray-800 hover:text-gray-900 px-8 py-3 sm:px-12 md:px-6 md:px-12 lg:px-16 sm:py-4 md:py-5 rounded-2xl sm:rounded-3xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-200/50 hover:border-gray-300/70"
            >
              <span className="relative z-10 flex items-center gap-2 sm:gap-3 md:gap-4 tracking-normal text-lg sm:text-xl md:text-2xl lg:text-3xl">
                Take Flight
                <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* CSS for enhanced cloud animations */}
      <style jsx>{`
        .cloud-large, .cloud-medium, .cloud-small, .cloud-tiny {
          position: absolute;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 70%, transparent 100%);
          border-radius: 100px;
          filter: blur(1px);
        }
        
        /* Large clouds - closest layer */
        .cloud-large { filter: blur(0.5px); }
        .cloud-1 { width: 400px; height: 120px; left: 5%; top: 15%; }
        .cloud-2 { width: 500px; height: 150px; left: 55%; top: 25%; }
        .cloud-3 { width: 450px; height: 135px; left: 25%; top: 5%; }
        .cloud-4 { width: 380px; height: 115px; left: 75%; top: 35%; }

        /* Medium clouds */
        .cloud-medium { filter: blur(1px); }
        .cloud-5 { width: 300px; height: 90px; left: 15%; top: 45%; }
        .cloud-6 { width: 350px; height: 105px; left: 65%; top: 55%; }
        .cloud-7 { width: 320px; height: 95px; left: 45%; top: 65%; }
        .cloud-8 { width: 280px; height: 85px; left: 85%; top: 10%; }

        /* Small clouds */
        .cloud-small { filter: blur(1.5px); }
        .cloud-9 { width: 200px; height: 60px; left: 35%; top: 20%; }
        .cloud-10 { width: 220px; height: 65px; left: 10%; top: 70%; }
        .cloud-11 { width: 180px; height: 55px; left: 70%; top: 75%; }
        .cloud-12 { width: 210px; height: 63px; left: 90%; top: 50%; }

        /* Tiny clouds - background */
        .cloud-tiny { filter: blur(2px); }
        .cloud-13 { width: 120px; height: 36px; left: 20%; top: 80%; }
        .cloud-14 { width: 140px; height: 42px; left: 60%; top: 5%; }
        .cloud-15 { width: 130px; height: 39px; left: 80%; top: 85%; }

        @keyframes cloud-fastest {
          0% { transform: translateY(-120vh) scale(0.3); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(120vh) scale(1.8); opacity: 0; }
        }

        @keyframes cloud-fast {
          0% { transform: translateY(-110vh) scale(0.4); opacity: 0; }
          15% { opacity: 0.75; }
          85% { opacity: 0.75; }
          100% { transform: translateY(110vh) scale(1.6); opacity: 0; }
        }

        @keyframes cloud-medium {
          0% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(100vh) scale(1.4); opacity: 0; }
        }

        @keyframes cloud-slow {
          0% { transform: translateY(-90vh) scale(0.6); opacity: 0; }
          25% { opacity: 0.4; }
          75% { opacity: 0.4; }
          100% { transform: translateY(90vh) scale(1.2); opacity: 0; }
        }

        @keyframes wave-slow {
          0%, 85% { transform: rotate(0deg); }
          87%, 91%, 95% { transform: rotate(14deg); }
          89%, 93% { transform: rotate(-14deg); }
          97%, 100% { transform: rotate(0deg); }
        }

        .animate-cloud-fastest { animation: cloud-fastest 6s infinite linear; }
        .animate-cloud-fast { animation: cloud-fast 9s infinite linear; }
        .animate-cloud-medium { animation: cloud-medium 13s infinite linear; }
        .animate-cloud-slow { animation: cloud-slow 18s infinite linear; }
        .animate-wave-slow { animation: wave-slow 4s ease-in-out infinite; }

        /* Wind animation around the button */
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