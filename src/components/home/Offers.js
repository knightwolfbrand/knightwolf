'use client'

import styles from './Offers.module.css'

export default function Offers() {
  const offers = [
    {
      title: "BUY 2 GET 1 FREE",
      desc: "Valid on all Classic Collection tees. Use code: B2G1",
      icon: "⚡"
    },
    {
      title: "FREE SHIPPING",
      desc: "On all orders above ₹4,000 within India.",
      icon: "📦"
    },
    {
      title: "FIRST ORDER 10% OFF",
      desc: "Sign up for our newsletter to claim your discount.",
      icon: "🎁"
    }
  ]

  return (
    <div className={styles.offersContainer}>
      <div className={styles.grid}>
        {offers.map((offer, idx) => (
          <div key={idx} className={styles.offerCard}>
            <div className={styles.icon}>{offer.icon}</div>
            <div className={styles.content}>
              <h3 className={styles.title}>{offer.title}</h3>
              <p className={styles.desc}>{offer.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
