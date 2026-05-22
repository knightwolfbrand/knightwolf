'use client'

import React, { useState, useEffect } from 'react'
import DashboardHome from '@/components/home/DashboardHome'

// Curated catalog of the 10 premium typography options designed for a unified single-line "NEW LAUNCH" layout
const TYPOGRAPHY_OPTIONS = [
  {
    id: '01',
    name: 'Milanese Haute Couture',
    mood: 'Ultra-luxury Roman proportions, majestic French couture presence',
    fontPair: 'Cinzel / Montserrat',
    googleFontLink: 'Cinzel:wght@300;400&family=Montserrat:wght@300',
    textContent: 'NEW LAUNCH',
    massiveStyle: {
      fontFamily: "'Cinzel', serif",
      fontSize: '6.4cqw', /* Calibrated for horizontal containment of single string */
      fontWeight: '300',
      lineHeight: '1.2',
      letterSpacing: '0.36em', /* Premium wide letter spacing for couture aesthetic */
      textTransform: 'uppercase',
      opacity: '0.9',
      transform: 'scale(1.05, 1.4)', /* Tall elegant runway presence */
      transformOrigin: 'center center',
      whiteSpace: 'nowrap'
    }
  },
  {
    id: '02',
    name: 'Heavy Streetwear Condensed',
    mood: 'High-impact athletic bold font, raw Berlin streetwear stance',
    fontPair: 'Bebas Neue / Inter',
    googleFontLink: 'Bebas+Neue&family=Inter:wght@400;700',
    textContent: 'NEW LAUNCH',
    massiveStyle: {
      fontFamily: "'Bebas Neue', 'Arial Narrow', 'Impact', sans-serif",
      fontSize: '8.5cqw', /* Calibrated to prevent edge overflow */
      fontWeight: '900',
      lineHeight: '1.0',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      transform: 'scale(0.95, 1.8)', /* Tall compressed block style */
      transformOrigin: 'center center',
      whiteSpace: 'nowrap'
    }
  },
  {
    id: '03',
    name: 'Swiss Architectural Extended',
    mood: 'Avant-garde, modern extended layout, architectural structure',
    fontPair: 'Condenso Demo',
    googleFontLink: '',
    textContent: 'LAUNCH',
    containerStyle: {
      transform: 'translateY(-8%)'
    },
    massiveStyle: {
      fontFamily: "'Condenso Demo', sans-serif",
      fontSize: 'min(47.0cqw, 49.0cqh)',
      fontWeight: 'normal',
      lineHeight: '0.9',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      transform: 'scale(1.0, 1.4)',
      transformOrigin: 'center center',
      whiteSpace: 'nowrap'
    }
  },
  {
    id: '04',
    name: 'Technical Monospace',
    mood: 'Blueprint design, barcode techwear, industrial label aesthetics',
    fontPair: 'Space Mono / Space Grotesk',
    googleFontLink: 'Space+Mono:wght@700&family=Space+Grotesk:wght@700',
    textContent: 'NEW LAUNCH',
    massiveStyle: {
      fontFamily: "'Space Mono', monospace",
      fontSize: '5.5cqw',
      fontWeight: '700',
      lineHeight: '1.0',
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      transform: 'scale(0.95, 1.0)',
      transformOrigin: 'center center',
      whiteSpace: 'nowrap'
    }
  },
  {
    id: '05',
    name: 'Wireframe Outline',
    mood: 'Chic industrial wireframe, hollow floating structural geometry',
    fontPair: 'Bebas Neue (Stroke Outline)',
    googleFontLink: 'Bebas+Neue',
    textContent: 'NEW LAUNCH',
    massiveStyle: {
      fontFamily: "'Bebas Neue', 'Arial Narrow', 'Impact', sans-serif",
      fontSize: '8.5cqw',
      fontWeight: '900',
      lineHeight: '1.0',
      letterSpacing: '0.12em',
      color: 'transparent',
      WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.85)',
      textTransform: 'uppercase',
      transform: 'scale(0.95, 1.8)',
      transformOrigin: 'center center',
      whiteSpace: 'nowrap'
    }
  },
  {
    id: '06',
    name: 'Swiss Architectural Condensed',
    mood: 'Avant-garde squeezed and stretched Syne block layout',
    fontPair: 'Syne / Outfit',
    googleFontLink: 'Syne:wght@800&family=Outfit:wght@300',
    textContent: 'NEW LAUNCH',
    massiveStyle: {
      fontFamily: "'Syne', sans-serif",
      fontSize: '24.0cqw', /* Massive condensed font-size for full horizontal coverage */
      fontWeight: '800', /* Syne weight 800 */
      lineHeight: '1.0',
      letterSpacing: '0.02em', /* Ultra-tight compact letter spacing to match mockup */
      textTransform: 'uppercase',
      transform: 'scale(0.72, 3.2)', /* Squeezed horizontally and stretched vertically to match mockup proportions */
      transformOrigin: 'center center',
      whiteSpace: 'nowrap'
    }
  },
  {
    id: '07',
    name: 'Paris Cormorant Italic',
    mood: 'Flowing organic luxury, sophisticated delicate editorial look',
    fontPair: 'Cormorant Garamond',
    googleFontLink: 'Cormorant+Garamond:ital,wght@1,400',
    textContent: 'New Launch',
    massiveStyle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '7.2cqw',
      fontWeight: '400',
      fontStyle: 'italic',
      lineHeight: '1.0',
      letterSpacing: '0.18em',
      transform: 'scale(1.0, 1.15)',
      transformOrigin: 'center center',
      whiteSpace: 'nowrap'
    }
  },
  {
    id: '08',
    name: 'Rick Owens Gothic',
    mood: 'Heavy darkmetal gothic print, raw high-fashion high-contrast',
    fontPair: 'UnifrakturMaguntia / Inter',
    googleFontLink: 'UnifrakturMaguntia&family=Inter:wght@400',
    textContent: 'New Launch',
    massiveStyle: {
      fontFamily: "'UnifrakturMaguntia', serif",
      fontSize: '7.8cqw',
      fontWeight: '400',
      lineHeight: '1.0',
      letterSpacing: '0.16em',
      transform: 'scale(0.95, 1.1)',
      transformOrigin: 'center center',
      whiteSpace: 'nowrap'
    }
  },
  {
    id: '09',
    name: 'Avant-Garde Liquid',
    mood: 'Soft geometric modern curves, smooth high-fashion branding',
    fontPair: 'Plus Jakarta Sans / Outfit',
    googleFontLink: 'Plus+Jakarta+Sans:wght@700&family=Outfit:wght@500',
    textContent: 'NEW LAUNCH',
    massiveStyle: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '6.0cqw',
      fontWeight: '700',
      lineHeight: '1.0',
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      transform: 'scale(0.95, 1.05)',
      transformOrigin: 'center center',
      whiteSpace: 'nowrap'
    }
  },
  {
    id: '10',
    name: 'Tokyo Cyber Glow',
    mood: 'Sleek luminescent future styling, floating volumetric glow',
    fontPair: 'Outfit',
    googleFontLink: 'Outfit:wght@100;200',
    textContent: 'NEW LAUNCH',
    massiveStyle: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '6.0cqw',
      fontWeight: '100',
      lineHeight: '1.0',
      letterSpacing: '0.3em',
      textShadow: '0 0 15px rgba(255, 255, 255, 0.65), 0 0 35px rgba(255, 255, 255, 0.25)',
      textTransform: 'uppercase',
      transform: 'scale(1.0, 1.1)',
      transformOrigin: 'center center',
      whiteSpace: 'nowrap'
    }
  }
];

