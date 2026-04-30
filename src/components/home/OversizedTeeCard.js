'use client'

import React, { useState, useEffect } from 'react'
import styles from './OversizedTeeCard.module.css'

export default function OversizedTeeCard() {
  const [currentFrame, setCurrentFrame] = useState(1);
  const totalFrames = 36; // Adjust this if you have more or fewer frames

  useEffect(() => {
    // Autoplay the image sequence
    const intervalId = setInterval(() => {
      setCurrentFrame((prevFrame) => {
        if (prevFrame >= totalFrames) {
          return 1;
        }
        return prevFrame + 1;
      });
    }, 60);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.viewArea}>
        {/* Image Sequence Player */}
        <img 
          src={`/frames/frame${currentFrame}.png`} 
          alt="Oversized Tee Spin"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            pointerEvents: 'none' 
          }} 
        />
      </div>

      <div className={styles.info}>
        <div className={styles.headerWrapper}>
          <div className={styles.titleArea}>
            <span className={styles.badge}>NEW ARRIVAL</span>
            <h2 className={styles.title}>OVERSIZED TEE</h2>
          </div>
          <div className={styles.priceArea}>
            <p className={styles.price}>₹2,999</p>
          </div>
        </div>
        <p className={styles.collection}>Core Collection 2026</p>
        <button 
          className={styles.buyBtn}
          onClick={() => window.location.href = '/customize/configurator.html'}
        >
          CUSTOMIZE
        </button>
      </div>
    </div>
  )
}
