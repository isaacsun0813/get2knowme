import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import DevToolsErrorBoundary from "./components/DevToolsErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Isaac's World",
  description: "Welcome to Isaac's interactive 3D world - explore landmarks and discover my journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical images for instant loading */}
        <link rel="preload" as="image" href="/photos/profilePic.jpeg" type="image/jpeg" />
        <link rel="preload" as="image" href="/photos/adventure/adventure1.jpg" type="image/jpeg" />
        <link rel="preload" as="image" href="/photos/adventure/adventure2.jpg" type="image/jpeg" />
        <link rel="preload" as="image" href="/photos/adventure/adventure3.jpg" type="image/jpeg" />
        <link rel="preload" as="image" href="/photos/adventure/adventure4.jpg" type="image/jpeg" />
        <link rel="preload" as="image" href="/photos/adventure/adventure5.jpg" type="image/jpeg" />
        <link rel="preload" as="image" href="/photos/projects/Verdra.png" type="image/png" />
        <link rel="preload" as="image" href="/photos/projects/PrizeSole.png" type="image/png" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // CRITICAL: Suppress React DevTools errors BEFORE React initializes
              // This must run as early as possible
              (function() {
                // Suppress console errors from React DevTools
                const originalConsoleError = console.error;
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (
                    typeof message === 'string' && (
                      message.includes('semver') || 
                      message.includes('react_devtools') ||
                      message.includes('Invalid argument not valid semver') ||
                      message.includes('not valid semver') ||
                      message.includes('chrome-extension://fmkadmapgofadopljbjfkapdkoienihi')
                    )
                  ) {
                    // Silently suppress React DevTools errors
                    return;
                  }
                  // Let other errors through
                  originalConsoleError.apply(console, args);
                };
                
                // Override window.onerror
                const originalError = window.onerror;
                window.onerror = function(message, source, lineno, colno, error) {
                  if (typeof message === 'string' && (
                    message.includes('semver') || 
                    message.includes('react_devtools') ||
                    message.includes('Invalid argument not valid semver') ||
                    message.includes('not valid semver') ||
                    message.includes('chrome-extension://fmkadmapgofadopljbjfkapdkoienihi')
                  )) {
                    // Suppress React DevTools semver errors
                    return true;
                  }
                  // Let other errors through
                  if (originalError) {
                    return originalError(message, source, lineno, colno, error);
                  }
                  return false;
                };
                
                // Catch errors via error event (capture phase)
                window.addEventListener('error', function(event) {
                  const errorMessage = event.message || event.filename || '';
                  if (
                    errorMessage.includes('semver') || 
                    errorMessage.includes('react_devtools') ||
                    errorMessage.includes('Invalid argument not valid semver') ||
                    errorMessage.includes('chrome-extension://fmkadmapgofadopljbjfkapdkoienihi')
                  ) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                  }
                }, true);
                
                // Catch unhandled promise rejections from React DevTools
                window.addEventListener('unhandledrejection', function(event) {
                  if (event.reason) {
                    const message = typeof event.reason === 'string' 
                      ? event.reason 
                      : (event.reason.message || String(event.reason));
                    if (
                      message.includes('semver') || 
                      message.includes('react_devtools') ||
                      message.includes('chrome-extension://fmkadmapgofadopljbjfkapdkoienihi')
                    ) {
                      event.preventDefault();
                      event.stopPropagation();
                      return false;
                    }
                  }
                });
              })();
              
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function() {})
                    .catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <DevToolsErrorBoundary>
          {children}
        </DevToolsErrorBoundary>
        {/* Global dim overlay (non-interactive) */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] bg-black/5" />
      </body>
    </html>
  );
}
