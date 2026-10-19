import { describe, expect, it } from 'vitest'
import { searchByName } from './name-search'

const drinks = [
  { name: 'BURN Яблоко, киви' },
  { name: 'Adrenaline Rush' },
  { name: 'Monster Energy Ultra' },
  { name: 'Ёлка Зеро' },
]
const names = (q: string) => searchByName(drinks, q).map((d) => d.name)

describe('searchByName', () => {
  it('пустой запрос — все, в исходном порядке', () => {
    expect(names('  ')).toEqual(drinks.map((d) => d.name))
  })

  it('слова в любом порядке, регистр не важен', () => {
    expect(names('киви burn')).toEqual(['BURN Яблоко, киви'])
  })

  it('прощает опечатки', () => {
    expect(names('burm')).toEqual(['BURN Яблоко, киви'])
    expect(names('monstr')).toEqual(['Monster Energy Ultra'])
    expect(names('adrenalin')).toEqual(['Adrenaline Rush'])
  })

  it('ё и е не различаются', () => {
    expect(names('елка')).toEqual(['Ёлка Зеро'])
  })

  it('каждое слово должно найтись: лишнее слово сужает выдачу', () => {
    expect(names('monster киви')).toEqual([])
  })

  it('спецсимволы расширенного поиска Fuse не ломают запрос', () => {
    expect(names("'burn |")).toEqual(['BURN Яблоко, киви'])
    expect(names('!!!')).toEqual(drinks.map((d) => d.name))
  })

  it('совсем другое слово не находит ничего', () => {
    expect(names('кофе')).toEqual([])
  })
})
