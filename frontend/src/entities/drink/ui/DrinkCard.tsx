'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Droplets, Star, CandyOff } from 'lucide-react'
import { ROUTES } from '@shared/config/routes'
import type { Drink } from '../model/types'

interface DrinkCardProps {
  drink: Drink
  index?: number
  rating?: number | null
  accentColor?: string | null
}

export function DrinkCard({ drink, index = 0, rating, accentColor }: DrinkCardProps) {
  const rgb = accentColor ?? '0,102,204'
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: 'easeOut',
        scale: { duration: 0.2, delay: 0, ease: 'easeOut' },
        boxShadow: { duration: 0.2, delay: 0, ease: 'easeOut' },
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 0 30px rgba(${rgb}, 0.35), 0 0 60px rgba(${rgb}, 0.12), 0 8px 32px rgba(0,0,0,0.55)`,
      }}
      className="glass rounded-xl overflow-hidden flex flex-col shadow-card"
    >
      <Link href={ROUTES.reviews(drink.id)} className="flex flex-col flex-1">
        {/* Image */}
        <div
          className="relative h-36 sm:h-48 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(to bottom, rgba(${rgb}, 0.12), transparent)` }}
        >
          {drink.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={drink.image_url}
              alt={drink.name}
              className="absolute inset-0 w-full h-full object-contain p-3 sm:p-4"
            />
          ) : (
            <Zap className="w-10 h-10 sm:w-14 sm:h-14 text-neon-cyan/20" />
          )}

          {drink.no_sugar && (
            <>
              <span className="absolute top-2 right-2 sm:hidden p-1 rounded-full bg-neon-green/15 border border-neon-green/40 text-neon-green">
                <CandyOff className="w-3.5 h-3.5" />
              </span>
              <span className="absolute top-2 right-2 hidden sm:inline-flex text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-neon-green/15 text-neon-green border border-neon-green/40">
                Без сахара
              </span>
            </>
          )}
        </div>

        {/* Body */}
        <div className="p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-[#f0f0f5] leading-snug line-clamp-2">
            {drink.name}
          </h3>

          <div className="flex items-center justify-between mt-auto pt-1.5 sm:pt-2">
            {drink.price != null ? (
              <p className="shrink-0 text-neon-pink font-semibold text-xs sm:text-sm flex items-center gap-1">
                <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70" />
                {drink.price.toFixed(2)} ₽
              </p>
            ) : (
              <span />
            )}

            {rating != null ? (
              <span className="flex items-center gap-1 text-xs shrink-0">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-neon-pink text-neon-pink" />
                <span className="text-neon-pink font-semibold">{rating}</span>
              </span>
            ) : (
              <span className="ml-auto text-[10px] sm:text-xs text-neon-cyan/70 font-medium text-right leading-tight max-w-[4rem] sm:max-w-none">
                Оцените первым!
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
