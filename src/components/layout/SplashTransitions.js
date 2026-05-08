import gsap from 'gsap'
import { textAnimations } from './SplashTextAnimations'

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
  
  // --- VELVET MIST SELECTED ---
  textAnimations.velvetMist(tl, letters, duration, startAt)
}

// --- Main Transition ---

export const transitions = {
  finalSplash: (refs) => {
    const tl = gsap.timeline()
    const revealRect = refs.logoSvg.querySelector('#reveal-rect')
    const tailPaths = refs.logoSvg.querySelectorAll('[data-part="tail"]')

    const letters = refs.brandName.querySelectorAll('span')

    // 1. Initial State
    tl.set(refs.splash, { opacity: 1, display: 'flex' })
    tl.set(revealRect, { attr: { y: 0, height: 593 } })
    tl.set(refs.glow, { opacity: 0 })
    // Ensure letters are ready for container-level fade
    tl.set(letters, { autoAlpha: 1, opacity: 1 }) 

    // 2. Buttery Smooth Entrance — logo + text fade in together
    // Removed 'y' drift to eliminate any "jerk" or jumping
    tl.fromTo([refs.logo, refs.brandName],
      { autoAlpha: 0, force3D: true },
      { autoAlpha: 1, duration: 1.8, ease: 'power2.inOut', force3D: true }
    )

    // 3. Atmospheric Glow — fades in as the logo settles
    tl.fromTo(refs.glow,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' },
      0.6 
    )

    // 4. Subtle Glow Pulse (idle breathing) - Move to independent tween so timeline can complete
    gsap.to(refs.glow, {
      opacity: 0.6,
      scale: 1.08,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1.0
    })

    // 5. Procedural Tail Motion
    applyDuikRig(tailPaths)

    // 6. Final Exit
    tl.to(refs.splash, {
      opacity: 0,
      duration: 0.6,
      ease: 'power4.inOut'
    }, '+=2.0') 

    tl.set(refs.splash, { display: 'none' })
    tl.set([tailPaths], { clearProps: "all" })

    return tl
  }
}

