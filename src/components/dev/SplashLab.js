'use client'

import React from 'react'
import styles from './SplashLab.module.css'

export default function SplashLab({ onModeChange, currentMode }) {
  const modes = [
    { id: 'unitizedEntrance', name: '1. Unitized' },
    { id: 'linkedExposure', name: '2. Exposure' },
    { id: 'solidReveal', name: '3. Reveal' },
    { id: 'atmosphericCrossFade', name: '4. CrossFade' },
    { id: 'scaleSync', name: '5. ScaleSync' }
  ]

  return (
    <div className={styles.lab}>
      <header className={styles.header}>
        <span className={styles.icon}>🐺</span>
        <span className={styles.title}>Splash Lab v2</span>
      </header>
      
      <div className={styles.grid}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`${styles.btn} ${currentMode === mode.id ? styles.active : ''}`}
            onClick={() => onModeChange(mode.id)}
          >
            {mode.name}
          </button>
        ))}
      </div>
      
      <button 
        className={styles.replay}
        onClick={() => onModeChange(currentMode, true)} // true to force replay
      >
        ↻ REPLAY TRANSITION
      </button>

      <div className={styles.footer}>
        Knight Wolf — Animation Preview
      </div>
    </div>
  )
}
