'use client'

import { useState } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import SplashScreen from '@/components/layout/SplashScreen'
import SplashLab from '@/components/dev/SplashLab'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({ children }) {
  const [splashDone, setSplashDone] = useState(false)
  const [splashMode, setSplashMode] = useState('scaleSync')

  const handleModeChange = (mode, forceReplay = false) => {
    if (forceReplay) {
      setSplashDone(false)
    }
    setSplashMode(mode)
  }

  return (
    <html lang="en">
      <head>
        <title>Knight Wolf — Wear The Hunt</title>
        <meta name="description" content="Premium custom T-shirts. Design your own with our interactive 3D configurator. Knight Wolf — Wear The Hunt." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${!splashDone ? 'splash-active' : ''}`}>
        
        {/* Finalized Cinematic Splash Screen */}
        {!splashDone && (
          <SplashScreen 
            mode={splashMode}
            onComplete={() => setSplashDone(true)} 
          />
        )}

        {/* Development Tool */}
        <SplashLab 
          currentMode={splashMode} 
          onModeChange={handleModeChange} 
        />

        {/* Main app content */}
        <main style={{
          opacity: splashDone ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          {children}
        </main>
      </body>
    </html>
  )
}
