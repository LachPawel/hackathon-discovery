'use client'

import { motion } from 'framer-motion'

export function CrownAnimation() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Rotating circle border */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-yellow-500/50"
        animate={{ rotate: 360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      {/* Pulsing circle background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Crown icon with animated shine */}
      <div className="relative z-10">
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-yellow-400"
        >
          {/* Crown shape */}
          <motion.path
            d="M5 16L3 10L7.5 12L12 7L16.5 12L21 10L19 16H5Z"
            fill="currentColor"
            initial={{ scale: 1, y: 0 }}
            animate={{
              scale: [1, 1.1, 1],
              y: [0, -2, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          {/* Shine overlay */}
          <motion.rect
            x="0"
            y="0"
            width="24"
            height="24"
            fill="url(#shine-gradient)"
            initial={{ x: -24 }}
            animate={{
              x: [24, -24],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 0.5
            }}
            style={{
              mask: 'url(#crown-mask)',
              WebkitMask: 'url(#crown-mask)'
            }}
          />
          
          <defs>
            <linearGradient id="shine-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <mask id="crown-mask">
              <path
                d="M5 16L3 10L7.5 12L12 7L16.5 12L21 10L19 16H5Z"
                fill="white"
              />
            </mask>
          </defs>
        </motion.svg>
      </div>

      {/* Animated particles around crown */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            originX: 0.5,
            originY: 0.5
          }}
          animate={{
            x: [0, Math.cos((i * Math.PI) / 3) * 20, Math.cos((i * Math.PI) / 3) * 20, 0],
            y: [0, Math.sin((i * Math.PI) / 3) * 20, Math.sin((i * Math.PI) / 3) * 20, 0],
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
}
