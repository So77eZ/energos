'use client'

import { useRef, useEffect, useState } from 'react'
import { Search, SlidersHorizontal, Zap } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCatalogSearch } from '@shared/lib/catalog-search'
import { ROUTES } from '@shared/config/routes'

const SEARCH_PAGES = ['/', '/admin/drinks', '/profile', '/drinks', '/taste-map']

const PLACEHOLDER = 'Поиск…'

export function HeaderSearchBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { search, setSearch, filterOpen, setFilterOpen, noSugarOnly, sort, searchItems } = useCatalogSearch()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isCatalog = pathname === '/'
  const isTasteMap = pathname === '/taste-map'
  const isReviews = pathname === '/drinks'
  const hasActiveFilters = noSugarOnly || sort !== 'name'

  useEffect(() => {
    if (!dropdownOpen) return
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [dropdownOpen])

  if (!SEARCH_PAGES.includes(pathname)) return null

  const matchingItems = isReviews && search
    ? searchItems.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
    : []

  return (
    <>
      <div className="relative flex-1 min-w-0" ref={containerRef}>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9090a8] pointer-events-none" />
        <input
          type="search"
          id="header-search"
          name="search"
          placeholder={PLACEHOLDER}
          value={search}
          onChange={(e) => { setSearch(e.target.value); if (isReviews) setDropdownOpen(true) }}
          onFocus={() => { if (isReviews && search) setDropdownOpen(true) }}
          className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[#f0f0f5] placeholder-[#9090a8] focus:outline-none focus:border-neon-blue/50 transition-colors"
        />

        {/* Dropdown for reviews page */}
        {isReviews && dropdownOpen && matchingItems.length > 0 && (
          <ul className="absolute left-0 right-0 top-full mt-1 glass rounded-xl overflow-hidden z-[60] max-h-60 overflow-y-auto shadow-lg">
            {matchingItems.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => {
                    router.push(ROUTES.reviews(d.id))
                    setDropdownOpen(false)
                    setSearch('')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center bg-white/5 rounded overflow-hidden">
                    {d.image_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={d.image_url} alt={d.name} className="w-full h-full object-contain" />
                      : <Zap className="w-3 h-3 text-neon-cyan/40" />}
                  </div>
                  <span className="text-sm text-[#f0f0f5] truncate">{d.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(isCatalog || isTasteMap) && (
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors border shrink-0 ${
            hasActiveFilters
              ? 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/40'
              : 'text-[#9090a8] bg-white/5 border-white/10 hover:text-neon-cyan hover:border-neon-cyan/30'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neon-cyan" />}
        </button>
      )}
    </>
  )
}
