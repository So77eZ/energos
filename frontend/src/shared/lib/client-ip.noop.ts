/** Заглушка для клиентского бандла и SSR клиентских компонентов: IP клиента определяет только
 *  сервер Next (см. client-ip.ts). Подмена идёт через `imports` → `#client-ip` в package.json
 *  по условию `react-server`. */
export async function clientIp(): Promise<string | null> {
  return null
}
