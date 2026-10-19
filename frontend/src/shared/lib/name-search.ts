import Fuse, { type IFuseOptions } from 'fuse.js'

const OPTIONS: IFuseOptions<{ name: string }> = {
  keys: ['name'],
  threshold: 0.35, // выше — находит лишнее, ниже — перестаёт прощать опечатки
  ignoreLocation: true, // слово может стоять где угодно в названии
  ignoreDiacritics: true, // «елка» находит «Ёлка»
  useExtendedSearch: true, // пробел = «И»: каждое слово ищется отдельно, порядок не важен
}

/** Поиск по названию с опечатками: «burm киви» находит «BURN Яблоко, киви». Слова в любом
 *  порядке, каждое ищется нечётко. Пустой запрос — все элементы как есть; иначе — по релевантности.
 *  shortcut: прощает пропущенную/лишнюю/заменённую букву, но не перестановку соседних в коротком
 *  слове («tset») и не другой алфавит («монстр» ≠ «Monster»); если понадобится — транслитерация
 *  и расстояние Дамерау–Левенштейна вместо Fuse. */
export function searchByName<T extends { name: string }>(items: readonly T[], query: string): T[] {
  // Спецсимволы расширенного поиска Fuse (' = ! ^ $ |) убираем: пользователь ищет слова, а не синтаксис.
  const words = query.replace(/['=!^$|]/g, ' ').split(/\s+/).filter(Boolean)
  if (words.length === 0) return [...items]
  return new Fuse(items, OPTIONS).search(words.join(' ')).map((r) => r.item)
}
