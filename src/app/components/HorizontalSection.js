"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function HorizontalSection() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current

    if (!section || !track) return

    // Get the total width of the track minus the viewport width
    const getScrollAmount = () => {
      let trackWidth = track.scrollWidth
      return -(trackWidth - window.innerWidth)
    }

    const tween = gsap.to(track, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        scrub: 1, // Smooth scrubbing
        invalidateOnRefresh: true, // Recalculate on resize
      }
    })

    return () => {
      tween.kill()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} className="h-screen w-full bg-[#f9f6e8] overflow-hidden flex items-center relative">
      <div 
        ref={trackRef} 
        className="flex w-max items-center h-full px-20 gap-32"
      >
        {/* Slide 1 */}
        <div className="w-[80vw] flex-shrink-0 text-center">
          <h2 className="text-7xl md:text-9xl font-medium tracking-tight text-black mb-4">
            MANA ? POKER ?
          </h2>
          <h2 className="text-7xl md:text-9xl font-medium tracking-tight text-black">
            WHAT ARE WE TALKING ABOUT?
          </h2>
          <p className="mt-8 text-xl text-gray-700">(we're going to talk about real things)</p>
        </div>

        {/* Slide 2 */}
        <div className="w-[50vw] flex-shrink-0 flex justify-center items-center">
          <div className="bg-[#1f5924] rounded-t-3xl rounded-b-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10">
            <div className="bg-[#1f5924] text-white p-6 text-center text-3xl font-bold tracking-wider">
              NATURAL PLAY
            </div>
            <div className="bg-white p-12 text-center relative h-[600px]">
              <p className="text-2xl text-gray-800 font-medium leading-relaxed z-10 relative">
                This certified organic card comes from the plant. A gift from Mother Nature.
              </p>
              {/* Graphic element */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#1f5924] opacity-20">
                <svg width="250" height="250" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 0 C77.6 0 100 22.4 100 50 C100 77.6 77.6 100 50 100 C22.4 100 0 77.6 0 50 C0 22.4 22.4 0 50 0 Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Slide 3 */}
        <div className="w-[50vw] flex-shrink-0 flex justify-center items-center">
          <div className="bg-[#e95a32] rounded-t-3xl rounded-b-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10">
            <div className="bg-[#e95a32] text-white p-6 text-center text-3xl font-bold tracking-wider">
              100% FOCUS
            </div>
            <div className="bg-white p-12 text-center relative h-[600px]">
              <p className="text-2xl text-gray-800 font-medium leading-relaxed z-10 relative">
                Stay sharp at the table with our natural energy blend.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
