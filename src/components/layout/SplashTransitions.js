import gsap from 'gsap'

/**
 * Knight Wolf — Final Glossy Metallic Splash Transition
 * Double-Glint "Sparkle" System + Masked Reveal + Procedural "Duik" Rig.
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
 * MASKED REVEAL: Text slides up simultaneously from 'behind' a blank space.
 */
const revealTextMasked = (tl, brandNameRef, duration = 2.2, startAt = "<") => {
  const letters = brandNameRef.querySelectorAll('span')
  tl.fromTo(letters, 
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: duration, ease: 'power4.out', stagger: 0 },
    startAt
  )
}

/**
 * BRILLIANT DOUBLE-GLINT: Multi-layered light sweep for 'glossy' surface.
 */
const applyBrilliantShine = (tl, logoSvg) => {
  const softShine = logoSvg.querySelector('[data-part="logo-shine-soft"]')
  const sparkleGlint = logoSvg.querySelector('[data-part="logo-shine-sparkle"]')

  // Layered sweep for that 'brilliant' polish
  tl.fromTo(softShine, 
    { x: -700 },
    { x: 700, duration: 1.8, ease: "power2.inOut" },
    "+=0.2"
  )
  
  tl.fromTo(sparkleGlint, 
    { x: -600 },
    { x: 700, duration: 1.2, ease: "power3.inOut" },
    "-=1.5" // Overlaps with soft shine for extra sparkle
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

    // 2. Glossy ScaleSync Entrance
    tl.fromTo(refs.logo, 
      { opacity: 0, scale: 1.15, filter: 'brightness(0.5)' }, 
      { opacity: 1, scale: 1, filter: 'brightness(1)', duration: 2.5, ease: 'expo.out' }
    )
    revealTextMasked(tl, refs.brandName, 2.5, "<")

    // 3. Brilliant Double-Glance Reflections
    applyBrilliantShine(tl, refs.logoSvg)

    // 4. Constant Procedural Motion
    applyHyperShake(tl, facePaths)
    applyDuikRig(tailPaths)

    // 5. Final Exit
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
