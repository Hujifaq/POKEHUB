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
    'left-0 right-0 top-8',
    'flex items-center justify-between',
    'gap-4 px-8',
    'pointer-events-none',
    'z-[1001]',
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

      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05)
        const tl = gsap.timeline({ delay })
        tl.to(bubble, {
          scale: 1,
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
    } else if (showOverlay) {
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
          gsap.set(overlay, { display: 'none' })
          setShowOverlay(false)
        }
      })
    }
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay])

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
        .bubble-menu .menu-line {
          transition: transform 0.3s ease, opacity 0.3s ease;
          transform-origin: center;
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
            padding-top: 120px;
            align-items: flex-start;
          }
          .bubble-menu-items .pill-list {
            row-gap: 16px;
          }
          .bubble-menu-items .pill-list .pill-col {
            flex: 0 0 100% !important;
            margin-left: 0 !important;
            overflow: visible;
          }
          .bubble-menu-items .pill-link {
            font-size: clamp(1.2rem, 3vw, 4rem);
            padding: clamp(1rem, 2vw, 2rem) 0;
            min-height: 80px !important;
          }
          .bubble-menu-items .pill-link:hover {
            transform: scale(1.06);
            background: var(--hover-bg);
            color: var(--hover-color);
          }
          .bubble-menu-items .pill-link:active {
            transform: scale(.94);
          }
        }
      `}</style>

      <nav className={containerClassName} style={style} aria-label="Main navigation">
        {/* Logo bubble */}
        <div
          className="bubble logo-bubble inline-flex items-center justify-center brutal-window pointer-events-auto h-12 md:h-14 px-4 md:px-8 gap-2 will-change-transform bg-white"
          aria-label="Logo"
          style={{ minHeight: '48px' }}
        >
          <span className="logo-content inline-flex items-center justify-center font-display font-black text-true-black">
            {typeof logo === 'string' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Logo" className="max-h-[60%] max-w-full object-contain block" />
            ) : (
              logo
            )}
          </span>
        </div>

        {/* Hamburger toggle bubble */}
        <button
          type="button"
          className={[
            'bubble toggle-bubble menu-btn brutal-btn',
            'inline-flex flex-col items-center justify-center',
            'pointer-events-auto bg-ui-pink',
            'w-12 h-12 md:w-14 md:h-14',
            'border-[4px] border-true-black cursor-pointer p-0',
            'will-change-transform'
          ].join(' ')}
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-pressed={isMenuOpen}
        >
          <span
            className="menu-line block mx-auto rounded-none"
            style={{
              width: 26,
              height: 4,
              background: 'var(--true-black)',
              transform: isMenuOpen ? 'translateY(5px) rotate(45deg)' : 'none'
            }}
          />
          <span
            className="menu-line short block mx-auto rounded-none"
            style={{
              marginTop: '6px',
              width: 26,
              height: 4,
              background: 'var(--true-black)',
              transform: isMenuOpen ? 'translateY(-5px) rotate(-45deg)' : 'none'
            }}
          />
        </button>
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
