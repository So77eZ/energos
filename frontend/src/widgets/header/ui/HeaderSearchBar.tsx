'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'
import { useCatalogSearch } from '@shared/lib/catalog-search'

const SEARCH_PAGES = ['/', '/admin/drinks', '/profile', '/drinks', '/taste-map']
const FILTER_PAGES = ['/', '/taste-map']
const PLACEHOLDER = 'Поиск напитка, бренда, метрики…'

export function HeaderSearchBar(
  { forceInput = false, onSubmit }: { forceInput?: boolean; onSubmit?: () => void } = {},
) {
  const pathname = usePathname()
  const router = useRouter()
  const { search, setSearch, filterOpen, setFilterOpen, noSugarOnly, sort, searchItems } = useCatalogSearch()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isReviews = pathname === '/drinks'
  // Live-результаты (dropdown) показываем на /drinks и в мобильном оверлее
  // (forceInput): там каталог скрыт за оверлеем, нужен видимый список совпадений.
  const showResults = isReviews || forceInput
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

  // На страницах без поиска (/glossary, /compare, /tier, /submit, /auth/...) —
  // рендерим ту же визуальную плашку, но как Link на каталог. Так header
  // одинаков на всех страницах; навигация не сдвигается влево из-за пустого
  // слота, и юзер при клике сразу попадает туда где поиск работает.
  if (!forceInput && !SEARCH_PAGES.includes(pathname)) {
    return (
      <div className="hdr-search">
        <Link href={ROUTES.home} className="search search-link" title="Поиск напитков в каталоге">
          <Icons.search w={14} />
          <span className="search-placeholder">Поиск напитков</span>
          <kbd>⌘K</kbd>
        </Link>
      </div>
    )
  }

  const matchingItems = showResults && search
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
            if (showResults) setDropdownOpen(true)
          }}
          onFocus={() => { if (showResults && search) setDropdownOpen(true) }}
          onKeyDown={(e) => {
            // В мобильном оверлее submit (Enter / кнопка «Поиск» клавиатуры)
            // закрывает оверлей — иначе он перекрывает отфильтрованный каталог.
            if (e.key === 'Enter') { e.preventDefault(); onSubmit?.() }
          }}
        />
        <kbd>⌘K</kbd>

        {showResults && dropdownOpen && matchingItems.length > 0 && (
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
                    onSubmit?.()
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
