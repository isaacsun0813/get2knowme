import Experience from './components/Experience'
import ClientOnly from './components/ClientOnly'

export default function Home() {
  return (
    <main className="h-screen w-screen" suppressHydrationWarning>
      <ClientOnly fallback={
        <div className="h-screen w-screen bg-gradient-to-b from-sky-200 to-sky-300 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      }>
        <Experience />
      </ClientOnly>
    </main>
  )
}
