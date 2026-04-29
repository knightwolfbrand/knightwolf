import React, { useState, useRef, useEffect } from 'react';
import styles from './ProductSpinner360.module.css';

export default function ProductSpinner360({ children, image }) {
  const [rotation, setRotation] = useState(0);
  const isRotating = useRef(false);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const rotationRef = useRef(0);
  const containerRef = useRef(null);
  const animationId = useRef(null);

  const applyInertia = () => {
    if (!isRotating.current) {
      velocity.current *= 0.95; // Friction
      if (Math.abs(velocity.current) > 0.1) {
        rotationRef.current += velocity.current;
        setRotation(rotationRef.current);
        animationId.current = requestAnimationFrame(applyInertia);
      } else {
        velocity.current = 0;
      }
    } else {
      animationId.current = requestAnimationFrame(applyInertia);
    }
  };

  const handlePointerDown = (e) => {
    isRotating.current = true;
    lastX.current = e.pageX || e.touches?.[0]?.pageX;
    velocity.current = 0;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e) => {
    if (!isRotating.current) return;
    
    const currentX = e.pageX || e.touches?.[0]?.pageX;
    const deltaX = currentX - lastX.current;
    
    velocity.current = deltaX * 1.2; 
    rotationRef.current += velocity.current;
    setRotation(rotationRef.current);
    
    lastX.current = currentX;
  };

  const handlePointerUp = () => {
    isRotating.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  useEffect(() => {
    animationId.current = requestAnimationFrame(applyInertia);
    const handleGlobalUp = () => {
      isRotating.current = false;
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      if (animationId.current) cancelAnimationFrame(animationId.current);
    };
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
        <div className={styles.faceFront}>
          {children}
        </div>

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
