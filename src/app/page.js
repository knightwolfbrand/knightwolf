import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Placeholder — full homepage coming soon */}
      <div className={styles.hero}>
        <img
          src="/KnightWolf_Logo_White_1.svg"
          alt="Knight Wolf"
          className={styles.heroLogo}
        />
        <h1 className={styles.heroTitle}>KNIGHT WOLF</h1>
        <p className={styles.heroSub}>Wear The Hunt</p>
        <p className={styles.heroBadge}>Homepage coming soon — splash is live ✓</p>
      </div>
    </div>
  )
}
