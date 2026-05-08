import gsap from 'gsap'

/**
 * Knight Wolf — Advanced Blur Fade Library
 * Unique variations using combined filters and transforms
 */

export const textAnimations = {
  // VELVET MIST: Slow, graceful, and ethereal (The Chosen One)
  // VELVET MIST: Optimized for maximum GPU smoothness
  velvetMist: (tl, letters, duration, startAt) => {
    tl.fromTo(letters,
      { autoAlpha: 0, y: 15, filter: 'blur(12px)', force3D: true },
      { 
        autoAlpha: 1, 
        y: 0, 
        filter: 'blur(0px)', 
        duration: 2.2, 
        stagger: 0.1, 
        ease: 'power3.out', // Slightly softer than expo for better frame stability
        force3D: true
      },
      startAt
    )
  },

  // 2. THE SAND BLUR: High-frequency grain simulation
  sandBlur: (tl, letters, duration, startAt) => {
    tl.fromTo(letters,
      { opacity: 0, filter: 'blur(5px) contrast(200%)', y: 10, scale: 0.95 },
      { opacity: 1, filter: 'blur(0px) contrast(100%)', y: 0, scale: 1, duration: duration * 1.5, ease: 'power1.out', stagger: 0.02 },
      startAt
    )
  },

  // 3. THE RADIANT BLOOM: Intense brightness + massive blur
  radiantBloom: (tl, letters, duration, startAt) => {
    tl.fromTo(letters,
      { opacity: 0, filter: 'blur(80px) brightness(10)', scale: 0.5 },
      { opacity: 1, filter: 'blur(0px) brightness(1)', scale: 1, duration: duration * 2.5, ease: 'expo.out', stagger: 0.04 },
      startAt
    )
  },

  // 4. THE DIRECTIONAL SMEAR: Simulated vertical motion blur
  smearBlur: (tl, letters, duration, startAt) => {
    tl.fromTo(letters,
      { opacity: 0, filter: 'blur(40px)', y: -100, scaleY: 3 },
      { opacity: 1, filter: 'blur(0px)', y: 0, scaleY: 1, duration: duration * 1.2, ease: 'power4.out', stagger: 0.03 },
      startAt
    )
  },

  // 5. THE INK BLEED: Saturate + blur (feels like ink spreading)
  inkBleed: (tl, letters, duration, startAt) => {
    tl.fromTo(letters,
      { opacity: 0, filter: 'blur(30px) saturate(0)', scale: 1.1 },
      { opacity: 1, filter: 'blur(0px) saturate(1)', scale: 1, duration: duration * 3, ease: 'sine.inOut', stagger: 0.1 },
      startAt
    )
  },

  // 6. THE GHOSTLY ECHO: Staggered layers of blur
  ghostlyEcho: (tl, letters, duration, startAt) => {
    tl.fromTo(letters,
      { opacity: 0, filter: 'blur(50px)', x: -20, rotationY: 45 },
      { opacity: 1, filter: 'blur(0px)', x: 0, rotationY: 0, duration: duration * 2, ease: 'power2.inOut', stagger: 0.06 },
      startAt
    )
  },

  // 7. THE HORIZON WIPE: Tracking + blur reveal
  horizonWipe: (tl, letters, duration, startAt) => {
    tl.fromTo(letters,
      { opacity: 0, filter: 'blur(20px)', letterSpacing: '2em' },
      { opacity: 1, filter: 'blur(0px)', letterSpacing: '0.2em', duration: duration * 1.5, ease: 'expo.out', stagger: 0.05 },
      startAt
    )
  },

  // 8. THE FROSTED SNAP: Quick sharpen from high blur
  frostedSnap: (tl, letters, duration, startAt) => {
    tl.fromTo(letters,
      { opacity: 0, filter: 'blur(120px)', scale: 2 },
      { opacity: 1, filter: 'blur(0px)', scale: 1, duration: duration * 0.7, ease: 'power4.inOut', stagger: 0.02 },
      startAt
    )
  }
}
