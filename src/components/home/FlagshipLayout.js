'use client'

import styles from './FlagshipLayout.module.css'
import Banner from './Banner'
import ProductCard from './ProductCard'

export default function FlagshipLayout({ data }) {
  const ads = [
    {
      title: "₹SUMMER SALE: 20% OFF", 
      subtitle: "Get ready with premium heavyweight fabrics. Code: KNIGHT20",
      ctaText: "REDEEM NOW",
      label: "SEASONAL DROP"
    },
    {
      title: "EXCLUSIVE GIFT BUNDLE", 
      subtitle: "Free stickers with every order above ₹2,000.",
      ctaText: "SHOP ACCESSORIES",
      label: "LIMITIED OFFER"
    }
  ]

  return (
    <div className={styles.layout}>
      
      {/* Side-Swipe Ads Area */}
      <div className={styles.stickyTop}>
        <Banner items={ads} />
      </div>

      {/* Swipe-Based Navigation Container (Strict Alignment) */}
      <div className={styles.swipeContainer}>
        
        {/* Section 1: Collections */}
        <div className={styles.swipeSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.badge}>NEW DROP</span>
            <h2 className={styles.sectionTitle}>T-SHIRT COLLECTIONS</h2>
          </div>
          <div style={{ height: '40px' }} /> {/* Structural Spacer */}
          <div className={styles.horizontalScroll}>
            {data.newCollections.map((item, idx) => (
              <div key={idx} className={styles.snapItem}>
                <ProductCard {...item} />
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Trending */}
        <div className={styles.swipeSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.badge}>TRENDING</span>
            <h2 className={styles.sectionTitle}>FAST-MOVING & STICKERS</h2>
          </div>
          <div style={{ height: '40px' }} /> {/* Structural Spacer */}
          <div className={styles.horizontalScroll}>
            {data.fastSelling.map((item, idx) => (
              <div key={idx} className={styles.snapItem}>
                <ProductCard {...item} />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Best-Selling T-shirts */}
        <div className={styles.swipeSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.badge}>TOP RATED</span>
            <h2 className={styles.sectionTitle}>BEST-SELLING T-SHIRTS</h2>
          </div>
          <div style={{ height: '40px' }} /> {/* Structural Spacer */}
          <div className={styles.horizontalScroll}>
            {data.bestSellers.map((item, idx) => (
              <div key={idx} className={styles.snapItem}>
                <ProductCard {...item} rating={item.rating} reviews={item.reviews} />
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Brand Outro / Footer */}
        <div className={`${styles.swipeSection} ${styles.footerSection}`}>
          <div className={styles.brandOutro}>
            <h3>KNIGHT WOLF</h3>
            <p>PREMIUM STREETWEAR ORIGINALS</p>
          </div>
        </div>

      </div>
    </div>
  )
}
