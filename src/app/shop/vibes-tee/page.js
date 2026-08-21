'use client'

import React, { useState } from 'react'
import { Search, User, ShoppingBag, Heart, Play, Maximize2, ShieldCheck, Truck, RotateCcw, CreditCard, ChevronDown, ChevronUp, Ruler, HelpCircle, Sparkles } from 'lucide-react'
import styles from './product.module.css'

export default function VibesTeePage() {
  const [type, setType] = useState('printed') // 'printed' | 'plain'
  const [color, setColor] = useState('white') // 'white' | 'black' | 'beige'
  const [size, setSize] = useState('M') // S, M, L, XL, XXL
  const [qty, setQty] = useState(1)
  const [cartCount, setCartCount] = useState(0)
  const [activeThumb, setActiveThumb] = useState('front') // front, back, closeup, detail, video
  const [expandedSection, setExpandedSection] = useState('details') // details, fit, fabric, wash, shipping

  // Dynamic price based on Type (Printed vs Plain)
  const price = type === 'printed' ? '₹899' : '₹699'

  // Image assets mapped to Color and Type selections
  const imageMap = {
    printed: {
      white: {
        front: '/box/PHOTO-2026-08-20-15-22-13.png',
        back: '/box/PHOTO-2026-08-20-15-06-28.png',
        closeup: '/box/PHOTO-2026-08-20-15-22-13.png',
        detail: '/box/PHOTO-2026-08-20-15-06-28.png',
      },
      black: {
        front: '/box/PHOTO-2026-08-20-13-10-10.png',
        back: '/box/PHOTO-2026-08-20-16-50-43.png',
        closeup: '/box/PHOTO-2026-08-20-13-10-10.png',
        detail: '/box/PHOTO-2026-08-20-16-50-43.png',
      },
      beige: {
        front: '/box/PHOTO-2026-08-20-13-10-29.png',
        back: '/box/PHOTO-2026-08-20-12-10-01.png',
        closeup: '/box/PHOTO-2026-08-20-13-10-29.png',
        detail: '/box/PHOTO-2026-08-20-12-10-01.png',
      }
    },
    plain: {
      white: {
        front: '/box/PHOTO-2026-08-19-16-16-49.png',
        back: '/box/PHOTO-2026-08-20-11-46-52.png',
        closeup: '/box/PHOTO-2026-08-19-16-16-49.png',
        detail: '/box/PHOTO-2026-08-20-11-46-52.png',
      },
      black: {
        front: '/box/PHOTO-2026-08-20-14-34-07.png',
        back: '/box/PHOTO-2026-08-20-16-50-43.png',
        closeup: '/box/PHOTO-2026-08-20-14-34-07.png',
        detail: '/box/PHOTO-2026-08-20-16-50-43.png',
      },
      beige: {
        front: '/box/PHOTO-2026-08-20-12-35-12.png',
        back: '/box/PHOTO-2026-08-19-17-28-29.png',
        closeup: '/box/PHOTO-2026-08-20-12-35-12.png',
        detail: '/box/PHOTO-2026-08-19-17-28-29.png',
      }
    }
  }

  const activeImages = imageMap[type][color]
  const currentMainImage = activeImages[activeThumb === 'video' ? 'front' : activeThumb]

  const toggleSection = (sectionName) => {
    setExpandedSection(prev => prev === sectionName ? null : sectionName)
  }

  const handleAddToCart = () => {
    setCartCount(c => c + qty)
  }

  return (
    <div className={styles.container}>
      {/* Gritty Streetwear tactile noise overlay */}
      <div className={styles.noiseOverlay} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoWrapper} onClick={() => window.location.href = '/'}>
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scale(1.2)' }}>
            <path d="M50 5L90 35L75 85L50 95L25 85L10 35L50 5Z" fill="#ff0000" opacity="0.15" />
            <path d="M50 12L85 38L72 80L50 88L28 80L15 38L50 12Z" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 25L70 45L50 75L30 45L50 25Z" fill="#ffffff" />
            <path d="M50 25L50 75" stroke="#ff0000" strokeWidth="2" />
          </svg>
          <span className={styles.logoText}>KNIGHTWOLF</span>
        </div>

        <nav className={styles.nav}>
          <a href="/" className={styles.navLink}>Home</a>
          <a href="/collections" className={`${styles.navLink} ${styles.navActive}`}>Collections</a>
          <a href="/collections#new-drop" className={styles.navLink}>New Drop</a>
          <a href="/collections#know-fit" className={styles.navLink}>About</a>
          <a href="/" className={styles.navLink}>Contact</a>
        </nav>

        <div className={styles.headerIcons}>
          <button className={styles.iconBtn} aria-label="Search">
            <Search size={18} />
          </button>
          <button className={styles.iconBtn} aria-label="Account">
            <User size={18} />
          </button>
          <button className={styles.iconBtn} aria-label="Cart" onClick={() => window.location.href = '/cart'}>
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#ff0000',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 900,
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </div>
          </button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <a href="/" className={styles.breadcrumbLink}>Home</a>
        <span className={styles.breadcrumbSeparator}>&rsaquo;</span>
        <a href="/collections" className={styles.breadcrumbLink}>Collections</a>
        <span className={styles.breadcrumbSeparator}>&rsaquo;</span>
        <span className={styles.breadcrumbLink}>T-Shirts</span>
        <span className={styles.breadcrumbSeparator}>&rsaquo;</span>
        <span className={styles.breadcrumbActive}>Vibes Tee</span>
      </div>

      {/* Main product display grid */}
      <main className={styles.productGrid}>
        
        {/* Left Side: Dynamic Gallery Column */}
        <section className={styles.galleryWrapper}>
          <div className={styles.thumbnailList}>
            {/* Front Thumb */}
            <div 
              className={`${styles.thumbItem} ${activeThumb === 'front' ? styles.thumbItemActive : ''}`}
              onClick={() => setActiveThumb('front')}
            >
              <img src={activeImages.front} alt="Vibes Tee Front view" className={styles.thumbImg} />
            </div>

            {/* Back Thumb */}
            <div 
              className={`${styles.thumbItem} ${activeThumb === 'back' ? styles.thumbItemActive : ''}`}
              onClick={() => setActiveThumb('back')}
            >
              <img src={activeImages.back} alt="Vibes Tee Back view" className={styles.thumbImg} />
            </div>

            {/* Print Closeup Thumb */}
            <div 
              className={`${styles.thumbItem} ${activeThumb === 'closeup' ? styles.thumbItemActive : ''}`}
              onClick={() => setActiveThumb('closeup')}
            >
              <img src={activeImages.closeup} alt="Vibes Tee Print close-up" className={styles.thumbImg} />
            </div>

            {/* Fabric Detail Thumb */}
            <div 
              className={`${styles.thumbItem} ${activeThumb === 'detail' ? styles.thumbItemActive : ''}`}
              onClick={() => setActiveThumb('detail')}
            >
              <img src={activeImages.detail} alt="Vibes Tee Fabric detail" className={styles.thumbImg} />
            </div>

            {/* Video Thumb */}
            <div 
              className={`${styles.thumbItem} ${activeThumb === 'video' ? styles.thumbItemActive : ''}`}
              onClick={() => setActiveThumb('video')}
            >
              <img src={activeImages.front} alt="Vibes Tee video indicator" className={styles.thumbImg} />
              <div className={styles.videoThumbIcon}>
                <Play size={18} fill="#ffffff" />
              </div>
            </div>
          </div>

          <div className={styles.mainImageArea}>
            <button className={styles.zoomBtn} aria-label="Fullscreen view">
              <Maximize2 size={16} />
            </button>
            <img 
              src={currentMainImage} 
              alt="Vibes Tee main preview model" 
              className={styles.mainImg}
            />
          </div>
        </section>

        {/* Right Side: Details pane */}
        <section className={styles.detailsPane}>
          <div className={styles.metaHeader}>
            <span className={styles.badgeNew}>NEW ARRIVAL</span>
            <h1 className={styles.productName}>VIBES TEE</h1>
            <span className={styles.fitSub}>DROP SHOULDER</span>
          </div>

          <span className={styles.price}>{price}</span>
          
          <p className={styles.desc}>
            Premium heavy-weight cotton. Oversized fit. Built for comfort. Made to stand out.
          </p>

          {/* Segmented Type Toggle */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>CHOOSE TYPE</span>
            <div className={styles.toggleRow}>
              <div className={styles.segmentedControl}>
                <button 
                  className={`${styles.segmentBtn} ${type === 'printed' ? styles.segmentBtnActive : ''}`}
                  onClick={() => {
                    setType('printed');
                    setActiveThumb('front');
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.86 13a2 2 0 0 0 2 1.87h13.72a2 2 0 0 0 2-1.87l.86-13a2 2 0 0 0-1.34-2.23z" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                  PRINTED
                </button>
                <button 
                  className={`${styles.segmentBtn} ${type === 'plain' ? styles.segmentBtnActive : ''}`}
                  onClick={() => {
                    setType('plain');
                    setActiveThumb('front');
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.86 13a2 2 0 0 0 2 1.87h13.72a2 2 0 0 0 2-1.87l.86-13a2 2 0 0 0-1.34-2.23z" />
                  </svg>
                  PLAIN
                </button>
              </div>

              <div className={styles.helperBox}>
                <HelpCircle className={styles.helperIcon} size={14} />
                <div className={styles.helperText}>
                  <span className={styles.helperTitle}>Not sure?</span>
                  <span>Printed for bold looks. Plain for minimal style.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Size Select */}
          <div className={styles.sectionBlock}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span className={styles.sectionLabel}>SIZE</span>
              <a href="#size-guide" className={styles.sizeGuideLink}>
                <Ruler size={12} />
                SIZE GUIDE
              </a>
            </div>
            <div className={styles.sizeRow}>
              {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                <button 
                  key={sz} 
                  className={`${styles.sizeBtn} ${size === sz ? styles.sizeBtnActive : ''}`}
                  onClick={() => setSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Select */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>COLOR</span>
            <div className={styles.colorRow}>
              {/* White */}
              <button 
                className={`${styles.colorBtn} ${color === 'white' ? styles.colorBtnActive : ''}`}
                onClick={() => setColor('white')}
                aria-label="Select White color"
              >
                <div className={styles.colorDot} style={{ backgroundColor: '#ffffff' }} />
              </button>

              {/* Black */}
              <button 
                className={`${styles.colorBtn} ${color === 'black' ? styles.colorBtnActive : ''}`}
                onClick={() => setColor('black')}
                aria-label="Select Black color"
              >
                <div className={styles.colorDot} style={{ backgroundColor: '#111111' }} />
              </button>

              {/* Beige */}
              <button 
                className={`${styles.colorBtn} ${color === 'beige' ? styles.colorBtnActive : ''}`}
                onClick={() => setColor('beige')}
                aria-label="Select Beige color"
              >
                <div className={styles.colorDot} style={{ backgroundColor: '#dccab3' }} />
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>QUANTITY</span>
            <div className={styles.qtySelect}>
              <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>&minus;</button>
              <span className={styles.qtyVal}>{qty}</span>
              <button className={styles.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>

          {/* Add / Buy Buttons */}
          <div className={styles.purchaseRow}>
            <button className={styles.btnAddToCart} onClick={handleAddToCart}>
              <ShoppingBag size={16} />
              ADD TO CART
            </button>
            <button className={styles.btnBuyNow} onClick={() => window.location.href = '/checkout'}>
              <Sparkles size={16} />
              BUY NOW
            </button>
          </div>

          {/* Outline Design It Trigger */}
          <button 
            className={styles.btnDesignIt}
            onClick={() => window.location.href = '/customize/configurator.html'}
          >
            <span className={styles.designItLabel}>
              ✎ DESIGN IT
            </span>
            <span className={styles.designItSub}>
              CUSTOMIZE YOUR OWN DESIGN
            </span>
          </button>

          {/* Trust strip */}
          <div className={styles.trustStrip}>
            <div className={styles.trustItem}>
              <Truck className={styles.trustIcon} size={18} />
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>FREE SHIPPING</span>
                <span className={styles.trustDesc}>On orders above ₹999</span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <RotateCcw className={styles.trustIcon} size={18} />
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>EASY RETURNS</span>
                <span className={styles.trustDesc}>14 days return policy</span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <ShieldCheck className={styles.trustIcon} size={18} />
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>SECURE PAYMENT</span>
                <span className={styles.trustDesc}>100% secure checkout</span>
              </div>
            </div>
          </div>

          {/* Accordion Panels */}
          <div className={styles.accordionList}>
            {/* Panel 1 */}
            <div className={styles.accordionItem}>
              <button className={styles.accordionTrigger} onClick={() => toggleSection('details')}>
                <span>PRODUCT DETAILS</span>
                {expandedSection === 'details' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {expandedSection === 'details' && (
                <div className={styles.accordionContent}>
                  <span>- Heavyweight loopback cotton jersey (280 GSM)</span>
                  <span>- Drop shoulder streetwear silhouette</span>
                  <span>- Ribbed crewneck collar</span>
                  <span>- Screen printed front and back graphics</span>
                </div>
              )}
            </div>

            {/* Panel 2 */}
            <div className={styles.accordionItem}>
              <button className={styles.accordionTrigger} onClick={() => toggleSection('fit')}>
                <span>FIT & SIZE</span>
                {expandedSection === 'fit' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {expandedSection === 'fit' && (
                <div className={styles.accordionContent}>
                  <span>- Oversized fit with a boxy, relaxed feel.</span>
                  <span>- Model is 6'1" wearing size L for a relaxed fit.</span>
                  <span>- We recommend ordering your normal size.</span>
                </div>
              )}
            </div>

            {/* Panel 3 */}
            <div className={styles.accordionItem}>
              <button className={styles.accordionTrigger} onClick={() => toggleSection('fabric')}>
                <span>FABRIC</span>
                {expandedSection === 'fabric' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {expandedSection === 'fabric' && (
                <div className={styles.accordionContent}>
                  <span>- 100% Organic Cotton</span>
                  <span>- Super soft hand-feel combing</span>
                  <span>- Pre-shrunk to retain shape</span>
                </div>
              )}
            </div>

            {/* Panel 4 */}
            <div className={styles.accordionItem}>
              <button className={styles.accordionTrigger} onClick={() => toggleSection('wash')}>
                <span>WASH CARE</span>
                {expandedSection === 'wash' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {expandedSection === 'wash' && (
                <div className={styles.accordionContent}>
                  <span>- Machine wash cold, inside out with similar colors</span>
                  <span>- Hang dry or tumble dry low</span>
                  <span>- Do not iron prints directly</span>
                </div>
              )}
            </div>

            {/* Panel 5 */}
            <div className={styles.accordionItem}>
              <button className={styles.accordionTrigger} onClick={() => toggleSection('shipping')}>
                <span>SHIPPING & RETURNS</span>
                {expandedSection === 'shipping' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {expandedSection === 'shipping' && (
                <div className={styles.accordionContent}>
                  <span>- Dispatch within 24-48 hours.</span>
                  <span>- Free deliveries take 3-5 business days.</span>
                  <span>- Easy 14 days returns and refunds policy.</span>
                </div>
              )}
            </div>
          </div>

        </section>
      </main>
    </div>
  )
}
