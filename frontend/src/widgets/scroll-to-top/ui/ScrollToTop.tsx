'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY

    function onScroll() {
      const currentY = window.scrollY
      setVisible(currentY < lastY && currentY > 300)
      lastY = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.18 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full glass border border-neon-blue/40 text-neon-cyan shadow-lg hover:bg-neon-blue/20 transition-colors"
          aria-label="Наверх"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
