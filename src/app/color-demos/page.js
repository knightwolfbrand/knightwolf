'use client'

import React, { useState, useEffect } from 'react'
import DashboardHome from '@/components/home/DashboardHome'

// Curated palette of 15 premium color variations specifically tailored for light themes
const LIGHT_THEME_COLORS = [
  {
    id: '01',
    name: 'Chalk White',
    mood: 'Crisp, minimalist, absolute purity streetwear staple',
    hex: '#FFFFFF',
    desc: 'The pristine baseline of high-fashion capsule collections.'
  },
  {
    id: '02',
    name: 'Off-White / Ecru',
    mood: 'Warm organic linen, refined raw cotton aesthetic',
    hex: '#F7F5F0',
    desc: 'Soft, creamy off-white with an authentic heritage fabric feel.'
  },
  {
    id: '03',
    name: 'Editorial Beige',
    mood: 'Sandy luxury linen, warm refined neutral staple',
    hex: '#D5C29D',
    desc: 'An elegant sand-toned neutral that feels organic, airy, and high-fashion.'
  },
  {
    id: '04',
    name: 'Burnt Orange',
    mood: 'Warm terracotta sunset, high-fashion vintage accent',
    hex: '#E05A2B',
    desc: 'A premium, highly saturated yet warm terracotta orange that adds beautiful warmth.'
  },
  {
    id: '05',
    name: 'Crimson Red',
    mood: 'Vibrant luxury scarlet, energetic high-fashion standout',
    hex: '#D32F2F',
    desc: 'A bold, premium crimson red designed to command attention on the street.'
  },
  {
    id: '06',
    name: 'Cherry Red',
    mood: 'Deep, luscious black-cherry wine tone',
    hex: '#990033',
    desc: 'A rich, decadent cherry red with deep jewel-tone undertones.'
  },
  {
    id: '07',
    name: 'Bordeaux Maroon',
    mood: 'Opulent deep burgundy wine, strong sophisticated depth',
    hex: '#5C061C',
    desc: 'A luxurious dark maroon wine shade that projects premium craftsmanship.'
  },
  {
    id: '08',
    name: 'Espresso Brown',
    mood: 'Rich dark chocolate, premium roasted-bean warmth',
    hex: '#4E3629',
    desc: 'A deep, rich espresso brown offering intense contrast and vintage appeal.'
  },
  {
    id: '09',
    name: 'Oatmeal Melange',
    mood: 'Textured heather grain, cozy Nordic styling',
    hex: '#E5DFD3',
    desc: 'A premium dusty heather-beige inspired by natural oat crops.'
  },
  {
    id: '10',
    name: 'Pitch Black',
    mood: 'The deepest, absolute light-absorbing streetwear noir',
    hex: '#050505',
    desc: 'The ultimate, ultra-saturated solid black offering absolute contrast.'
  },
  {
    id: '11',
    name: 'Obsidian Noir',
    mood: 'Volcanic crystal black, clean high-fashion depth',
    hex: '#121212',
    desc: 'A rich crystalline black that remains deep, crisp, and stark.'
  },
  {
    id: '12',
    name: 'Washed Carbon',
    mood: 'Deep mineral charcoal, raw basalt rock aesthetic',
    hex: '#1C1C1C',
    desc: 'A heavy, raw graphite tone ideal for architectural streetwear silhouettes.'
  },
  {
    id: '13',
    name: 'Faded Off-Black',
    mood: 'Vintage streetwear favorite, washed heavy cotton',
    hex: '#282828',
    desc: 'A retro, slightly desaturated black capturing the organic feel of aged heavy canvas.'
  },
  {
    id: '14',
    name: 'Graphite Core',
    mood: 'Crisp architectural graphite, sleek modern neutral',
    hex: '#383838',
    desc: 'A refined technical grey-black that bridges solid noir and industrial grey.'
  },
  {
    id: '15',
    name: 'Midnight Navy',
    mood: 'Deep starlit sky, strong contrasting silhouette',
    hex: '#2A323D',
    desc: 'A highly saturated dark navy that acts as the ultimate contrasting anchor.'
  }
];

