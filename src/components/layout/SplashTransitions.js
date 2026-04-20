import gsap from 'gsap'

/**
 * Knight Wolf — Final Splash Transition
 * ScaleSync Entrance + Masked Text Reveal + Atmospheric Logo Glow.
 */

// --- Procedural Tail Rig ---

const applyDuikRig = (tailPaths) => {
  const rigDur = 2.4
  const waveDelay = rigDur * 0.12

  gsap.to(tailPaths, {
    rotation: 14, transformOrigin: "50% 100%",
    duration: rigDur, repeat: -1, yoyo: true, ease: "sine.inOut"
  })
  gsap.to(tailPaths, {
    skewX: 18, transformOrigin: "50% 100%",
    duration: rigDur, repeat: -1, yoyo: true, ease: "sine.inOut", delay: waveDelay
  })
  gsap.to(tailPaths, {
    x: 12, transformOrigin: "50% 100%",
    duration: rigDur, repeat: -1, yoyo: true, ease: "sine.inOut", delay: waveDelay * 2
  })
}

// --- Text Reveal ---

const revealTextMasked = (tl, brandNameRef, duration, startAt) => {
  const letters = brandNameRef.querySelectorAll('span')
  tl.fromTo(letters,
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration, ease: 'power4.out', stagger: 0 },
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
    tl.set(refs.glow, { opacity: 0 })

    // 2. ScaleSync Entrance — logo + text simultaneously at t=0
    tl.fromTo(refs.logo,
      { opacity: 0, scale: 1.1 },
      { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out' }
    )
    revealTextMasked(tl, refs.brandName, 1.6, "<")

    // 3. Atmospheric Glow — fades in as the logo settles
    tl.fromTo(refs.glow,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 2.0, ease: 'power2.out' },
      0.8 // starts t=0.8s, overlapping the entrance
    )

    // 4. Subtle Glow Pulse (idle breathing)
    tl.to(refs.glow, {
      opacity: 0.6,
      scale: 1.08,
      duration: 2.0,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    }, "+=0.5")

    // 5. Procedural Tail Motion
    applyDuikRig(tailPaths)

    // 6. Final Exit
    tl.to(refs.splash, {
      opacity: 0,
      duration: 1.2,
      ease: 'power4.inOut'
    }, '+=3.5')

    tl.set(refs.splash, { display: 'none' })
    tl.set([tailPaths], { clearProps: "all" })

    return tl
  }
}
