'use client'

import { useEffect, useRef } from 'react'
import { transitions } from './SplashTransitions'
import styles from './SplashScreen.module.css'

export default function SplashScreen({ concept = 'blurReveal', onComplete }) {
  const splashRef = useRef(null)
  const leftPanelRef = useRef(null)
  const rightPanelRef = useRef(null)
  const logoRef = useRef(null)
  const brandNameRef = useRef(null)
  const logoSvgRef = useRef(null)

  useEffect(() => {
    // Collect all refs for the transitions library
    const refs = {
      splash: splashRef.current,
      leftPanel: leftPanelRef.current,
      rightPanel: rightPanelRef.current,
      logo: logoRef.current,
      brandName: brandNameRef.current,
      logoSvg: logoSvgRef.current
    }

    // Get the selected transition logic
    const transitionFn = transitions[concept] || transitions.blurReveal
    
    // Trigger the animation
    const tl = transitionFn(refs)

    // Notify parent on completion
    tl.eventCallback('onComplete', () => {
      if (onComplete) onComplete()
    })

    return () => tl.kill()
  }, [concept, onComplete])

  const brandLetters = 'KNIGHTWOLF'.split('')

  return (
    <div ref={splashRef} className={styles.splash}>
      {/* ── Curtain Panels ── */}
      <div ref={leftPanelRef} className={`${styles.panel} ${styles.panelLeft}`} />
      <div ref={rightPanelRef} className={`${styles.panel} ${styles.panelRight}`} />

      {/* ── Center Content ── */}
      <div className={styles.content}>
        {/* Wolf SVG Logo */}
        <div ref={logoRef} className={styles.logoWrap} style={{ opacity: 0 }}>
          <svg
            ref={logoSvgRef}
            width="100"
            height="140"
            viewBox="0 0 430 593"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.logoSvg}
          >
            <path d="M95.7916 208.421L172.729 269.321C172.729 269.321 173.464 258.689 172.729 251.921C168 208.375 85.6217 165.284 85.1795 166.009C84.7373 166.734 80.6694 174.056 67.9349 197.546C55.2003 221.036 55.5541 282.733 57.3228 310.646C59.0914 338.558 6.47318 367.92 16.2009 387.858C25.9287 407.795 57.3228 459.632 57.3228 459.632C57.3228 459.632 102.424 481.382 132.934 495.52C157.342 506.83 168.75 555.332 168.75 555.332C168.75 555.332 212.714 583.575 222 593C222 593 222.871 570.992 221.81 564.032C220.749 557.072 203.681 548.807 195.28 545.544C195.28 545.544 197.402 395.408 195.28 375.398C193.158 355.388 149.016 342.032 126.465 334.42C130.445 342.395 132.094 348.825 138.462 361.875C144.829 374.925 166.097 380.914 172.729 382.364L155.485 481.382C131.077 455.282 94.9072 445.857 79.8735 444.407L48.0372 387.858L89.159 314.996C68.996 265.406 85.1795 223.284 95.7916 208.421Z" />
            <path d="M348.49 208.421L271.553 269.321C271.553 269.321 270.817 258.689 271.553 251.921C276.282 208.375 358.66 165.284 359.102 166.009C359.544 166.734 363.612 174.056 376.347 197.546C389.081 221.036 388.728 282.733 386.959 310.646C385.19 338.558 437.809 367.92 428.081 387.858C418.353 407.795 386.959 459.632 386.959 459.632C386.959 459.632 341.858 481.382 311.348 495.52C286.94 506.83 275.532 555.332 275.532 555.332C275.532 555.332 231.286 583.575 222 593C222 593 221.41 570.992 222.472 564.032C223.533 557.072 240.601 548.807 249.002 545.544C249.002 545.544 246.879 395.408 249.002 375.398C251.124 355.388 295.266 342.032 317.816 334.42C313.837 342.395 312.187 348.825 305.82 361.875C299.453 374.925 278.185 380.914 271.553 382.364L288.797 481.382C313.205 455.282 349.374 445.857 364.408 444.407L396.245 387.858L355.123 314.996C375.286 265.406 359.102 223.284 348.49 208.421Z" />
            <path d="M260.332 82.1131C255.813 108.324 221.719 133.974 221.719 133.974C221.719 133.974 196.806 91.2368 151.549 133.974C106.292 176.711 49.4092 123.89 29.4794 92.6774C9.54968 61.4648 2.35282 19.848 0 0C1.93762 3.84155 12.0408 28.3314 29.4794 46.0986C46.9181 63.8658 66.8479 60.9846 66.8479 60.9846C66.8479 60.9846 46.0877 47.059 40.69 18.7276C42.3508 20.1681 62.1322 41.413 78.4734 46.0986C111.428 55.5478 130.528 25.1532 161.514 16.3266C192.5 7.5 269.04 31.6097 260.332 82.1131Z" />
            <path d="M199.5 150.5L222 123V359L189.5 248L211.5 222C211.5 222 197.5 224 175 211.5C152.5 199 142.5 199 142.5 199L152 185C169.5 165.5 190.333 165 199.5 162V150.5Z" />
            <path d="M244 150.5L221.5 123V359L254 248L232 222C232 222 246 224 268.5 211.5C291 199 301 199 301 199L291.5 185C274 165.5 253.167 165 244 162V150.5Z" />
          </svg>
        </div>

        {/* Brand Name — letter by letter */}
        <div ref={brandNameRef} className={styles.brandName} aria-label="Knight Wolf">
          {brandLetters.map((letter, i) => (
            <span key={i} className={styles.letter}>{letter}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
