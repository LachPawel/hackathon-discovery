import type React from "react"

// Fallback components in case @paper-design/shaders-react is not available
// These provide basic visual effects without WebGL shaders

export function MeshGradient({ 
  className, 
  colors, 
  speed, 
  backgroundColor,
  wireframe,
  ...props 
}: {
  className?: string
  colors?: string[]
  speed?: number
  backgroundColor?: string
  wireframe?: string | boolean
  [key: string]: unknown
}) {
  return (
    <div 
      className={className}
      style={{
        background: `radial-gradient(circle at 20% 50%, ${colors?.[0] || '#000000'} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${colors?.[1] || '#1a1a1a'} 0%, transparent 50%),
                     radial-gradient(circle at 40% 20%, ${colors?.[2] || '#0a0a0a'} 0%, transparent 50%),
                     ${backgroundColor || '#000000'}`,
        backgroundSize: '200% 200%',
        animation: wireframe ? 'gradient-shift 20s ease infinite' : 'none',
      }}
      {...props}
    />
  )
}

export function PulsingBorder({
  className,
  colors,
  colorBack,
  speed,
  roundness,
  thickness,
  softness,
  intensity,
  spotsPerColor,
  spotSize,
  pulse,
  smoke,
  smokeSize,
  scale,
  rotation,
  frame,
  style,
  ...props
}: {
  className?: string
  colors?: string[]
  colorBack?: string
  speed?: number
  roundness?: number
  thickness?: number
  softness?: number
  intensity?: number
  spotsPerColor?: number
  spotSize?: number
  pulse?: number
  smoke?: number
  smokeSize?: number
  scale?: number
  rotation?: number
  frame?: number
  style?: React.CSSProperties
  [key: string]: unknown
}) {
  return (
    <div
      className={className}
      style={{
        ...style,
        border: `${thickness || 2}px solid ${colors?.[0] || '#ffffff'}`,
        borderRadius: roundness ? `${roundness * 100}%` : '50%',
        boxShadow: `0 0 ${intensity || 10}px ${colors?.[0] || '#ffffff'}40`,
        animation: 'pulse-border 2s ease-in-out infinite',
      }}
      {...props}
    />
  )
}

