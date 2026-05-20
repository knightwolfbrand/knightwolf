'use client'

import { useState, useEffect } from 'react'
import SplashScreen from './SplashScreen'

export default function ClientWrapper({ children }) {
  const [splashDone, setSplashDone] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Synchronize body class for CSS targeting
    if (!splashDone) {
      document.body.classList.add('splash-active')
    } else {
      document.body.classList.remove('splash-active')
    }
  }, [splashDone])

  // Prevent flash of content if needed, though the splash covers it
  if (!mounted) return null

  return (
    <>
      {!splashDone && (
        <SplashScreen 
          onComplete={() => setSplashDone(true)} 
        />
      )}
      <main style={{
        opacity: splashDone ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}>
        {children}
      </main>
    </>
  )
}
