import React, { useState, useRef, useEffect } from 'react';
import styles from './ProductSpinner360.module.css';

export default function ProductSpinner360({ children, image }) {
  const [rotation, setRotation] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const startX = useRef(0);
  const startRotation = useRef(0);
  const containerRef = useRef(null);

  const handlePointerDown = (e) => {
    setIsRotating(true);
    startX.current = e.pageX || e.touches?.[0]?.pageX;
    startRotation.current = rotation;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e) => {
    if (!isRotating) return;
    
    const currentX = e.pageX || e.touches?.[0]?.pageX;
    const deltaX = currentX - startX.current;
    
    // Sensitivity: 1px = 1 degree
    const newRotation = startRotation.current + (deltaX * 0.5);
    setRotation(newRotation);
  };

  const handlePointerUp = () => {
    setIsRotating(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  useEffect(() => {
    const handleGlobalUp = () => setIsRotating(false);
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, []);

  return (
    <div 
      className={styles.perspective}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      ref={containerRef}
    >
      <div 
        className={styles.spinner}
        style={{ transform: `rotateY(${rotation}deg)` }}
      >
        {/* Front Face */}
        <div className={styles.faceFront}>
          {children}
        </div>

        {/* Back Face (Placeholder for 360 effect) */}
        <div className={styles.faceBack}>
          {image ? (
             <div 
               className={styles.backImage} 
               style={{ backgroundImage: `url(${image})` }} 
             />
          ) : (
             <div className={styles.backPlaceholder}>WOLF BRAND</div>
          )}
        </div>
      </div>
      
      <div className={styles.indicator}>360° INTERACTIVE</div>
    </div>
  );
}
