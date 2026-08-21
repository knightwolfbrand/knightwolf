'use client'

import React, { useState } from 'react'
import { Search, User, ShoppingBag, Heart, X, Sparkles, HelpCircle, ShieldCheck, Truck, RotateCcw, CreditCard, ChevronRight, ShoppingCart } from 'lucide-react'
import styles from './collections.module.css'

function AutoCarousel({ images, activeIndex, setActiveIndex, showCreateBtn = false, buttonSlideIndex = 2 }) {
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  React.useEffect(() => {
    if (isPaused || isDragging) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused, isDragging, images.length, setActiveIndex]);

  const handleStart = (clientX) => {
    setStartX(clientX);
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setCurrentTranslate(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (currentTranslate < -50) {
      setActiveIndex((prev) => (prev + 1) % images.length);
    } else if (currentTranslate > 50) {
      setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    }
    setCurrentTranslate(0);
    // Resume auto-slide after a brief delay
    setTimeout(() => {
      setIsPaused(false);
    }, 2000);
  };

  return (
    <div 
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 1
      }}
    >
      <div 
        style={{
          display: 'flex',
          width: `${images.length * 100}%`,
          height: '100%',
          transform: `translateX(calc(-${activeIndex * (100 / images.length)}% + ${currentTranslate}px))`,
          transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {images.map((src, idx) => (
          <div key={idx} style={{ width: `${100 / images.length}%`, height: '100%', position: 'relative' }}>
            <img 
              src={src} 
              alt={`Slide ${idx}`} 
              className={styles.panelImageBg}
              style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
            />
            {showCreateBtn && idx === buttonSlideIndex && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/customize/configurator.html';
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#ff0000',
                  color: '#ffffff',
                  border: 'none',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '10px 20px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  zIndex: 200,
                  boxShadow: '0 0 15px rgba(255,0,0,0.6)'
                }}
              >
                Create Your Design
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Carousel dots indicators */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '6px',
        zIndex: 5
      }}>
        {images.map((_, idx) => (
          <div 
            key={idx}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: idx === activeIndex ? '#ff0000' : 'rgba(255,255,255,0.4)',
              transition: 'background-color 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function SingleScreenCollections() {
  const [activeCol, setActiveCol] = useState(1) // Default expanded column (Regular Fit)
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [wishlist, setWishlist] = useState({})
  
  // Carousel indices
  const [regSlideIndex, setRegSlideIndex] = useState(0)
  const [dropSlideIndex, setDropSlideIndex] = useState(0)
  const [poloSlideIndex, setPoloSlideIndex] = useState(0)

  const regSlides = [
    '/box/PHOTO-2026-08-19-16-16-49.png',
    '/box/PHOTO-2026-08-20-11-46-52.png',
    '/box/PHOTO-2026-08-20-12-35-12.png',
    '/box/PHOTO-2026-08-19-17-28-29.png'
  ]

  const dropSlides = [
    '/box/PHOTO-2026-08-20-13-10-10.png',
    '/box/PHOTO-2026-08-20-15-22-13.png',
    '/box/PHOTO-2026-08-20-14-34-07.png',
    '/box/PHOTO-2026-08-20-16-50-43.png'
  ]

  const poloSlides = [
    '/box/PHOTO-2026-08-20-13-10-29.png',
    '/box/PHOTO-2026-08-20-12-10-01.png',
    '/box/PHOTO-2026-08-20-15-06-28.png',
    '/box/PHOTO-2026-08-20-11-53-36.png'
  ]
  
  // Modal state for same-page View All list
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')

  // Column specific choices: selected product, color, size, type (printed vs plain), quantity
  const [colSelections, setColSelections] = useState({
    1: { prodId: 'reg-1', color: 'white', size: 'M', type: 'printed', qty: 1 },
    2: { prodId: 'drop-1', color: 'white', size: 'M', type: 'printed', qty: 1 },
    3: { prodId: 'polo-1', color: 'black', size: 'M', type: 'plain', qty: 1 }
  })

  // Product Database
  const products = {
    // 01 Regular Fit
    1: [
      { id: 'reg-1', name: 'VIBES TEE', price: 799, plainPrice: 599, img: '/box/PHOTO-2026-08-19-16-16-49.png' },
      { id: 'reg-2', name: 'SPIDER TEE', price: 799, plainPrice: 599, img: '/box/PHOTO-2026-08-20-11-46-52.png' },
      { id: 'reg-3', name: 'LOYALTY TEE', price: 799, plainPrice: 599, img: '/box/PHOTO-2026-08-20-12-35-12.png' },
      { id: 'reg-4', name: 'WOLF TEE', price: 899, plainPrice: 699, img: '/box/PHOTO-2026-08-19-17-28-29.png' }
    ],
    // 02 Drop Shoulder
    2: [
      { id: 'drop-1', name: 'VIBES TEE', price: 899, plainPrice: 699, img: '/box/PHOTO-2026-08-20-15-22-13.png' },
      { id: 'drop-2', name: 'CHAOS TEE', price: 899, plainPrice: 699, img: '/box/PHOTO-2026-08-20-13-10-10.png' },
      { id: 'drop-3', name: 'NIGHTSHIFT TEE', price: 899, plainPrice: 699, img: '/box/PHOTO-2026-08-20-14-34-07.png' },
      { id: 'drop-4', name: 'FEARLESS TEE', price: 899, plainPrice: 699, img: '/box/PHOTO-2026-08-20-16-50-43.png' }
    ],
    // 03 Polo T-Shirts
    3: [
      { id: 'polo-1', name: 'WOLF POLO', price: 999, plainPrice: 799, img: '/box/PHOTO-2026-08-20-13-10-29.png' },
      { id: 'polo-2', name: 'CLASSIC POLO', price: 999, plainPrice: 799, img: '/box/PHOTO-2026-08-20-12-10-01.png' },
      { id: 'polo-3', name: 'ELITE POLO', price: 999, plainPrice: 799, img: '/box/PHOTO-2026-08-20-15-06-28.png' },
      { id: 'polo-4', name: 'URBAN POLO', price: 999, plainPrice: 799, img: '/box/PHOTO-2026-08-20-11-53-36.png' }
    ]
  }

  // Update selection properties in the active column state
  const updateSelection = (colIndex, key, value) => {
    setColSelections(prev => ({
      ...prev,
      [colIndex]: {
        ...prev[colIndex],
        [key]: value
      }
    }))
  }

  // Add active item to cart drawer
  const addToCart = (colIndex) => {
    const selection = colSelections[colIndex]
    const list = products[colIndex]
    const product = list.find(p => p.id === selection.prodId)
    if (!product) return

    const itemPrice = selection.type === 'plain' ? product.plainPrice : product.price
    const newItem = {
      cartId: `${product.id}-${selection.color}-${selection.size}-${selection.type}-${Date.now()}`,
      id: product.id,
      name: product.name,
      fit: colIndex === 1 ? 'Regular Fit' : colIndex === 2 ? 'Drop Shoulder' : 'Polo Fit',
      price: itemPrice,
      color: selection.color,
      size: selection.size,
      type: selection.type,
      qty: selection.qty,
      img: product.img
    }

    setCart(prev => [...prev, newItem])
    setIsCartOpen(true)
  }

  const removeCartItem = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId))
  }

  const toggleWishlist = (id, e) => {
    e.stopPropagation()
    setWishlist(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const openViewAllModal = (colTitle) => {
    setModalTitle(colTitle)
    setIsModalOpen(true)
  }

  // Calculate cart stats
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)
  const baseSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)

  // Smart tiered discount triggers
  let discountPercentage = 0
  if (totalItems === 2) discountPercentage = 0.10
  else if (totalItems >= 3) discountPercentage = 0.15

  const discountAmount = Math.round(baseSubtotal * discountPercentage)
  const finalTotal = baseSubtotal - discountAmount

  // Smart bottom bar text prompts
  let offerFeedback = "ADD A T-SHIRT TO START SAVING"
  if (totalItems === 1) {
    offerFeedback = "ADD 1 MORE TO UNLOCK 10% OFF"
  } else if (totalItems === 2) {
    offerFeedback = "10% OFF UNLOCKED ✓ ADD 1 MORE TO UNLOCK 15% OFF"
  } else if (totalItems >= 3) {
    offerFeedback = "15% OFF UNLOCKED 🔥"
  }

  return (
    <div className={styles.container}>
      {/* Gritty Streetwear noise filter backdrop */}
      <div className={styles.noiseOverlay} />

      {/* Navigation Header */}
      <header className={styles.header}>
        <div className={styles.logoWrapper} onClick={() => window.location.href = '/'}>
          <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5L90 35L75 85L50 95L25 85L10 35L50 5Z" fill="#ff0000" opacity="0.15" />
            <path d="M50 12L85 38L72 80L50 88L28 80L15 38L50 12Z" stroke="#ffffff" strokeWidth="4" />
            <path d="M50 25L70 45L50 75L30 45L50 25Z" fill="#ffffff" />
            <path d="M50 25L50 75" stroke="#ff0000" strokeWidth="2.5" />
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
            <Search size={16} />
          </button>
          <button className={styles.iconBtn} aria-label="Account">
            <User size={16} />
          </button>
          <button className={styles.iconBtn} aria-label="Cart" onClick={() => setIsCartOpen(true)}>
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={16} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-7px',
                  right: '-7px',
                  background: '#ff0000',
                  color: '#ffffff',
                  fontSize: '8px',
                  fontWeight: 900,
                  width: '13px',
                  height: '13px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {totalItems}
                </span>
              )}
            </div>
          </button>
        </div>
      </header>

      {/* Three Panel Grid columns layout */}
      <main className={styles.panelsGrid}>
        
        {/* PANEL 01 - REGULAR FIT */}
        <section className={`${styles.panel} ${styles.panel01} ${activeCol === 1 ? styles.panelActive : ''}`}>
          <div className={`${styles.heroWrapper} ${activeCol === 1 ? styles.heroWrapperShrunk : ''}`}>
            <AutoCarousel images={regSlides} activeIndex={regSlideIndex} setActiveIndex={setRegSlideIndex} showCreateBtn={true} buttonSlideIndex={1} />
            <div className={styles.panelOverlay} />
            
            <div className={styles.heroContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div>
                  <h2 className={styles.fitTitle}>REGULAR FIT</h2>
                </div>
                {activeCol === 1 && (
                  <button 
                    className={styles.closeColBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCol(null);
                    }}
                  >
                    <X size={12} /> CLOSE
                  </button>
                )}
              </div>
            </div>
            
            <div className={styles.heroBottom}>
              {activeCol !== 1 && (
                <>
                  <p className={styles.fitDesc}>Clean silhouette. Everyday comfort. Always on point.</p>
                  <button className={styles.exploreBtn} onClick={() => setActiveCol(1)}>
                    SHOP NOW &rarr;
                  </button>
                </>
              )}
            </div>
          </div>

          {activeCol === 1 && (
            <div className={styles.shopArea}>
              <div className={styles.shopHeader}>
                <h3 className={styles.shopTitle}>REGULAR FIT COLLECTION</h3>
              </div>

              {/* Selectors row */}
              <div className={styles.selectorsRow}>
                {/* Print toggle */}
                <div className={styles.selectorBlock}>
                  <span className={styles.selectorLabel}>PRINT TYPE</span>
                  <div className={styles.printControl}>
                    <button 
                      className={`${styles.printBtn} ${colSelections[1].type === 'plain' ? styles.printBtnActive : ''}`}
                      onClick={() => updateSelection(1, 'type', 'plain')}
                    >
                      PLAIN
                    </button>
                    <button 
                      className={styles.designYoursBtn}
                      onClick={() => window.location.href = '/customize/configurator.html'}
                    >
                      DESIGN YOURS &rarr;
                    </button>
                  </div>
                </div>

                {/* Color swatch */}
                <div className={styles.selectorBlock}>
                  <span className={styles.selectorLabel}>Color</span>
                  <div className={styles.swatchRow}>
                    {['white', 'black', 'beige', 'olive', 'charcoal'].map(cl => (
                      <div 
                        key={cl}
                        className={`${styles.swatch} ${colSelections[1].color === cl ? styles.swatchActive : ''}`}
                        onClick={() => updateSelection(1, 'color', cl)}
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <div 
                          className={styles.swatchDot} 
                          style={{
                            backgroundColor: cl === 'white' ? '#ffffff' : cl === 'black' ? '#111111' : cl === 'beige' ? '#d9c7b0' : cl === 'olive' ? '#4d5c41' : '#2f3538'
                          }} 
                        />
                        {colSelections[1].color === cl && (
                          <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#ffffff',
                            borderRadius: '50%',
                            position: 'absolute',
                            zIndex: 10,
                            boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size select */}
                <div className={styles.selectorBlock}>
                  <span className={styles.selectorLabel}>Size</span>
                  <div className={styles.sizeRow}>
                    {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                      <button 
                        key={sz}
                        className={`${styles.sizeBtn} ${colSelections[1].size === sz ? styles.sizeBtnActive : ''}`}
                        onClick={() => updateSelection(1, 'size', sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini Product Cards */}
              <div className={styles.miniGrid}>
                {products[1].map(prod => {
                  const cardPrice = colSelections[1].type === 'plain' ? prod.plainPrice : prod.price
                  return (
                    <div 
                      key={prod.id}
                      className={`${styles.miniCard} ${colSelections[1].prodId === prod.id ? styles.miniCardActive : ''}`}
                      onClick={() => updateSelection(1, 'prodId', prod.id)}
                    >
                      <button 
                        className={`${styles.miniWishlist} ${wishlist[prod.id] ? styles.miniWishlistActive : ''}`}
                        onClick={(e) => toggleWishlist(prod.id, e)}
                      >
                        <Heart size={10} fill={wishlist[prod.id] ? '#ff0000' : 'none'} />
                      </button>
                      <div className={styles.miniImgWrapper}>
                        <img src={prod.img} alt={prod.name} className={styles.miniImg} />
                      </div>
                      <h4 className={styles.miniTitle}>{prod.name}</h4>
                      <span className={styles.miniPrice}>₹{cardPrice}</span>
                    </div>
                  )
                })}
              </div>

              {/* Add to Cart Actions */}
              <div className={styles.bottomActionRow}>
                <div className={styles.qtyBox}>
                  <button className={styles.qtyBtn} onClick={() => updateSelection(1, 'qty', Math.max(1, colSelections[1].qty - 1))}>&minus;</button>
                  <span className={styles.qtyVal}>{colSelections[1].qty}</span>
                  <button className={styles.qtyBtn} onClick={() => updateSelection(1, 'qty', colSelections[1].qty + 1)}>+</button>
                </div>

                <button className={styles.addBtn} onClick={() => addToCart(1)}>
                  Add to Cart &mdash; ₹{(colSelections[1].type === 'plain' ? products[1].find(p => p.id === colSelections[1].prodId).plainPrice : products[1].find(p => p.id === colSelections[1].prodId).price) * colSelections[1].qty}
                </button>

                <button 
                  className={`${styles.wishlistActionBtn} ${wishlist[colSelections[1].prodId] ? styles.wishlistActionBtnActive : ''}`}
                  onClick={(e) => toggleWishlist(colSelections[1].prodId, e)}
                >
                  <Heart size={16} fill={wishlist[colSelections[1].prodId] ? '#ff0000' : 'none'} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* PANEL 02 - DROP SHOULDER / OVERSIZED */}
        <section className={`${styles.panel} ${styles.panel02} ${activeCol === 2 ? styles.panelActive : ''}`}>
          <div className={`${styles.heroWrapper} ${activeCol === 2 ? styles.heroWrapperShrunk : ''}`}>
            <AutoCarousel images={dropSlides} activeIndex={dropSlideIndex} setActiveIndex={setDropSlideIndex} showCreateBtn={true} buttonSlideIndex={2} />
            <div className={styles.panelOverlay} />
            
            <div className={styles.heroContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div>
                  <h2 className={styles.fitTitle}>DROP SHOULDER</h2>
                  <div className={styles.fitSub}>/ OVERSIZED</div>
                </div>
                {activeCol === 2 && (
                  <button 
                    className={styles.closeColBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCol(null);
                    }}
                    style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#ffffff' }}
                  >
                    <X size={12} /> CLOSE
                  </button>
                )}
              </div>
            </div>
            
            <div className={styles.heroBottom}>
              {activeCol !== 2 && (
                <>
                  <p className={styles.fitDesc}>Relaxed fit. Street ready. Make a statement.</p>
                  <button className={styles.exploreBtn} onClick={() => setActiveCol(2)}>
                    SHOP NOW &rarr;
                  </button>
                </>
              )}
            </div>
          </div>

          {activeCol === 2 && (
            <div className={styles.shopArea}>
              <div className={styles.shopHeader}>
                <h3 className={styles.shopTitle}>DROP SHOULDER COLLECTION</h3>
              </div>

              {/* Selectors row */}
              <div className={styles.selectorsRow}>
                {/* Print toggle */}
                <div className={styles.selectorBlock}>
                  <span className={styles.selectorLabel}>PRINT TYPE</span>
                  <div className={styles.printControl}>
                    <button 
                      className={`${styles.printBtn} ${colSelections[2].type === 'plain' ? styles.printBtnActive : ''}`}
                      onClick={() => updateSelection(2, 'type', 'plain')}
                    >
                      PLAIN
                    </button>
                    <button 
                      className={styles.designYoursBtn}
                      onClick={() => window.location.href = '/customize/configurator.html'}
                    >
                      DESIGN YOURS &rarr;
                    </button>
                  </div>
                </div>

                {/* Color swatch */}
                <div className={styles.selectorBlock}>
                  <span className={styles.selectorLabel}>Color</span>
                  <div className={styles.swatchRow}>
                    {['white', 'black', 'beige', 'olive', 'charcoal'].map(cl => (
                      <div 
                        key={cl}
                        className={`${styles.swatch} ${colSelections[2].color === cl ? styles.swatchActive : ''}`}
                        onClick={() => updateSelection(2, 'color', cl)}
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <div 
                          className={styles.swatchDot} 
                          style={{
                            backgroundColor: cl === 'white' ? '#ffffff' : cl === 'black' ? '#111111' : cl === 'beige' ? '#d9c7b0' : cl === 'olive' ? '#4d5c41' : '#2f3538'
                          }} 
                        />
                        {colSelections[2].color === cl && (
                          <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#ffffff',
                            borderRadius: '50%',
                            position: 'absolute',
                            zIndex: 10,
                            boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size select */}
                <div className={styles.selectorBlock}>
                  <span className={styles.selectorLabel}>Size</span>
                  <div className={styles.sizeRow}>
                    {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                      <button 
                        key={sz}
                        className={`${styles.sizeBtn} ${colSelections[2].size === sz ? styles.sizeBtnActive : ''}`}
                        onClick={() => updateSelection(2, 'size', sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini Product Cards */}
              <div className={styles.miniGrid}>
                {products[2].map(prod => {
                  const cardPrice = colSelections[2].type === 'plain' ? prod.plainPrice : prod.price
                  return (
                    <div 
                      key={prod.id}
                      className={`${styles.miniCard} ${colSelections[2].prodId === prod.id ? styles.miniCardActive : ''}`}
                      onClick={() => updateSelection(2, 'prodId', prod.id)}
                    >
                      <button 
                        className={`${styles.miniWishlist} ${wishlist[prod.id] ? styles.miniWishlistActive : ''}`}
                        onClick={(e) => toggleWishlist(prod.id, e)}
                      >
                        <Heart size={10} fill={wishlist[prod.id] ? '#ff0000' : 'none'} />
                      </button>
                      <div className={styles.miniImgWrapper}>
                        <img src={prod.img} alt={prod.name} className={styles.miniImg} />
                      </div>
                      <h4 className={styles.miniTitle}>{prod.name}</h4>
                      <span className={styles.miniPrice}>₹{cardPrice}</span>
                    </div>
                  )
                })}
              </div>

              {/* Add to Cart Actions */}
              <div className={styles.bottomActionRow}>
                <div className={styles.qtyBox}>
                  <button className={styles.qtyBtn} onClick={() => updateSelection(2, 'qty', Math.max(1, colSelections[2].qty - 1))}>&minus;</button>
                  <span className={styles.qtyVal}>{colSelections[2].qty}</span>
                  <button className={styles.qtyBtn} onClick={() => updateSelection(2, 'qty', colSelections[2].qty + 1)}>+</button>
                </div>

                <button className={styles.addBtn} onClick={() => addToCart(2)}>
                  Add to Cart &mdash; ₹{(colSelections[2].type === 'plain' ? products[2].find(p => p.id === colSelections[2].prodId).plainPrice : products[2].find(p => p.id === colSelections[2].prodId).price) * colSelections[2].qty}
                </button>

                <button 
                  className={`${styles.wishlistActionBtn} ${wishlist[colSelections[2].prodId] ? styles.wishlistActionBtnActive : ''}`}
                  onClick={(e) => toggleWishlist(colSelections[2].prodId, e)}
                >
                  <Heart size={16} fill={wishlist[colSelections[2].prodId] ? '#ff0000' : 'none'} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* PANEL 03 - POLO T-SHIRTS */}
        <section className={`${styles.panel} ${styles.panel03} ${activeCol === 3 ? styles.panelActive : ''}`}>
          <div className={`${styles.heroWrapper} ${activeCol === 3 ? styles.heroWrapperShrunk : ''}`}>
            <AutoCarousel images={poloSlides} activeIndex={poloSlideIndex} setActiveIndex={setPoloSlideIndex} showCreateBtn={true} buttonSlideIndex={3} />
            <div className={styles.panelOverlay} />
            
            <div className={styles.heroContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div>
                  <h2 className={styles.fitTitle}>POLO T-SHIRTS</h2>
                </div>
                {activeCol === 3 && (
                  <button 
                    className={styles.closeColBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCol(null);
                    }}
                  >
                    <X size={12} /> CLOSE
                  </button>
                )}
              </div>
            </div>
            
            <div className={styles.heroBottom}>
              {activeCol !== 3 && (
                <>
                  <p className={styles.fitDesc}>Structured style. Smart comfort. Level up your day.</p>
                  <button className={styles.exploreBtn} onClick={() => setActiveCol(3)}>
                    SHOP NOW &rarr;
                  </button>
                </>
              )}
            </div>
          </div>

          {activeCol === 3 && (
            <div className={styles.shopArea}>
              <div className={styles.shopHeader}>
                <h3 className={styles.shopTitle}>POLO COLLECTION</h3>
              </div>

              {/* Selectors row */}
              <div className={styles.selectorsRow}>
                {/* Print toggle */}
                <div className={styles.selectorBlock}>
                  <span className={styles.selectorLabel}>PRINT TYPE</span>
                  <div className={styles.printControl}>
                    <button 
                      className={`${styles.printBtn} ${colSelections[3].type === 'plain' ? styles.printBtnActive : ''}`}
                      onClick={() => updateSelection(3, 'type', 'plain')}
                    >
                      PLAIN
                    </button>
                    <button 
                      className={styles.designYoursBtn}
                      onClick={() => window.location.href = '/customize/configurator.html'}
                    >
                      DESIGN YOURS &rarr;
                    </button>
                  </div>
                </div>

                {/* Color swatch */}
                <div className={styles.selectorBlock}>
                  <span className={styles.selectorLabel}>Color</span>
                  <div className={styles.swatchRow}>
                    {['white', 'black', 'beige', 'olive', 'charcoal'].map(cl => (
                      <div 
                        key={cl}
                        className={`${styles.swatch} ${colSelections[3].color === cl ? styles.swatchActive : ''}`}
                        onClick={() => updateSelection(3, 'color', cl)}
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <div 
                          className={styles.swatchDot} 
                          style={{
                            backgroundColor: cl === 'white' ? '#ffffff' : cl === 'black' ? '#111111' : cl === 'beige' ? '#d9c7b0' : cl === 'olive' ? '#4d5c41' : '#2f3538'
                          }} 
                        />
                        {colSelections[3].color === cl && (
                          <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#ffffff',
                            borderRadius: '50%',
                            position: 'absolute',
                            zIndex: 10,
                            boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size select */}
                <div className={styles.selectorBlock}>
                  <span className={styles.selectorLabel}>Size</span>
                  <div className={styles.sizeRow}>
                    {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                      <button 
                        key={sz}
                        className={`${styles.sizeBtn} ${colSelections[3].size === sz ? styles.sizeBtnActive : ''}`}
                        onClick={() => updateSelection(3, 'size', sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini Product Cards */}
              <div className={styles.miniGrid}>
                {products[3].map(prod => {
                  const cardPrice = colSelections[3].type === 'plain' ? prod.plainPrice : prod.price
                  return (
                    <div 
                      key={prod.id}
                      className={`${styles.miniCard} ${colSelections[3].prodId === prod.id ? styles.miniCardActive : ''}`}
                      onClick={() => updateSelection(3, 'prodId', prod.id)}
                    >
                      <button 
                        className={`${styles.miniWishlist} ${wishlist[prod.id] ? styles.miniWishlistActive : ''}`}
                        onClick={(e) => toggleWishlist(prod.id, e)}
                      >
                        <Heart size={10} fill={wishlist[prod.id] ? '#ff0000' : 'none'} />
                      </button>
                      <div className={styles.miniImgWrapper}>
                        <img src={prod.img} alt={prod.name} className={styles.miniImg} />
                      </div>
                      <h4 className={styles.miniTitle}>{prod.name}</h4>
                      <span className={styles.miniPrice}>₹{cardPrice}</span>
                    </div>
                  )
                })}
              </div>

              {/* Add to Cart Actions */}
              <div className={styles.bottomActionRow}>
                <div className={styles.qtyBox}>
                  <button className={styles.qtyBtn} onClick={() => updateSelection(3, 'qty', Math.max(1, colSelections[3].qty - 1))}>&minus;</button>
                  <span className={styles.qtyVal}>{colSelections[3].qty}</span>
                  <button className={styles.qtyBtn} onClick={() => updateSelection(3, 'qty', colSelections[3].qty + 1)}>+</button>
                </div>

                <button className={styles.addBtn} onClick={() => addToCart(3)}>
                  Add to Cart &mdash; ₹{(colSelections[3].type === 'plain' ? products[3].find(p => p.id === colSelections[3].prodId).plainPrice : products[3].find(p => p.id === colSelections[3].prodId).price) * colSelections[3].qty}
                </button>

                <button 
                  className={`${styles.wishlistActionBtn} ${wishlist[colSelections[3].prodId] ? styles.wishlistActionBtnActive : ''}`}
                  onClick={(e) => toggleWishlist(colSelections[3].prodId, e)}
                >
                  <Heart size={16} fill={wishlist[colSelections[3].prodId] ? '#ff0000' : 'none'} />
                </button>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Sliding Sidebar Cart Drawer overlay */}
      <div className={`${styles.cartDrawer} ${isCartOpen ? styles.cartDrawerOpen : ''}`}>
        <div className={styles.cartHeader}>
          <span className={styles.cartTitle}>Your Bag ({totalItems})</span>
          <button className={styles.cartCloseBtn} onClick={() => setIsCartOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px' }}>
              <ShoppingCart size={32} opacity="0.3" />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your cart is empty</span>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartId} className={styles.cartItem}>
                <img src={item.img} alt={item.name} className={styles.cartItemImg} />
                <div className={styles.cartItemDetails}>
                  <div>
                    <h4 className={item.cartItemName}>{item.name}</h4>
                    <span className={styles.cartItemMeta}>{item.fit} / {item.size} / {item.color} ({item.type})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span className={styles.cartItemPrice}>₹{item.price * item.qty}</span>
                    <button className={styles.cartItemRemove} onClick={() => removeCartItem(item.cartId)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.cartFooter}>
            <div className={styles.cartSummaryRow}>
              <span>Subtotal</span>
              <span>₹{baseSubtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className={styles.cartSummaryRow} style={{ color: '#ff0000' }}>
                <span>Discount ({discountPercentage * 100}%)</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}
            <div className={styles.cartSummaryRow} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
              <span>Total</span>
              <span className={styles.cartSummaryTotal}>₹{finalTotal}</span>
            </div>
            <button className={styles.checkoutBtn} onClick={() => window.location.href = '/checkout'}>
              Proceed to checkout
            </button>
          </div>
        )}
      </div>

      {/* Bottom Smart Offer Bar */}
      <footer className={styles.offerBar}>
        {/* Tier 1 Discount */}
        <div className={styles.offerBlock}>
          <div className={styles.offerInfo}>
            <span className={`${styles.offerTitle} ${totalItems >= 2 ? styles.offerTitleLocked : ''}`}>
              {totalItems >= 2 ? '10% OFF UNLOCKED ✓' : 'BUY 2 GET 10% OFF'}
            </span>
            <span className={styles.offerDesc}>Progress: {Math.min(totalItems, 2)} / 2</span>
          </div>
          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBarFill} style={{ width: `${Math.min((totalItems / 2) * 100, 100)}%` }} />
          </div>
        </div>

        {/* Tier 2 Discount */}
        <div className={styles.offerBlock}>
          <div className={styles.offerInfo}>
            <span className={`${styles.offerTitle} ${totalItems >= 3 ? styles.offerTitleLocked : ''}`}>
              {totalItems >= 3 ? '15% OFF UNLOCKED 🔥' : 'BUY 3 GET 15% OFF'}
            </span>
            <span className={styles.offerDesc}>Progress: {Math.min(totalItems, 3)} / 3</span>
          </div>
          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBarFill} style={{ width: `${Math.min((totalItems / 3) * 100, 100)}%` }} />
          </div>
        </div>

        {/* Dynamic Offer Notification strip */}
        <div className={styles.offerBlock}>
          <Sparkles size={14} color="#ff0000" />
          <div className={styles.offerInfo}>
            <span className={styles.offerTitle} style={{ color: '#ff0000' }}>OFFER STATUS</span>
            <span className={styles.offerDesc} style={{ fontWeight: 700, color: '#ffffff' }}>{offerFeedback}</span>
          </div>
        </div>

        {/* Shipping & Checkout trust info */}
        <div className={styles.offerBlock} style={{ borderRight: 'none' }}>
          <div className={styles.offerInfo}>
            <span className={styles.offerTitle}>FREE SHIPPING</span>
            <span className={styles.offerDesc}>On orders above ₹999 / 100% SECURE</span>
          </div>
        </div>
      </footer>

      {/* Same-page View All Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ff0000', margin: 0 }}>
              {modalTitle} Full collection
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              All 24 styles for this collection are available for purchase in our customized editor. Click "Design Yours" in the fit panel to view the complete catalog, apply your own prints, change alignments, or select from all size configurations.
            </p>
            <button 
              className={styles.checkoutBtn} 
              onClick={() => {
                setIsModalOpen(false);
                window.location.href = '/customize/configurator.html';
              }}
            >
              Open Configurator Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
