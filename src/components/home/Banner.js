'use client'

import styles from './Banner.module.css'

export default function Banner({ items = [] }) {
  if (!items || items.length === 0) return null

  return (
    <section className={styles.bannerContainer}>
      <div className={styles.horizontalSlider}>
        {items.map((item, index) => (
          <div key={index} className={styles.slide}>
            <div className={`${styles.banner} glass`}>
              <div className={styles.content}>
                <span className={styles.label}>{item.label || 'Special Offer'}</span>
                <h2 className={styles.title}>{item.title}</h2>
                <p className={styles.subtitle}>{item.subtitle}</p>
                <button className="btn btn-primary" onClick={item.onCtaClick}>
                  {item.ctaText || 'Learn More'}
                </button>
              </div>
              <div className={styles.visual}>
                <div className={styles.circle}></div>
                <div className={styles.circleSmall}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
