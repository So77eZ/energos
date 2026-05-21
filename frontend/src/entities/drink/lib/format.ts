// Drink name cleanup — strips Russian category prefixes/suffixes and volume tails
// that the importer left in (e.g. "Напиток энергетический ФЛЭШ АП ... 0.45л").
// Pure client-side fallback until the backend pre-processes names; see
// improvements.md → «Обрезать префикс „Напиток энергетический"».

const PREFIX_WORDS = [
  'напиток',
  'энергетический',
  'энергетическая',
  'энергетическое',
  'безалкогольный',
  'безалкогольная',
  'тонизирующий',
  'тонизирующая',
  'тонизирующее',
  'газированный',
  'газированная',
  'газированное',
  'сильногазированный',
  'сильногазированная',
  'слабогазированный',
  'негазированный',
]

const SUFFIX_WORDS = [
  'газированный',
  'газированная',
  'газированное',
  'негазированный',
  'сильногазированный',
  'тонизирующий',
  'безалкогольный',
]

const PREFIX_RE = new RegExp(`^(?:${PREFIX_WORDS.join('|')})\\s+`, 'iu')
// Trailing volume markers like ", 0.45 л", " 1л", " 0,5л"
const VOLUME_RE = /[,\s]+\d+(?:[.,]\d+)?\s*л\.?$/iu
const SUFFIX_RE = new RegExp(`[,\\s]+(?:${SUFFIX_WORDS.join('|')})$`, 'iu')

export function cleanDrinkName(name: string): string {
  let n = name.trim()
  // Strip leading category words iteratively (handles "Напиток энергетический X").
  for (let i = 0; i < 6; i++) {
    const next = n.replace(PREFIX_RE, '')
    if (next === n) break
    n = next
  }
  // Strip trailing volume + descriptor words in any order.
  for (let i = 0; i < 6; i++) {
    const prev = n
    n = n.replace(VOLUME_RE, '').trim()
    n = n.replace(SUFFIX_RE, '').trim()
    if (n === prev) break
  }
  return n.trim() || name.trim()
}

/**
 * Split a cleaned drink name into brand + variant.
 *
 * Heuristic: brand = leading run of all-uppercase tokens (Latin or Cyrillic).
 * "RED BULL Red Edition" → brand "RED BULL", variant "Red Edition".
 * "Adrenaline Rush" → no all-caps prefix → brand falls back, variant = full name.
 */
export function splitDrinkBrand(cleanedName: string, fallbackBrand = 'ENERGOS'): { brand: string; variant: string } {
  const tokens = cleanedName.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return { brand: fallbackBrand, variant: cleanedName }

  const brandTokens: string[] = []
  for (const t of tokens) {
    // All-uppercase test that accepts Latin + Cyrillic, digits, dots and hyphens.
    if (/^[A-ZА-ЯЁ0-9.\-]+$/u.test(t)) {
      brandTokens.push(t)
    } else {
      break
    }
  }

  if (brandTokens.length === 0) {
    return { brand: fallbackBrand, variant: cleanedName }
  }
  const variant = tokens.slice(brandTokens.length).join(' ').trim()
  return {
    brand: brandTokens.join(' '),
    variant: variant || cleanedName,
  }
}
