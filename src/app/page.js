'use client'

import styles from './page.module.css'
import FlagshipLayout from '@/components/home/FlagshipLayout'

export default function Home() {
  const data = {
    newCollections: [
      { title: 'Apex Crewneck', price: '5,999', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000', label: 'New' },
      { title: 'Lunar Polo', price: '7,499', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=1000', label: 'New' },
      { title: 'Void Tee', price: '4,500', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=1000', label: 'Trending' },
      { title: 'Stealth V-Neck', price: '4,800', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1000', label: 'Collector' },
    ],
    fastSelling: [
      { title: 'Graphix Black', price: '6,200', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1000', label: 'Fast' },
      { title: 'Moss Green', price: '4,900', image: 'https://images.unsplash.com/photo-1576566582418-b544b8b78384?auto=format&fit=crop&q=80&w=1000', label: 'Fast' },
      { title: 'Stone Gray', price: '3,800', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=1000', label: 'Best Stickers' },
    ],
    bestSellers: [
      { title: 'Apex Crewneck', price: '5,999', rating: 5, reviews: 124, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000' },
      { title: 'Lunar Polo', price: '7,499', rating: 4.5, reviews: 89, image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=1000' },
      { title: 'Void Tee', price: '4,500', rating: 4.8, reviews: 210, image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=1000' },
    ]
  }

  return (
    <div className={styles.page}>
      
      {/* Principal View: Perfectly Polished Flagship Architecture */}
      <main className={styles.mainContent}>
        <FlagshipLayout data={data} />
      </main>

    </div>
  )
}
