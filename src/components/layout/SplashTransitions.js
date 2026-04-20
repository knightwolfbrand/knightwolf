import gsap from 'gsap'

/**
 * Knight Wolf — Final Elegance Polish Transition
 * Masked Reveal + High-Gloss Textures + Sophisticated Lens Flare Sequence.
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

  gsap.to(tailPaths, {
    rotation: 14,
    transformOrigin: "50% 100%",
    duration: rigDur,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  })

  gsap.to(tailPaths, {
    skewX: 18,
    transformOrigin: "50% 100%",
    duration: rigDur,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: waveDelay
  })

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

const revealTextMasked = (tl, brandNameRef, duration = 2.0, startAt = "<") => {
  const letters = brandNameRef.querySelectorAll('span')
  tl.fromTo(letters, 
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: duration, ease: 'power4.out', stagger: 0 },
    startAt
  )
}

/**
 * ELEGANT POLISH: High-Gloss Light Sweep + Sophisticated Lens Flares.
 */
const applyElegantPolishSequence = (tl, logoSvg) => {
  const shineRect = logoSvg.querySelector('[data-part="logo-shine-rect"]')
  const flareMain = logoSvg.querySelector('[data-part="flare-main"]')
  const flareGhost1 = logoSvg.querySelector('[data-part="flare-ghost-1"]')
  const flareGhost2 = logoSvg.querySelector('[data-part="flare-ghost-2"]')
  const eyeSparkle = logoSvg.querySelector('[data-part="eye-sparkle"]')

  // Define the master sweep timing
  const sweepDur = 1.6
  const sweepStart = "+=0.2"

  // 1. The Glint (Main Sweep)
  tl.fromTo(shineRect, 
    { x: -700 },
    { x: 700, duration: sweepDur, ease: "power2.inOut" },
    sweepStart
  )

  // 2. The Flare Core (Follows the glint)
  tl.fromTo(flareMain,
    { x: -500, opacity: 0, scale: 0.5 },
    { x: 500, opacity: 1, scale: 1, duration: sweepDur * 1.1, ease: "power2.out" },
    sweepStart
  )
  tl.to(flareMain, { opacity: 0, scale: 0, duration: 0.4 }, "-=0.4")

  // 3. The Ghosts (Parallax bokeh effect)
  tl.fromTo(flareGhost1,
    { x: -600, y: 20, opacity: 0 },
    { x: 400, y: -20, opacity: 0.4, duration: sweepDur * 1.3, ease: "sine.inOut" },
    sweepStart
  )
  tl.fromTo(flareGhost2,
    { x: -400, y: -30, opacity: 0 },
    { x: 600, y: 30, opacity: 0.3, duration: sweepDur * 1.5, ease: "sine.inOut" },
    sweepStart
  )

  // 4. Hero Eye Sparkle (Triggers exactly as glint crosses the center)
  tl.fromTo(eyeSparkle,
    { scale: 0, opacity: 0, rotation: -45 },
    { scale: 1.2, opacity: 1, rotation: 45, duration: 0.5, ease: "back.out(2)" },
    sweepStart + "+=0.7" // Perfectly timed for the midpoint
  )
  tl.to(eyeSparkle, { scale: 0, opacity: 0, duration: 0.4, ease: "power2.in" })
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

    // 2. ScaleSync Entrance (Professional reveal)
    tl.fromTo(refs.logo, 
      { opacity: 0, scale: 1.1 }, 
      { opacity: 1, scale: 1, duration: 2.2, ease: 'expo.out' }
    )
    revealTextMasked(tl, refs.brandName, 2.2, "<")

    // 3. Sophisticated Lens Flare & Polish
    applyElegantPolishSequence(tl, refs.logoSvg)

    // 4. Constant Idle motion
    applyHyperShake(tl, facePaths)
    applyDuikRig(tailPaths)

    // 5. Final Transition Exit
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
