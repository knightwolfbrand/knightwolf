'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import styles from './FlagshipLayout.module.css'
import Banner from './Banner'
import ProductCard from './ProductCard'
import CollectionCard from './CollectionCard'
import KnightWolfPoloCard from './KnightWolfPoloCard'
import ClassicPoloCard from './ClassicPoloCard'


if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function FlagshipLayout({ data }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const sections = containerRef.current.querySelectorAll(`.${styles.swipeSection}`)
    
    sections.forEach((section) => {
      const header = section.querySelector(`.${styles.sectionHeader}`)
      const content = section.querySelector(`.${styles.collectionsGrid}, .${styles.horizontalScroll}`)

      // Refined Cinematic Reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller: containerRef.current,
          start: 'top 60%',
          toggleActions: 'play none none none'
        }
      })

      tl.fromTo(header, 
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 1.2, ease: 'power4.out' }
      )
      
      if (content) {
        tl.fromTo(content,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.5, ease: 'expo.out' },
          '-=0.8'
        )
      }
    })

    // Scroll Progress Indicator Logic
    const handleScroll = () => {
      const container = containerRef.current
      if (!container) return
      const progress = container.scrollTop / (container.scrollHeight - container.clientHeight)
      const progressBar = document.getElementById('scrollProgress')
      if (progressBar) {
        progressBar.style.height = `${progress * 100}%`
      }
    }

    containerRef.current.addEventListener('scroll', handleScroll)

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
      containerRef.current?.removeEventListener('scroll', handleScroll)
    }
  }, [])
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

      {/* Cinematic Scroll Progress Indicator */}
      <div className={styles.scrollIndicatorTrack}>
        <div id="scrollProgress" className={styles.scrollIndicatorBar}></div>
      </div>

      {/* Swipe-Based Navigation Container (Strict Alignment) */}
      <div ref={containerRef} className={styles.swipeContainer}>
        
        {/* Section 1: Collections (Interactive 3D Grid) */}
        <div className={styles.swipeSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.badge}>NEW DROP</span>
            <h2 className={styles.sectionTitle}>T-SHIRT COLLECTIONS</h2>
          </div>
          <div style={{ height: '40px' }} /> {/* Structural Spacer */}
          <div className={styles.horizontalScroll}>
            {/* 3D CARD 1: OVERSIZE ROUND */}
            <div className={styles.snapItem}>
              <CollectionCard 
                title="Oversize Round" 
                price="₹2,499" 
                modelPath="/models/tshirt.glb" 
                defaultColor="#111111"
                scale={3.5}
              />
            </div>


            <div className={styles.snapItem}>
              <KnightWolfPoloCard shirtColor="#5D8AA8" collarColor="#E5E4E2" />
            </div>

            {/* 3D CARD 3: CLASSIC WHITE POLO (CINEMATIC) */}
            <div className={styles.snapItem}>
              <ClassicPoloCard />
            </div>
            <div className={styles.snapItem}>
              <CollectionCard 
                title="V-Neck Tech" 
                price="₹2,299" 
                modelPath="/models/tshirt.glb" 
                defaultColor="#111111"
                scale={3.5}
              />
            </div>
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


        {/* Section 6: Brand Outro / Footer */}
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
