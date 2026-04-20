import gsap from 'gsap'

/**
 * Knight Wolf — Final Polished Splash Transition
 * ScaleSync Entrance + Masked Text Reveal + Corrected Cinematic Shine.
 */

// --- Shared Procedural Components ---

const applyDuikRig = (tailPaths) => {
  const rigDur = 2.4
  const waveDelay = rigDur * 0.12

  gsap.to(tailPaths, {
    rotation: 14,
    transformOrigin: "50% 100%",
    duration: rigDur, repeat: -1, yoyo: true, ease: "sine.inOut"
  })
  gsap.to(tailPaths, {
    skewX: 18,
    transformOrigin: "50% 100%",
    duration: rigDur, repeat: -1, yoyo: true, ease: "sine.inOut", delay: waveDelay
  })
  gsap.to(tailPaths, {
    x: 12,
    transformOrigin: "50% 100%",
    duration: rigDur, repeat: -1, yoyo: true, ease: "sine.inOut", delay: waveDelay * 2
  })
}

/**
 * MASKED REVEAL: Text slides up simultaneously from behind its mask.
 */
const revealTextMasked = (tl, brandNameRef, duration, startAt) => {
  const letters = brandNameRef.querySelectorAll('span')
  tl.fromTo(letters,
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration, ease: 'power4.out', stagger: 0 },
    startAt
  )
}

/**
 * LOGO SHINE: Correct SVG 'attr' sweep so the glint is actually visible.
 * The rect x must use attr to move within SVG coordinate space.
 */
const applyLogoShine = (tl, logoSvg, startAt) => {
  const shineRect = logoSvg.querySelector('[data-part="logo-shine-rect"]')
  // Reset position before sweep
  tl.set(shineRect, { attr: { x: -800 } }, startAt)
  tl.to(shineRect,
    { attr: { x: 800 }, duration: 1.0, ease: "power2.inOut" },
    startAt
  )
}

// --- Main Transition ---

export const transitions = {
  finalSplash: (refs) => {
    const tl = gsap.timeline()
    const revealRect = refs.logoSvg.querySelector('#reveal-rect')
    const tailPaths = refs.logoSvg.querySelectorAll('[data-part="tail"]')

    // 1. Initial State
    tl.set(refs.splash, { opacity: 1, display: 'flex' })
    tl.set(revealRect, { attr: { y: 0, height: 593 } })
    tl.set([refs.logo, refs.brandName], { opacity: 1 })

    // 2. ScaleSync Entrance: logo + text enter simultaneously at t=0
    tl.fromTo(refs.logo,
      { opacity: 0, scale: 1.1 },
      { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out' }
    )
    revealTextMasked(tl, refs.brandName, 1.6, "<")

    // 3. Cinematic Shine — fires at t=1.4s (just before entrance completes)
    applyLogoShine(tl, refs.logoSvg, 1.4)

    // 4. Constant Procedural Motion (starts immediately)
    applyDuikRig(tailPaths)

    // 5. Hold then Exit at t≈5.5s total
    tl.to(refs.splash, {
      opacity: 0,
      duration: 1.2,
      ease: 'power4.inOut'
    }, '+=2.8')

    tl.set(refs.splash, { display: 'none' })
    tl.set([tailPaths], { clearProps: "all" })

    return tl
  }
}
