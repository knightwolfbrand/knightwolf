'use client'

import styles from './page.module.css'
import DashboardHome from '@/components/home/DashboardHome'

export default function Home() {
  return (
    <div className={styles.page}>
      {/* ─── Principal View: Glassmorphic Dashboard Architecture ─── */}
      <main className={styles.mainContent}>
        <DashboardHome />
      </main>
    </div>
  )
}