export default function TypographyPlayground() {
  const [activeIdx, setActiveIdx] = useState(2);
  const [showPanel, setShowPanel] = useState(true);
  const [fontLinksLoaded, setFontLinksLoaded] = useState([]);

  const currentOption = TYPOGRAPHY_OPTIONS[activeIdx];

  // Dynamically load Google Fonts when switching options
  useEffect(() => {
    const fontId = `google-font-demo-${currentOption.id}`;
    if (!document.getElementById(fontId) && currentOption.googleFontLink) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${currentOption.googleFontLink}&display=swap`;
      document.head.appendChild(link);
      setFontLinksLoaded(prev => [...prev, fontId]);
    }
  }, [activeIdx]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>
      {/* Dynamic Google Fonts Preloading */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* ─── Premium Live 3D & Gallery Workspace Layer ─── */}
      <div style={{ width: '100%', height: '100%', zIndex: 1 }}>
        <DashboardHome customStyleConfig={currentOption} />
      </div>

      {/* ─── Floating Hide/Show & Nav Buttons ─── */}
      <div style={{ position: 'fixed', left: '24px', bottom: '24px', zIndex: 9999, display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setShowPanel(!showPanel)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(20px)',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {showPanel ? 'Hide Controls' : 'Show 10 Premium Fonts'}
        </button>

        <a
          href="/color-demos"
          style={{
            background: 'rgba(200, 169, 110, 0.9)',
            border: '1px solid rgba(200, 169, 110, 0.15)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(200, 169, 110, 0.25)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(200, 169, 110, 1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(200, 169, 110, 0.9)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Light-Theme Colors →
        </a>
      </div>

      {/* ─── Glassmorphic Style Switcher Control Panel ─── */}
      {showPanel && (
        <div
          style={{
            position: 'fixed',
            left: '24px',
            top: '24px',
            bottom: '90px',
            width: '380px',
            zIndex: 9998,
            background: 'rgba(10, 10, 10, 0.72)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '28px',
            color: '#FFFFFF',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            animation: 'fadeInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header Block */}
          <div style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: '#c8a96e', textTransform: 'uppercase', marginBottom: '4px' }}>
              KNIGHT WOLF BRAND
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Premium Typography
            </h2>
            <p style={{ fontSize: '11px', color: '#888888', margin: '6px 0 0 0', lineHeight: 1.4 }}>
              Click any premium style below to update the unified background headline in real-time.
            </p>
          </div>

          {/* List of Styles (Scrollable) */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingRight: '6px',
              marginBottom: '20px',
              scrollbarWidth: 'thin',
            }}
          >
            {TYPOGRAPHY_OPTIONS.map((opt, idx) => {
              const isActive = activeIdx === idx;
              return (
                <div
                  key={opt.id}
                  onClick={() => setActiveIdx(idx)}
                  style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isActive ? '1px solid #c8a96e' : '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                    }
                  }}
                >
                  {/* Badge ID */}
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: isActive ? '#c8a96e' : '#555555',
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {opt.id}
                  </div>

                  {/* Name and description */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: isActive ? 700 : 500, color: isActive ? '#FFFFFF' : '#cccccc' }}>
                      {opt.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#777777', marginTop: '2px', lineHeight: 1.3 }}>
                      {opt.mood}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Detail Footer */}
          <div
            style={{
              background: 'rgba(200, 169, 110, 0.05)',
              border: '1px dashed rgba(200, 169, 110, 0.25)',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#c8a96e', textTransform: 'uppercase', marginBottom: '6px' }}>
              Active Configuration
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>
              Fonts: <span style={{ fontFamily: "'Space Mono', monospace", color: '#cccccc', fontWeight: 400 }}>{currentOption.fontPair}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#888888', marginTop: '6px', lineHeight: 1.4 }}>
              Combined string `"NEW LAUNCH"` meticulously configured for perfect, horizontal edge containment inside safe boundaries.
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
