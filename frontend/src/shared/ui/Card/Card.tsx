import type { HTMLAttributes } from 'react'

type GlowColor = 'blue' | 'cyan' | 'pink'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: GlowColor
}

const glowClasses: Record<GlowColor, string> = {
  blue: 'hover:shadow-glow-blue hover:border-neon-blue/60',
  cyan: 'hover:shadow-glow-cyan hover:border-neon-cyan/60',
  pink: 'hover:shadow-glow-pink hover:border-neon-pink/60',
}

export function Card({ children, className = '', glow = 'cyan', ...props }: CardProps) {
  return (
    <div
      className={`glass rounded-xl shadow-card transition-all duration-300 ${glowClasses[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
