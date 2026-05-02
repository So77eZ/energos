import { drinkApi } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { TasteMapChart } from '@widgets/taste-map/ui/TasteMapChart'

export const metadata = { title: 'Карта вкусов — Energos' }

export default async function TasteMapPage() {
  const [drinks, allReviews] = await Promise.all([
    drinkApi.list().catch(() => []),
    reviewApi.list().catch(() => []),
  ])

  // Предпочитаем admin-отзыв, иначе считаем среднее по пользовательским
  const points = drinks.flatMap((drink) => {
    const drinkReviews = allReviews.filter((r) => r.energy_drink_id === drink.id)
    if (drinkReviews.length === 0) return []

    const source =
      drinkReviews.find((r) => r.from_admin) ??
      (() => {
        const avg = (key: keyof typeof drinkReviews[0]) =>
          drinkReviews.reduce((s, r) => s + (r[key] as number), 0) / drinkReviews.length
        return { sweetness: avg('sweetness'), acidity: avg('acidity') }
      })()

    return [{ id: drink.id, name: drink.name, no_sugar: drink.no_sugar, x: source.sweetness, y: source.acidity }]
  })

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl px-5 py-4">
        <h1 className="text-2xl font-bold text-[#f0f0f5]">Карта вкусов</h1>
        <p className="text-sm text-[#9090a8] mt-1">Сравнение напитков по сладости и кислотности</p>
      </div>
      {points.length === 0 ? (
        <p className="text-[#9090a8] py-16 text-center">
          Добавьте напитки и хотя бы один отзыв — они появятся на карте.
        </p>
      ) : (
        <TasteMapChart points={points} />
      )}
    </div>
  )
}
