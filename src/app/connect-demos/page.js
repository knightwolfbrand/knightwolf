'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import styles from './connect-demos.module.css'

export default function ConnectDemos() {
  // Track active revealed item index or type for each of the 10 demos
  const [active1, setActive1] = useState(null)
  const [active2, setActive2] = useState(null)
  const [active3, setActive3] = useState(null)
  const [active4, setActive4] = useState(null)
  const [active5, setActive5] = useState(null)
  const [active6, setActive6] = useState(null)
  const [active7, setActive7] = useState(null)
  const [active8, setActive8] = useState(null)
  const [active9, setActive9] = useState(null)
  const [active10, setActive10] = useState(null)

  const socialData = [
    {
      type: 'instagram',
      label: 'Instagram',
      handle: 'knightwolf.shop',
      url: 'https://instagram.com/knightwolf.shop',
      icon: (
        <svg
          width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
      )
    },
    {
      type: 'email',
      label: 'Email Support',
      handle: 'hello.knightwolf@gmail.com',
      url: 'mailto:hello.knightwolf@gmail.com',
      icon: <Mail size={20} />
    },
    {
      type: 'phone',
      label: 'Call Direct',
      handle: '+91 99412 92729',
      url: 'tel:+919941292729',
      icon: (
        <svg
          width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 .18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
        </svg>
      )
    }
  ]

  const toggle = (activeState, setActiveState, type) => {
    if (activeState === type) {
      setActiveState(null) // toggle close if clicked again
    } else {
      setActiveState(type)
    }
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backBtn}>
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ marginRight: '6px' }}
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Dashboard
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Click-to-Reveal Architectures</h1>
        <p className={styles.subtitle}>
          Click any icon below to dynamically slide down and reveal its contact handle or value directly underneath it. 10 interactive styled variations.
        </p>
      </header>

      <main className={styles.grid}>
        {/* DEMO 1: Cyberpunk Brackets */}
        <section className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <span className={styles.demoNum}>Style 01</span>
            <span className={styles.demoName}>Cyberpunk Brackets</span>
          </div>
          <div className={styles.demoBody}>
            <div className={styles.iconRow}>
              {socialData.map((item) => (
                <button
                  key={item.type}
                  onClick={() => toggle(active1, setActive1, item.type)}
                  className={`${styles.iconBtn} ${styles.btnCyber} ${active1 === item.type ? styles.btnCyberActive : ''}`}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            {active1 && (
              <a
                href={socialData.find(s => s.type === active1)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.revealCyber}
              >
                [ {socialData.find(s => s.type === active1)?.handle} ]
              </a>
            )}
          </div>
        </section>

        {/* DEMO 2: Underline Slide */}
        <section className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <span className={styles.demoNum}>Style 02</span>
            <span className={styles.demoName}>Minimal Underline Slide</span>
          </div>
          <div className={styles.demoBody}>
            <div className={styles.iconRow}>
              {socialData.map((item) => (
                <button
                  key={item.type}
                  onClick={() => toggle(active2, setActive2, item.type)}
                  className={`${styles.iconBtn} ${styles.btnUnderline} ${active2 === item.type ? styles.btnUnderlineActive : ''}`}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            {active2 && (
              <a
                href={socialData.find(s => s.type === active2)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.revealUnderline}
              >
                {socialData.find(s => s.type === active2)?.handle}
              </a>
            )}
          </div>
        </section>

        {/* DEMO 3: Glassmorphic Capsule */}
        <section className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <span className={styles.demoNum}>Style 03</span>
            <span className={styles.demoName}>Glassmorphic Capsule</span>
          </div>
          <div className={styles.demoBody}>
            <div className={styles.iconRow}>
              {socialData.map((item) => (
                <button
                  key={item.type}
                  onClick={() => toggle(active3, setActive3, item.type)}
                  className={`${styles.iconBtn} ${styles.btnGlass} ${active3 === item.type ? styles.btnGlassActive : ''}`}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            {active3 && (
              <a
                href={socialData.find(s => s.type === active3)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.revealGlass}
              >
                {socialData.find(s => s.type === active3)?.handle}
              </a>
            )}
          </div>
        </section>

        {/* DEMO 4: Heavy Industrial Bold */}
        <section className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <span className={styles.demoNum}>Style 04</span>
            <span className={styles.demoName}>Heavy Industrial Frame</span>
          </div>
          <div className={styles.demoBody}>
            <div className={styles.iconRow}>
              {socialData.map((item) => (
                <button
                  key={item.type}
                  onClick={() => toggle(active4, setActive4, item.type)}
                  className={`${styles.iconBtn} ${styles.btnIndustrial} ${active4 === item.type ? styles.btnIndustrialActive : ''}`}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            {active4 && (
              <a
                href={socialData.find(s => s.type === active4)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.revealIndustrial}
              >
                {socialData.find(s => s.type === active4)?.handle}
              </a>
            )}
          </div>
        </section>

        {/* DEMO 5: Holographic Neon Glow */}
        <section className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <span className={styles.demoNum}>Style 05</span>
            <span className={styles.demoName}>Neon Hologram Glow</span>
          </div>
          <div className={styles.demoBody}>
            <div className={styles.iconRow}>
              {socialData.map((item) => (
                <button
                  key={item.type}
                  onClick={() => toggle(active5, setActive5, item.type)}
                  className={`${styles.iconBtn} ${styles.btnHolo} ${active5 === item.type ? styles.btnHoloActive : ''}`}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            {active5 && (
              <a
                href={socialData.find(s => s.type === active5)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.revealHolo}
              >
                {socialData.find(s => s.type === active5)?.handle}
              </a>
            )}
          </div>
        </section>

        {/* DEMO 6: Magnetic Pill */}
        <section className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <span className={styles.demoNum}>Style 06</span>
            <span className={styles.demoName}>Magnetic Accent Pill</span>
          </div>
          <div className={styles.demoBody}>
            <div className={styles.iconRow}>
              {socialData.map((item) => (
                <button
                  key={item.type}
                  onClick={() => toggle(active6, setActive6, item.type)}
                  className={`${styles.iconBtn} ${styles.btnMagnetic} ${active6 === item.type ? styles.btnMagneticActive : ''}`}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            {active6 && (
              <a
                href={socialData.find(s => s.type === active6)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.revealMagnetic}
              >
                {socialData.find(s => s.type === active6)?.handle}
              </a>
            )}
          </div>
        </section>

        {/* DEMO 7: Split Block Shift */}
        <section className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <span className={styles.demoNum}>Style 07</span>
            <span className={styles.demoName}>Split Block Reveal</span>
          </div>
          <div className={styles.demoBody}>
            <div className={styles.iconRow}>
              {socialData.map((item) => (
                <button
                  key={item.type}
                  onClick={() => toggle(active7, setActive7, item.type)}
                  className={`${styles.iconBtn} ${styles.btnSplit} ${active7 === item.type ? styles.btnSplitActive : ''}`}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            {active7 && (
              <a
                href={socialData.find(s => s.type === active7)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.revealSplit}
              >
                {socialData.find(s => s.type === active7)?.handle}
              </a>
            )}
          </div>
        </section>

        {/* DEMO 8: Left Border Accent Bar */}
        <section className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <span className={styles.demoNum}>Style 08</span>
            <span className={styles.demoName}>Border Accent Drawer</span>
          </div>
          <div className={styles.demoBody}>
            <div className={styles.iconRow}>
              {socialData.map((item) => (
                <button
                  key={item.type}
                  onClick={() => toggle(active8, setActive8, item.type)}
                  className={`${styles.iconBtn} ${styles.btnAccent} ${active8 === item.type ? styles.btnAccentActive : ''}`}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            {active8 && (
              <a
                href={socialData.find(s => s.type === active8)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.revealAccent}
              >
                {socialData.find(s => s.type === active8)?.handle}
              </a>
            )}
          </div>
        </section>

        {/* DEMO 9: Minimalist Clean Fade */}
        <section className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <span className={styles.demoNum}>Style 09</span>
            <span className={styles.demoName}>Clean Slate Fade</span>
          </div>
          <div className={styles.demoBody}>
            <div className={styles.iconRow}>
              {socialData.map((item) => (
                <button
                  key={item.type}
                  onClick={() => toggle(active9, setActive9, item.type)}
                  className={`${styles.iconBtn} ${styles.btnClean} ${active9 === item.type ? styles.btnCleanActive : ''}`}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            {active9 && (
              <a
                href={socialData.find(s => s.type === active9)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.revealClean}
              >
                {socialData.find(s => s.type === active9)?.handle}
              </a>
            )}
          </div>
        </section>

        {/* DEMO 10: Retro Terminal Execution */}
        <section className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <span className={styles.demoNum}>Style 10</span>
            <span className={styles.demoName}>Terminal Output Stream</span>
          </div>
          <div className={styles.demoBody}>
            <div className={styles.iconRow}>
              {socialData.map((item) => (
                <button
                  key={item.type}
                  onClick={() => toggle(active10, setActive10, item.type)}
                  className={`${styles.iconBtn} ${styles.btnTerminal} ${active10 === item.type ? styles.btnTerminalActive : ''}`}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            {active10 && (
              <a
                href={socialData.find(s => s.type === active10)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.revealTerminal}
              >
                $ cat {active10}.log // {socialData.find(s => s.type === active10)?.handle}
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
