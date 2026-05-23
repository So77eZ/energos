'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'
import { useCatalogSearch } from '@shared/lib/catalog-search'

const SEARCH_PAGES = ['/', '/admin/drinks', '/profile', '/drinks', '/taste-map']
const FILTER_PAGES = ['/', '/taste-map']
const PLACEHOLDER = 'Поиск напитка, бренда, метрики…'

export function HeaderSearchBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { search, setSearch, filterOpen, setFilterOpen, noSugarOnly, sort, searchItems } = useCatalogSearch()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isReviews = pathname === '/drinks'
  const showFilterToggle = FILTER_PAGES.includes(pathname)
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
    <div className="hdr-search" ref={containerRef}>
      <div className="search">
        <Icons.search w={14} />
        <input
          type="search"
          id="header-search"
          name="search"
          placeholder={PLACEHOLDER}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            if (isReviews) setDropdownOpen(true)
          }}
          onFocus={() => { if (isReviews && search) setDropdownOpen(true) }}
        />
        <kbd>⌘K</kbd>

        {isReviews && dropdownOpen && matchingItems.length > 0 && (
          <ul className="search-dropdown" role="listbox">
            {matchingItems.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className="search-dropdown-item"
                  onClick={() => {
                    router.push(ROUTES.reviews(d.id))
                    setDropdownOpen(false)
                    setSearch('')
                  }}
                >
                  <span className="search-dropdown-thumb">
                    {d.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.image_url} alt={d.name} />
                    ) : (
                      <Icons.bolt w={12} />
                    )}
                  </span>
                  <span className="search-dropdown-name">{d.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showFilterToggle && (
        <button
          type="button"
          className={`hdr-filter-btn${hasActiveFilters ? ' active' : ''}`}
          onClick={() => setFilterOpen(!filterOpen)}
          aria-label="Фильтры"
          aria-pressed={filterOpen}
        >
          <Icons.sliders w={16} />
          {hasActiveFilters && <span className="hdr-filter-dot" />}
        </button>
      )}
    </div>
  )
}
