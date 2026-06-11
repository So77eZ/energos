/** Тир напитка S/A/B/C/D — кросс-доменный примитив (drink, catalog-search, filter).
 *  Живёт в shared, чтобы catalog-search (shared) не зависел от entities/drink. */
export type Tier = 'S' | 'A' | 'B' | 'C' | 'D'
