'use client'

import React, { useState } from 'react'
import styles from './DashboardHome.module.css'

export default function DashboardHome() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className={isDark ? styles.heroSectionDark : styles.heroSection}>
      
      {/* ─── Theme Toggle ─── */}
      <button 
        className={styles.themeToggle} 
        onClick={toggleTheme}
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* ─── Exact Order Fashion Grid ─── */}
      <main className={styles.gridContainer}>
        
        {/* Column 1: Orange Top + Red Bottom */}
        <div style={{ display: 'grid', gap: '20px' }}>
          <div className={`${styles.bentoBox} ${styles.modelBox} ${styles.tabLeft}`}>
            <img src="/fashion_model_orange_v2_1778242361333.png" alt="Orange" className={styles.modelImage} />
          </div>
          <div className={`${styles.bentoBox} ${styles.modelBox}`}>
            <img src="/fashion_model_red_1778242523150.png" alt="Crimson" className={styles.modelImage} />
          </div>
        </div>

        {/* Column 2: Green Tall */}
        <div className={`${styles.bentoBox} ${styles.modelBox} ${styles.spanTall} ${styles.tabRight}`}>
          <img src="/fashion_model_green_1778242393347.png" alt="Green" className={styles.modelImage} />
        </div>

        {/* Column 3: Yellow Center + Explore Button */}
        <div style={{ display: 'grid', gap: '20px' }}>
          <div className={`${styles.bentoBox} ${styles.modelBox} ${styles.tabCenter}`}>
            <img src="/fashion_model_yellow_center_1778242909902.png" alt="Yellow Center" className={styles.modelImage} />
          </div>
          <div className={styles.exploreBtnWrap}>
            <button className={styles.exploreBtn}>
              Explore Collections <span className={styles.arrow}>→</span>
            </button>
          </div>
        </div>

        {/* Column 4: Blue Tall */}
        <div className={`${styles.bentoBox} ${styles.modelBox} ${styles.spanTall} ${styles.tabLeft}`}>
          <img src="/fashion_model_blue_1778242424880.png" alt="Blue" className={styles.modelImage} />
        </div>

        {/* Column 5: Mint Top + Teal Bottom */}
        <div style={{ display: 'grid', gap: '20px' }}>
          <div className={`${styles.bentoBox} ${styles.modelBox} ${styles.tabRight}`}>
            <img src="/fashion_model_mint_top_1778242943069.png" alt="Mint" className={styles.modelImage} />
          </div>
          <div className={`${styles.bentoBox} ${styles.modelBox}`}>
            <img src="/fashion_model_teal_bottom_1778242973379.png" alt="Teal" className={styles.modelImage} />
          </div>
        </div>

      </main>

    </div>
  )
}
