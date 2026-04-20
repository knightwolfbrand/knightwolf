import gsap from 'gsap'

/**
 * Knight Wolf — Cinematic Splash Transition Library
 * Includes 5 distinct "Demo" styles + the Core Rig.
 */

// --- Shared Procedural Components ---

const applyHyperShake = (tl, facePaths) => {
  tl.to(facePaths, {
    x: "random(-1.5, 1.5)",
    y: "random(-1, 1)",
    duration: 0.08,
    repeat: 6,
    yoyo: true,
    ease: "none"
  }, "-=0.2")
}

const applyDuikRig = (tailPaths) => {
  const rigDur = 2.4
  const waveDelay = rigDur * 0.12

  // Level 1: Primary Swing
  gsap.to(tailPaths, {
    rotation: 14,
    transformOrigin: "50% 100%",
    duration: rigDur,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  })

  // Level 2: Secondary Bend
  gsap.to(tailPaths, {
    skewX: 18,
    transformOrigin: "50% 100%",
    duration: rigDur,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: waveDelay
  })

  // Level 3: Tertiary Translation
  gsap.to(tailPaths, {
    x: 12,
    transformOrigin: "50% 100%",
    duration: rigDur,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: waveDelay * 2
  })
}

// --- Transition Library ---

export const transitions = {
  // 1. UNITIZED ENTRANCE: Simultaneous collective fade
  unitizedEntrance: (refs) => {
    const tl = gsap.timeline()
    const revealRect = refs.logoSvg.querySelector('#reveal-rect')
    const tailPaths = refs.logoSvg.querySelectorAll('[data-part="tail"]')
    const facePaths = refs.logoSvg.querySelectorAll('[data-part="face"]')

    tl.set(refs.splash, { opacity: 1, display: 'flex' })
    tl.set(revealRect, { attr: { y: 0, height: 593 } }) 
    
    tl.fromTo([refs.logo, refs.brandName], 
      { opacity: 0 }, 
      { opacity: 1, duration: 1.5, ease: 'power2.inOut' }
    )

    applyHyperShake(tl, facePaths)
    applyDuikRig(tailPaths)
    return tl
  },

  // 2. LINKED EXPOSURE: Blur-to-sharp cinematic focus
  linkedExposure: (refs) => {
    const tl = gsap.timeline()
    const revealRect = refs.logoSvg.querySelector('#reveal-rect')
    const tailPaths = refs.logoSvg.querySelectorAll('[data-part="tail"]')
    const facePaths = refs.logoSvg.querySelectorAll('[data-part="face"]')

    tl.set(refs.splash, { opacity: 1, display: 'flex' })
    tl.set(revealRect, { attr: { y: 0, height: 593 } }) 

    tl.fromTo([refs.logo, refs.brandName], 
      { opacity: 0, filter: 'blur(20px)' }, 
      { opacity: 1, filter: 'blur(0px)', duration: 2, ease: 'power3.out' }
    )

    applyHyperShake(tl, facePaths)
    applyDuikRig(tailPaths)
    return tl
  },

  // 3. SOLID REVEAL: Immediate mask reveal, static text fade
  solidReveal: (refs) => {
    const tl = gsap.timeline()
    const revealRect = refs.logoSvg.querySelector('#reveal-rect')
    const tailPaths = refs.logoSvg.querySelectorAll('[data-part="tail"]')
    const facePaths = refs.logoSvg.querySelectorAll('[data-part="face"]')

    tl.set(refs.splash, { opacity: 1, display: 'flex' })
    
    // Quick Mask Reveal
    tl.fromTo(revealRect, 
      { attr: { y: 593 } }, 
      { attr: { y: 0 }, duration: 1.2, ease: 'power4.out' }
    )
    
    // Smooth Text Fade (Static)
    tl.fromTo(refs.brandName, 
      { opacity: 0 }, 
      { opacity: 1, duration: 2 }, "-=0.8"
    )

    applyHyperShake(tl, facePaths)
    applyDuikRig(tailPaths)
    return tl
  },

  // 4. ATMOSPHERIC CROSS-FADE: Perfect overlap at 50%
  atmosphericCrossFade: (refs) => {
    const tl = gsap.timeline()
    const revealRect = refs.logoSvg.querySelector('#reveal-rect')
    const tailPaths = refs.logoSvg.querySelectorAll('[data-part="tail"]')
    const facePaths = refs.logoSvg.querySelectorAll('[data-part="face"]')

    tl.set(refs.splash, { opacity: 1, display: 'flex' })
    
    tl.fromTo(revealRect, 
      { attr: { y: 593 } }, 
      { attr: { y: 0 }, duration: 2, ease: 'power2.inOut' }
    )
    
    tl.fromTo(refs.brandName, 
      { opacity: 0 }, 
      { opacity: 1, duration: 1.5, ease: 'power2.inOut' }, 1.0 // Start at exactly 1.0s (halfway)
    )

    applyHyperShake(tl, facePaths)
    applyDuikRig(tailPaths)
    return tl
  },

  // 5. SCALE SYNC: Zoom-out + collective fade
  scaleSync: (refs) => {
    const tl = gsap.timeline()
    const revealRect = refs.logoSvg.querySelector('#reveal-rect')
    const tailPaths = refs.logoSvg.querySelectorAll('[data-part="tail"]')
    const facePaths = refs.logoSvg.querySelectorAll('[data-part="face"]')

    tl.set(refs.splash, { opacity: 1, display: 'flex' })
    tl.set(revealRect, { attr: { y: 0, height: 593 } }) 

    tl.fromTo([refs.logo, refs.brandName], 
      { opacity: 0, scale: 1.15 }, 
      { opacity: 1, scale: 1, duration: 2.5, ease: 'expo.out' }
    )

    applyHyperShake(tl, facePaths)
    applyDuikRig(tailPaths)
    return tl
  },

  // The Original/Default Final Splash
  finalSplash: (refs) => {
    // For now, we'll map default to scaleSync as it's the most "cinematic"
    return transitions.scaleSync(refs)
  }
}
