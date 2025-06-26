'use client'

export default function FlightControls() {
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center font-mono uppercase tracking-wider">
          Flight Controls
        </h3>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <kbd className="bg-gray-700 text-white px-3 py-2 rounded font-mono font-bold text-sm shadow-md">W</kbd>
            <span className="text-gray-700 font-mono font-semibold uppercase tracking-wide">Speed up</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <kbd className="bg-gray-700 text-white px-3 py-2 rounded font-mono font-bold text-sm shadow-md">A</kbd>
            <span className="text-gray-700 font-mono font-semibold uppercase tracking-wide">Turn left</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <kbd className="bg-gray-700 text-white px-3 py-2 rounded font-mono font-bold text-sm shadow-md">D</kbd>
            <span className="text-gray-700 font-mono font-semibold uppercase tracking-wide">Turn right</span>
          </div>
        </div>
      </div>
    </div>
  )
} 