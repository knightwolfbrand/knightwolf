import gsap from 'gsap'

/**
 * Knight Wolf — Final Cinematic Splash Transition
 * Isolated "Hyper Shake" with sequential power (Head then Tail).
 * Strictly Black & White.
 */

export const transitions = {
  finalSplash: (refs) => {
    const tl = gsap.timeline()
    
    // Select elements from refs
    const revealRect = refs.logoSvg.querySelector('#reveal-rect')
    const tailPaths = refs.logoSvg.querySelectorAll('[data-part="tail"]')
    const facePaths = refs.logoSvg.querySelectorAll('[data-part="face"]')

    // 1. Initial State - Solid Reveal
    tl.set(refs.splash, { opacity: 1, display: 'flex' })
    tl.set(revealRect, { attr: { y: 0, height: 593 } }) 
    tl.fromTo(refs.logo, 
      { opacity: 0, scale: 0.95 }, 
      { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }
    )
    tl.fromTo(refs.brandName.children, 
      { opacity: 0, y: 30 }, 
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.05,
        ease: "power2.inOut"
      }, "-=0.4")

    // 2. PROCEDURAL 'DUIK' TAIL RIG (Overlapping Wave Logic)
    const rigDur = 2.4
    const waveDelay = rigDur * 0.12 // 12% phase shift per layer

    // A. HYPER SHAKE (Head Alert Tremor)
    // Runs once at start to give the wolf an 'alert' personality
    tl.to(facePaths, {
      x: "random(-1.5, 1.5)",
      y: "random(-1, 1)",
      rotation: "random(-1, 1)",
      duration: 0.08,
      repeat: 6,
      yoyo: true,
      ease: "none"
    }, "-=0.2")

    // B. TRIPLE-LAYERED WAVE (Tail Overlap)
    // This creates the "Duik Angela" effect on a single path layer
    
    // Level 1: Primary Swing (Base)
    gsap.to(tailPaths, {
      rotation: 14,
      transformOrigin: "50% 100%",
      duration: rigDur,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    })

    // Level 2: Secondary Bend (Phase-shifted skew)
    gsap.to(tailPaths, {
      skewX: 18,
      transformOrigin: "50% 100%",
      duration: rigDur,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: waveDelay
    })

    // Level 3: Tertiary Translation (Horizontal 'Whip')
    gsap.to(tailPaths, {
      x: 12,
      transformOrigin: "50% 100%",
      duration: rigDur,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: waveDelay * 2
    })

    // 3. Final cinematic exit (Sequential Power Down)
    tl.to(refs.splash, { 
      opacity: 0, 
      duration: 1.4, 
      ease: 'power4.inOut' 
    }, '+=4.5') 
    
    tl.set(refs.splash, { display: 'none' })
    tl.set([facePaths, tailPaths], { clearProps: "all" })

    return tl
  }
}






