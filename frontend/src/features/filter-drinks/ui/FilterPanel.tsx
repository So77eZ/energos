'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { useCatalogSearch, type SortOption } from '@shared/lib/catalog-search'

export function FilterPanel() {
  const { sort, setSort, noSugarOnly, setNoSugarOnly, filterOpen, setFilterOpen } = useCatalogSearch()
  const hasActive = noSugarOnly || sort !== 'name'

  return (
    <AnimatePresence>
      {filterOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-x-4 top-16 z-50 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-80"
          >
            <div className="glass rounded-2xl shadow-glow-blue overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 className="font-semibold text-[#f0f0f5] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-neon-cyan" />
                  Фильтры
                </h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-1.5 rounded-lg text-[#9090a8] hover:text-[#f0f0f5] hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-[#9090a8]">Сортировка</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-sm text-[#f0f0f5] focus:outline-none focus:border-neon-blue/50 transition-colors"
                  >
                    <option value="name">По названию</option>
                    <option value="price_asc">Сначала дешевле</option>
                    <option value="price_desc">Сначала дороже</option>
                  </select>
                </div>

                <label className="flex items-center justify-between py-2 cursor-pointer select-none">
                  <span className="text-sm text-[#f0f0f5]">Только без сахара</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={noSugarOnly}
                      onChange={(e) => setNoSugarOnly(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-white/10 rounded-full peer-checked:bg-neon-green/30 border border-white/10 peer-checked:border-neon-green/50 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-[#9090a8] rounded-full peer-checked:translate-x-4 peer-checked:bg-neon-green transition-all" />
                  </div>
                </label>
              </div>

              {hasActive && (
                <div className="px-5 pb-4">
                  <button
                    onClick={() => { setSort('name'); setNoSugarOnly(false) }}
                    className="w-full py-2 rounded-lg text-sm text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/10 transition-colors"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
