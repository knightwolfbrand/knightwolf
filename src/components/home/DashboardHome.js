'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Libre_Baskerville } from 'next/font/google'
import styles from './DashboardHome.module.css'

const libreBaskerville = Libre_Baskerville({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export default function DashboardHome() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  const toggleTheme = () => setIsDark(!isDark);

  const images = [
    "/box/PHOTO-2026-05-11-13-18-47.png",
    "/box/PHOTO-2026-05-11-13-20-11.png",
    "/box/PHOTO-2026-05-11-13-20-50.png",
    "/box/PHOTO-2026-05-11-13-22-08.png",
    "/box/PHOTO-2026-05-11-13-22-22.png",
    "/box/PHOTO-2026-05-11-13-34-40.png"
  ];

  // Internal component for scrolling columns
  const ScrollingColumn = ({ imageList, direction = 'up', speed = 40, isFilmReel = false }) => {
    return (
      <div className={`${styles.scrollColumnWrap} ${isFilmReel ? styles.filmReel : ''}`}>
        <motion.div 
          className={styles.scrollColumn}
          animate={{ 
            y: direction === 'up' ? ['0%', '-50%'] : ['-50%', '0%'] 
          }}
          transition={{ 
            duration: speed, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {/* Double the list for seamless loop */}
          {[...imageList, ...imageList].map((src, idx) => (
            <div key={idx} className={isFilmReel ? styles.filmFrame : styles.galleryCard}>
              <img src={src} alt={`Product ${idx}`} className={styles.galleryImg} />
            </div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <div className={`${isDark ? styles.heroSectionDark : styles.heroSection} ${libreBaskerville.className}`}>
      
      {/* ─── Cinematic Vignettes ─── */}
      <div className={styles.vignetteTop} />
      <div className={styles.vignetteBottom} />

      {/* ─── Unified Command Center (Header) ─── */}
      <div className={styles.headerWrapper}>
        <nav className={styles.commandCenter}>
          <div className={styles.navBrand}>
            <img 
              src="/KnightWolf_Logo_White.svg" 
              alt="Knight Wolf Logo" 
              className={styles.navLogo} 
            />
          </div>
          
          <div className={styles.navMenu}>
            {['About Us', 'Contact', 'Login'].map((item) => {
              const id = item.toLowerCase().replace(' ', '');
              return (
                <button 
                  key={id}
                  className={`${styles.navItem} ${activeTab === id ? styles.navItemActive : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <button 
            className={`${styles.headerToggle} ${!isDark ? styles.headerToggleLight : ''}`} 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </nav>
      </div>

      {/* ─── Living Gallery Grid ─── */}
      <main className={styles.galleryGrid}>
        
        {/* Col 1: Upwards */}
        <ScrollingColumn imageList={[images[0], images[1], images[2]]} direction="up" speed={30} />

        {/* Col 2: Downwards */}
        <ScrollingColumn imageList={[images[3], images[4], images[5]]} direction="down" speed={35} />

        {/* Col 3: Center Focus */}
        <div className={styles.centerFocusCol}>
          <div className={styles.centerContent}>
            <h2 className={styles.trendingTitle}>
              Wear to Hurt
            </h2>
            <span className={styles.trendingLabel}>Trending Collections</span>
            <div className={styles.centerCard}>
              <img src={images[2]} alt="Featured" className={styles.centerImg} />
            </div>
          </div>
        </div>

        {/* Col 4: Upwards */}
        <ScrollingColumn imageList={[images[1], images[3], images[5]]} direction="up" speed={32} />

        {/* Col 5: Downwards */}
        <ScrollingColumn imageList={[images[2], images[4], images[0]]} direction="down" speed={38} />
      </main>

      {/* ─── Global Bottom CTA ─── */}
      <button className={styles.centerCta}>
        Explore More <span className={styles.ctaArrow}>→</span>
      </button>
    </div>
  )
}
