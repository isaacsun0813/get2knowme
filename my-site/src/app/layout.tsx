import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
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
        {children}
        {/* Global dim overlay (non-interactive) */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] bg-black/5" />
      </body>
    </html>
  );
}
