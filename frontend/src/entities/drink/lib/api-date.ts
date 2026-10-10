/** Дата из API → ISO 8601 в UTC. Бэк отдаёт `datetime` без часового пояса
 *  (`2026-10-10T12:59:25.267857`, в БД это UTC); `Date.parse` такую строку считает локальной
 *  и сдвигает на часовой пояс клиента. Строки уже с зоной (`Z`, `+03:00`) не трогаем. */
export function toUtcIso(value: string | null | undefined): string | null {
  if (!value) return null
  return /(Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`
}
