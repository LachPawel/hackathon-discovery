import { PulsingBorder, MeshGradient } from "@/components/ui/shaders-fallback"
import { motion } from "framer-motion"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Hero } from "@/components/ui/animated-hero"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(false)
  
  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)
    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }
    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.muted = true
      video.loop = true
      video.playsInline = true
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Video autoplay prevented:', error)
        })
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="h-screen w-full relative overflow-hidden bg-black">
      {/* Video Background - Fullscreen */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%',
          minWidth: '100%',
          minHeight: '100%'
        }}
      >
        <source src="/video/bg.mp4" type="video/mp4" />
      </video>
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0 z-20">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>
      {/* Background Shaders - Minimal opacity to show video clearly */}
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-10 z-20"
        colors={["#000000", "#1a1a1a", "#0a0a0a", "#000000", "#0f0f0f"]}
        speed={0.3}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-5 z-20"
        colors={["#000000", "#ffffff", "#1a1a1a", "#000000"]}
        speed={0.2}
        wireframe="true"
        backgroundColor="transparent"
      />
      <div className="relative z-30">
        {children}
      </div>
    </div>
  )
}

export function PulsingCircle() {
  return (
    <div className="absolute bottom-8 right-8 z-30">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Pulsing Border Circle */}
        <PulsingBorder
          colors={["#ffffff", "#888888", "#ffffff", "#666666", "#ffffff", "#999999", "#ffffff"]}
          colorBack="#00000000"
          speed={1.5}
          roundness={1}
          thickness={0.1}
          softness={0.2}
          intensity={3}
          spotsPerColor={5}
          spotSize={0.1}
          pulse={0.1}
          smoke={0.3}
          smokeSize={4}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
          }}
        />
        {/* Rotating Text Around the Pulsing Border */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ transform: "scale(1.6)" }}
        >
          <defs>
            <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="text-sm fill-white/40">
            <textPath href="#circle" startOffset="0%">
              Hackathon Winning Projects • Hackathon Winning Projects • Hackathon Winning Projects •
            </textPath>
          </text>
        </motion.svg>
      </div>
    </div>
  )
}

interface HeroContentProps {
  onViewProjects?: () => void
  onMatchProjects?: () => void
}

export function HeroContent({ onViewProjects, onMatchProjects }: HeroContentProps) {
  return (
    <div className="relative z-40 w-full">
      <Hero 
        onMatchProjects={onMatchProjects}
        onViewProjects={onViewProjects}
      />
    </div>
  )
}

export function Header() {
  return (
    <header className="relative z-40 flex items-center justify-center p-6">
      {/* Logo - centered */}
      <div className="flex items-center">
        <img
          src="/logo.svg"
          alt="e2.vc"
          className="h-6 w-auto"
        />
      </div>
    </header>
  )
}

