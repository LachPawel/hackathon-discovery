"use client"

import { SpiralAnimation } from "@/components/ui/spiral-animation"
import { useState, useEffect } from 'react'
import { Header, HeroContent, PulsingCircle, ShaderBackground } from "@/components/ui/shaders-hero-section"
import HeroSection02 from "@/components/ui/ruixen-hero-section-02"

export default function Home() {
  const [showSpiral, setShowSpiral] = useState(true)
  const [startVisible, setStartVisible] = useState(false)

  // Handle navigation to main content
  const navigateToMain = () => {
    setShowSpiral(false)
  }

  // Fade in the start button after animation loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (showSpiral) {
    return (
      <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
        {/* Spiral Animation */}
        <div className="absolute inset-0">
          <SpiralAnimation />
        </div>

        {/* Simple Elegant Text Button with Pulsing Effect */}
        <div
          className={`
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
            transition-all duration-1500 ease-out
            ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <button
            onClick={navigateToMain}
            className="
              text-white text-2xl tracking-[0.2em] uppercase font-extralight
              transition-all duration-700
              hover:tracking-[0.3em] animate-pulse
              cursor-pointer
            "
          >
            Enter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Main Hero Section with Shader Background */}
      <ShaderBackground>
        <Header />
        <HeroContent />
        <PulsingCircle />
      </ShaderBackground>

      {/* Secondary Hero Section */}
      <HeroSection02 />
    </div>
  )
}