export default function ColorPlayground() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showPanel, setShowPanel] = useState(true);

  const currentColor = LIGHT_THEME_COLORS[activeIdx];

  // Unified Minimalist Neo-Grotesque Bold Typography Config (Montserrat) + shirtColor injection
  const customConfig = {
    textContent: 'LAUNCH',
    shirtColor: currentColor.hex,
    containerStyle: {
      transform: 'translateY(-8%)'
    },
    massiveStyle: {
      fontFamily: "'Condenso Demo', sans-serif",
      fontSize: 'min(47.0cqw, 49.0cqh)',
      fontWeight: 'normal',
      lineHeight: '0.9',
      letterSpacing: '0.08em',
      transform: 'scale(1.0, 1.4)',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#ffffff' }}>
      {/* Dynamic Google Fonts Preloading for Cinzel & Montserrat */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@300&family=Montserrat:wght@300&family=Space+Mono:wght@400;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* ─── Premium Live 3D & Gallery Workspace Layer (Forced Light Theme) ─── */}
      <div style={{ width: '100%', height: '100%', zIndex: 1 }}>
        <DashboardHome customStyleConfig={customConfig} forceTheme={false} />
      </div>

      {/* ─── Floating Switch Demos Button ─── */}
      <div style={{ position: 'fixed', left: '24px', bottom: '24px', zIndex: 9999, display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setShowPanel(!showPanel)}
          style={{
            background: 'rgba(26, 26, 26, 0.88)',
            border: '1px solid rgba(26, 26, 26, 0.1)',
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
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(26, 26, 26, 1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(26, 26, 26, 0.88)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {showPanel ? 'Hide Controls' : 'Show Colors'}
        </button>

        <a
          href="/splash-demos"
          style={{
            background: 'rgba(200, 169, 110, 0.9)',
            border: '1px solid rgba(200, 169, 110, 0.1)',
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
          Typography Demos →
        </a>
      </div>

      {/* ─── Glassmorphic Style Switcher Control Panel (Tailored for Light Theme UI) ─── */}
      {showPanel && (
        <div
          style={{
            position: 'fixed',
            left: '24px',
            top: '24px',
            bottom: '90px',
            width: '380px',
            zIndex: 9998,
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '16px',
            padding: '28px',
            color: '#1a1a1a',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.12)',
            animation: 'fadeInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header Block */}
          <div style={{ marginBottom: '24px', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: '#c8a96e', textTransform: 'uppercase', marginBottom: '4px' }}>
              KNIGHT WOLF BRAND
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#1a1a1a' }}>
              Light Theme Colors
            </h2>
            <p style={{ fontSize: '11px', color: '#666666', margin: '6px 0 0 0', lineHeight: 1.4 }}>
              Click any color card below to update the live 3D T-shirt color within our light theme setup.
            </p>
          </div>

          {/* List of Colors (Scrollable) */}
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
            {LIGHT_THEME_COLORS.map((col, idx) => {
              const isActive = activeIdx === idx;
              return (
                <div
                  key={col.id}
                  onClick={() => setActiveIdx(idx)}
                  style={{
                    background: isActive ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.01)',
                    border: isActive ? '1px solid #c8a96e' : '1px solid rgba(0, 0, 0, 0.05)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.01)';
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                    }
                  }}
                >
                  {/* Swatch Preview */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: col.hex,
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                      flexShrink: 0,
                    }}
                  />

                  {/* Name and description */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: isActive ? 700 : 500, color: '#1a1a1a' }}>
                      {col.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666666', marginTop: '2px', lineHeight: 1.3 }}>
                      {col.mood}
                    </div>
                  </div>

                  {/* Hex Tag */}
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '9px',
                      color: isActive ? '#c8a96e' : '#888888',
                      fontWeight: 600,
                    }}
                  >
                    {col.hex}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Detail Footer */}
          <div
            style={{
              background: 'rgba(200, 169, 110, 0.06)',
              border: '1px dashed rgba(200, 169, 110, 0.3)',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#c8a96e', textTransform: 'uppercase', marginBottom: '6px' }}>
              Active Fabric Swatch
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>
              Color: <span style={{ color: '#c8a96e' }}>{currentColor.name} ({currentColor.hex})</span>
            </div>
            <div style={{ fontSize: '11px', color: '#666666', marginTop: '6px', lineHeight: 1.4 }}>
              {currentColor.desc}
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
  );
}
