"use client"

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const DEFAULT_ITEMS = [
  {
    label: 'home',
    href: '#',
    ariaLabel: 'Home',
    rotation: -8,
    hoverStyles: { bgColor: 'var(--ui-pink)', textColor: 'var(--true-black)' }
  },
  {
    label: 'games',
    href: '#',
    ariaLabel: 'Games',
    rotation: 8,
    hoverStyles: { bgColor: 'var(--accent-yellow)', textColor: 'var(--true-black)' }
  },
  {
    label: 'tables',
    href: '#',
    ariaLabel: 'Tables',
    rotation: -6,
    hoverStyles: { bgColor: 'var(--ui-blue)', textColor: 'var(--true-black)' }
  },
  {
    label: 'tournaments',
    href: '#',
    ariaLabel: 'Tournaments',
    rotation: 6,
    hoverStyles: { bgColor: 'var(--accent-cyan)', textColor: 'var(--true-black)' }
  },
  {
    label: 'contact',
    href: '#',
    ariaLabel: 'Contact',
    rotation: -8,
    hoverStyles: { bgColor: 'var(--ui-pink)', textColor: 'var(--true-black)' }
  }
]

export default function BubbleMenu({
  logo,
  actions,
  onMenuClick,
  className,
  style,
  menuAriaLabel = 'Toggle menu',
  menuBg = '#fff',
  menuContentColor = '#111',
  useFixedPosition = false,
  items,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.12
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  const overlayRef = useRef(null)
  const bubblesRef = useRef([])
  const labelRefs = useRef([])

  const menuItems = items?.length ? items : DEFAULT_ITEMS

  const containerClassName = [
    'bubble-menu',
    useFixedPosition ? 'fixed' : 'absolute',
    'left-0 right-0 top-3 sm:top-5 md:top-6',
    'flex items-center justify-between',
    'gap-2 sm:gap-3 px-3 sm:px-6 md:px-8',
    'pointer-events-none',
    'z-[1001]',
    'w-full max-w-[1700px] mx-auto',
    className
  ]
    .filter(Boolean)
    .join(' ')

  const handleToggle = () => {
    const nextState = !isMenuOpen
    if (nextState) setShowOverlay(true)
    setIsMenuOpen(nextState)
    onMenuClick?.(nextState)
  }

  useEffect(() => {
    const overlay = overlayRef.current
    const bubbles = bubblesRef.current.filter(Boolean)
    const labels = labelRefs.current.filter(Boolean)
    if (!overlay || !bubbles.length) return

    if (isMenuOpen) {
      gsap.set(overlay, { display: 'flex' })
      gsap.killTweensOf([...bubbles, ...labels])
      gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' })
      gsap.set(labels, { y: 24, autoAlpha: 0 })

      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 900
      bubbles.forEach((bubble, i) => {
        const item = menuItems[i]
        const targetRotation = isDesktop ? (item?.rotation ?? 0) : 0
        const delay = i * staggerDelay + gsap.utils.random(-0.03, 0.03)
        const tl = gsap.timeline({ delay })
        tl.to(bubble, {
          scale: 1,
          rotation: targetRotation,
          duration: animationDuration,
          ease: animationEase
        })
        if (labels[i]) {
          tl.to(
            labels[i],
            {
              y: 0,
              autoAlpha: 1,
              duration: animationDuration,
              ease: 'power3.out'
            },
            '-=' + animationDuration * 0.9
          )
        }
      })
    } else {
      gsap.killTweensOf([...bubbles, ...labels])
      gsap.to(labels, {
        y: 24,
        autoAlpha: 0,
        duration: 0.2,
        ease: 'power3.in'
      })
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.2,
        ease: 'power3.in',
        onComplete: () => {
          if (!isMenuOpen) {
            setShowOverlay(false)
            gsap.set(overlay, { display: 'none' })
          }
        }
      })
    }
  }, [isMenuOpen, animationDuration, animationEase, staggerDelay, menuItems])

  useEffect(() => {
    const handleResize = () => {
      if (isMenuOpen) {
        const bubbles = bubblesRef.current.filter(Boolean)
        const isDesktop = window.innerWidth >= 900
        bubbles.forEach((bubble, i) => {
          const item = menuItems[i]
          if (bubble && item) {
            const rotation = isDesktop ? (item.rotation ?? 0) : 0
            gsap.set(bubble, { rotation })
          }
        })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMenuOpen, menuItems])

  return (
    <>
      <style>{`
        .bubble-menu .bubble {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background-color 0.2s ease;
        }
        .bubble-menu .menu-btn:hover {
          transform: translateY(-2px) scale(1.04);
        }
        .bubble-menu .menu-btn:active {
          transform: translate(2px, 2px) scale(0.96);
          box-shadow: none;
        }
        .bubble-menu .menu-line {
          transition: transform 0.3s ease, opacity 0.3s ease;
          transform-origin: center;
        }
        .bubble-menu-items .pill-link {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.2s ease,
                      color 0.2s ease;
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):nth-last-child(2) {
          margin-left: calc(100% / 6);
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):last-child {
          margin-left: calc(100% / 3);
        }
        @media (min-width: 900px) {
          .bubble-menu-items .pill-link {
            transform: rotate(var(--item-rot));
          }
          .bubble-menu-items .pill-link:hover {
            transform: rotate(var(--item-rot)) scale(1.06);
            background: var(--hover-bg) !important;
            color: var(--hover-color) !important;
          }
          .bubble-menu-items .pill-link:active {
            transform: rotate(var(--item-rot)) scale(.94);
          }
        }
        @media (max-width: 899px) {
          .bubble-menu-items {
            padding-top: 90px;
            padding-bottom: 30px;
            align-items: center;
            justify-content: center;
          }
          .bubble-menu-items .pill-list {
            row-gap: 10px;
            padding-left: 16px;
            padding-right: 16px;
            max-width: 440px;
            width: 100%;
          }
          .bubble-menu-items .pill-list .pill-col {
            flex: 0 0 100% !important;
            margin-left: 0 !important;
            overflow: visible;
          }
          .bubble-menu-items .pill-link {
            transform: none !important;
            --item-rot: 0deg !important;
            font-size: clamp(1.2rem, 5vw, 1.8rem) !important;
            padding: 0.85rem 0 !important;
            min-height: 56px !important;
            height: auto !important;
            border-radius: 0px !important;
            box-shadow: 4px 4px 0px #050505 !important;
          }
          .bubble-menu-items .pill-link:hover {
            transform: translateY(-2px) !important;
            background: var(--hover-bg) !important;
            color: var(--hover-color) !important;
          }
          .bubble-menu-items .pill-link:active {
            transform: translate(2px, 2px) !important;
            box-shadow: 1px 1px 0px #050505 !important;
          }
        }
      `}</style>

      <nav className={containerClassName} style={style} aria-label="Main navigation">
        {/* Left: Logo bubble */}
        <div className="flex items-center pointer-events-auto shrink-0 z-20">
          <div
            className="bubble logo-bubble inline-flex items-center justify-center brutal-window pointer-events-auto h-11 sm:h-12 md:h-14 px-2.5 sm:px-3.5 rounded-none will-change-transform bg-white shadow-[3px_3px_0px_#050505] sm:shadow-[4px_4px_0px_#050505] overflow-hidden"
            aria-label="Logo"
          >
            <span className="logo-content inline-flex items-center justify-center font-display font-black text-true-black">
              {typeof logo === 'string' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Logo" className="max-h-[85%] max-w-full object-contain block" />
              ) : (
                logo
              )}
            </span>
          </div>
        </div>

        {/* Center: Action Buttons HUD (Centered in the middle of the screen on desktop) */}
        {actions && (
          <div className="pointer-events-auto flex items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 md:absolute md:left-1/2 md:-translate-x-1/2 z-20">
            {actions}
          </div>
        )}

        {/* Right: Hamburger Toggle Button */}
        <div className="flex items-center pointer-events-auto shrink-0 z-20">
          <button
            type="button"
            className={[
              'bubble toggle-bubble menu-btn brutal-btn',
              'inline-flex flex-col items-center justify-center',
              'pointer-events-auto bg-ui-pink',
              'w-11 h-11 sm:w-12 sm:h-12 md:h-14 md:w-14',
              'border-[3px] sm:border-[4px] border-true-black cursor-pointer p-0',
              'shadow-[3px_3px_0px_#050505] sm:shadow-[4px_4px_0px_#050505]',
              'will-change-transform shrink-0'
            ].join(' ')}
            onClick={handleToggle}
            aria-label={menuAriaLabel}
            aria-pressed={isMenuOpen}
          >
            <span
              className="menu-line block mx-auto rounded-none"
              style={{
                width: 20,
                height: 3,
                background: 'var(--true-black)',
                transform: isMenuOpen ? 'translateY(4.5px) rotate(45deg)' : 'none'
              }}
            />
            <span
              className="menu-line short block mx-auto rounded-none"
              style={{
                marginTop: '4.5px',
                width: 20,
                height: 3,
                background: 'var(--true-black)',
                transform: isMenuOpen ? 'translateY(-4.5px) rotate(-45deg)' : 'none'
              }}
            />
          </button>
        </div>
      </nav>

      {showOverlay && (
        <div
          ref={overlayRef}
          className={[
            'bubble-menu-items',
            useFixedPosition ? 'fixed' : 'absolute',
            'inset-0',
            'flex items-center justify-center',
            'z-[1000]'
          ].join(' ')}
          aria-hidden={!isMenuOpen}
        >
          {/* Glass Backdrop Blur Overlay */}
          <div
            className="absolute inset-0 bg-true-black/60 backdrop-blur-md transition-opacity duration-300 pointer-events-auto"
            onClick={handleToggle}
          />

          <ul
            className="pill-list list-none m-0 px-6 w-full max-w-[1600px] mx-auto flex flex-wrap gap-x-0 gap-y-1 pointer-events-auto relative z-10"
            role="menu"
            aria-label="Menu links"
          >
            {menuItems.map((item, idx) => (
              <li
                key={idx}
                role="none"
                className="pill-col flex justify-center items-stretch [flex:0_0_calc(100%/3)] box-border"
              >
                <a
                  role="menuitem"
                  href={item.href || '#'}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault()
                      item.onClick()
                      handleToggle()
                    }
                  }}
                  aria-label={item.ariaLabel || item.label}
                  className="pill-link brutal-btn w-full no-underline bg-white text-inherit flex items-center justify-center relative box-border whitespace-nowrap overflow-hidden font-display uppercase tracking-tighter"
                  style={{
                    '--item-rot': `${item.rotation ?? 0}deg`,
                    '--pill-bg': '#ffffff',
                    '--pill-color': 'var(--true-black)',
                    '--hover-bg': item.hoverStyles?.bgColor || 'var(--accent-yellow)',
                    '--hover-color': item.hoverStyles?.textColor || 'var(--true-black)',
                    background: 'var(--pill-bg)',
                    color: 'var(--pill-color)',
                    minHeight: 'var(--pill-min-h, 160px)',
                    padding: 'clamp(1.5rem, 3vw, 8rem) 0',
                    fontSize: 'clamp(1.5rem, 4vw, 4rem)',
                    fontWeight: 900,
                    lineHeight: 0,
                    willChange: 'transform',
                    height: 10
                  }}
                  ref={el => { if (el) bubblesRef.current[idx] = el }}
                >
                  <span
                    className="pill-label inline-block"
                    style={{ willChange: 'transform, opacity', height: '1.2em', lineHeight: 1.2 }}
                    ref={el => { if (el) labelRefs.current[idx] = el }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
