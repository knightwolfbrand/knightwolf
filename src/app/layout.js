'use client'

import { useState, useCallback } from 'react'
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
  const [concept, setConcept] = useState('blurReveal')
  const [splashKey, setSplashKey] = useState(0)

  // Function to re-trigger a specific splash concept
  const handleSplashSelect = useCallback((newConcept) => {
    setConcept(newConcept)
    setSplashDone(false)
    setSplashKey(prev => prev + 1)
  }, [])

  return (
    <html lang="en">
      <head>
        <title>Knight Wolf — Wear The Hunt</title>
        <meta name="description" content="Premium custom T-shirts. Design your own with our interactive 3D configurator. Knight Wolf — Wear The Hunt." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${!splashDone ? 'splash-active' : ''}`}>
        
        {/* The 10-Concept Splash Showcase */}
        {!splashDone && (
          <SplashScreen 
            key={splashKey}
            concept={concept} 
            onComplete={() => setSplashDone(true)} 
          />
        )}

        {/* Development Showcase Tool (Splash Lab) */}
        <SplashLab onSelect={handleSplashSelect} />

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
