import gsap from 'gsap'

/**
 * Knight Wolf — Final Polished Splash Transition
 * Masked Reveal + Procedural "Duik" Rig + Cinematic Glassy Shine.
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

/**
 * MASKED REVEAL: Text slides up from 'behind' a blank space.
 */
const revealTextMasked = (tl, brandNameRef, duration = 2.0, startAt = "<") => {
  const letters = brandNameRef.querySelectorAll('span')
  tl.fromTo(letters, 
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: duration, ease: 'power4.out', stagger: 0 },
    startAt
  )
}

// --- Main Transition ---

export const transitions = {
  finalSplash: (refs) => {
    const tl = gsap.timeline()
    const revealRect = refs.logoSvg.querySelector('#reveal-rect')
    const tailPaths = refs.logoSvg.querySelectorAll('[data-part="tail"]')
    const facePaths = refs.logoSvg.querySelectorAll('[data-part="face"]')

    // 1. Initial State
    tl.set(refs.splash, { opacity: 1, display: 'flex' })
    tl.set(revealRect, { attr: { y: 0, height: 593 } }) 
    tl.set([refs.logo, refs.brandName], { opacity: 1 })

    // 2. ScaleSync Collective Entrance (Subtle Zoom + Simultaneous Reveal)
    tl.fromTo(refs.logo, 
      { opacity: 0, scale: 1.1 }, 
      { opacity: 1, scale: 1, duration: 2.2, ease: 'expo.out' }
    )
    revealTextMasked(tl, refs.brandName, 2.2, "<")

    // 3. Constant Procedural Motion (Idle State)
    applyHyperShake(tl, facePaths)
    applyDuikRig(tailPaths)

    // 5. Power Down / Final Exit
    tl.to(refs.splash, { 
      opacity: 0, 
      duration: 1.5, 
      ease: 'power4.inOut' 
    }, '+=4.0') 
    
    tl.set(refs.splash, { display: 'none' })
    tl.set([facePaths, tailPaths], { clearProps: "all" })

    return tl
  }
}
