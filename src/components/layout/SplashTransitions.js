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

    // 2. PROCEDURAL 'DUIK ANGELA' TAIL RIG
    // Simultaneous phase-shifted oscillations create organic follow-through
    const rigDur = 2.0
    
    // Primary Swing
    gsap.to(tailPaths, {
      rotation: 12,
      transformOrigin: "50% 100%",
      duration: rigDur,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    })

    // Organic Bend (Phase-shifted by 1/4 duration for perfect overlap)
    gsap.to(tailPaths, {
      skewX: 15,
      transformOrigin: "50% 100%",
      duration: rigDur,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: rigDur * 0.25 
    })

    // 3. Final cinematic exit (After allowing a few wags)
    tl.to(refs.splash, { 
      opacity: 0, 
      duration: 1.2, 
      ease: 'power3.inOut' 
    }, '+=4') 
    
    tl.set(refs.splash, { display: 'none' })
    tl.set([facePaths, tailPaths], { clearProps: "all" })

    return tl
  }
}






