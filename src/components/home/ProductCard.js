'use client'

import { useState } from 'react'
import styles from './ProductCard.module.css'
import ProductSpinner360 from './ProductSpinner360'

const COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#000000' },
  { name: 'Olive Green', hex: '#556b2f' },
  { name: 'Peach', hex: '#ffdab9' },
  { name: 'Navy Blue', hex: '#000080' },
]

export default function ProductCard({ title, price, image, rating, reviews, label }) {
  const [selectedColor, setSelectedColor] = useState(COLORS[1]) // Default to Black

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    ))
  }

  return (
    <div className={`${styles.card} glass`}>
      {label && <span className={styles.productLabel}>{label}</span>}
      <div className={styles.imageContainer}>
        <div className={styles.productLabel}>{label || 'Premium'}</div>
        <ProductSpinner360 image={image}>
          <div className={styles.floatingWrapper}>
            {image ? (
              <div className={styles.image} style={{ backgroundImage: `url(${image})` }} />
            ) : (
              /* Cinematic 3D Glass T-Shirt Mockup SVG */
              <div className={styles.glassMockup}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.tshirtSvg}>
                  <path d="M25 20C25 15 35 10 50 10C65 10 75 15 75 20L85 30L80 40L75 35V85H25V35L20 40L15 30L25 20Z" 
                    fill="url(#glassGradient)" 
                    stroke="rgba(255,255,255,0.2)" 
                    strokeWidth="0.5"
                  />
                  <defs>
                    <linearGradient id="glassGradient" x1="25" y1="10" x2="75" y2="85" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                      <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className={styles.innerGlow}></div>
                <div className={styles.branding}>WOLF</div>
              </div>
            )}
          </div>
        </ProductSpinner360>
      </div>
      
      <div className={styles.info}>
        <div className={styles.metaRow}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.price}>₹{price}</span>
        </div>

        {/* Color Selection UI */}
        <div className={styles.colorSelector}>
          <p className={styles.colorName}>Color: <span>{selectedColor.name}</span></p>
          <div className={styles.swatches}>
            {COLORS.map((color) => (
              <button
                key={color.name}
                className={`${styles.swatch} ${selectedColor.name === color.name ? styles.swatchActive : ''}`}
                style={{ backgroundColor: color.hex }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Select ${color.name}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.ratingRow}>
          {rating && (
            <div className={styles.rating}>
              <div className={styles.stars}>{renderStars(rating)}</div>
              <span className={styles.reviews}>({reviews})</span>
            </div>
          )}
          <button className={`${styles.btnAction} btn btn-ghost`}>
            Details
          </button>
        </div>
      </div>
    </div>
  )
}
