export const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
]

/** true, если последние KONAMI.length клавиш буфера совпадают (b/a без регистра). */
export function matchKonami(recent: string[]): boolean {
  if (recent.length < KONAMI.length) return false
  const tail = recent.slice(-KONAMI.length)
  return tail.every((k, i) => k.toLowerCase() === KONAMI[i].toLowerCase())
}
