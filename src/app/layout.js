'use client'

import { useState } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import SplashScreen from '@/components/layout/SplashScreen'
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

  return (
    <html lang="en" style={{ backgroundColor: '#0a0a0f' }} suppressHydrationWarning>
      <head>
        <title>Knight Wolf — Wear The Hunt</title>
        <meta name="description" content="Premium custom T-shirts. Design your own with our interactive 3D configurator. Knight Wolf — Wear The Hunt." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${!splashDone ? 'splash-active' : ''}`} style={{ backgroundColor: '#0a0a0f' }} suppressHydrationWarning>
        
        {/* Finalized Cinematic Splash Screen */}
        {!splashDone && (
          <SplashScreen 
            onComplete={() => setSplashDone(true)} 
          />
        )}

        {/* Main app content — DashboardHome controls its own cinematic reveal */}
        <main style={{ opacity: 1 }}>
          {children}
        </main>
      </body>
    </html>
  )
}
