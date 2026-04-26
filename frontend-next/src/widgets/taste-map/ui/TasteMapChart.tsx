'use client'

import { useEffect, useRef, useMemo } from 'react'
import {
  Chart,
  ScatterController,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from 'chart.js'
import { useCatalogSearch } from '@shared/lib/catalog-search'
import { FilterPanel } from '@features/filter-drinks/ui/FilterPanel'

Chart.register(ScatterController, LinearScale, PointElement, Tooltip, Legend)

interface Point {
  id: number
  name: string
  no_sugar: boolean
  x: number
  y: number
}

interface TasteMapChartProps {
  points: Point[]
}

function fmt(v: number | null | undefined): string {
  if (v == null) return '—'
  const n = parseFloat(v.toFixed(1))
  return String(n)
}

function wrapName(name: string, maxLen = 30): string[] {
  if (name.length <= maxLen) return [name]
  const words = name.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxLen && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

export function TasteMapChart({ points }: TasteMapChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const { search, noSugarOnly } = useCatalogSearch()

  const filteredPoints = useMemo(
    () =>
      points.filter((p) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
        if (noSugarOnly && !p.no_sugar) return false
        return true
      }),
    [points, search, noSugarOnly],
  )

  useEffect(() => {
    if (!canvasRef.current) return

    chartRef.current?.destroy()

    const config: ChartConfiguration<'scatter'> = {
      type: 'scatter',
      data: {
        datasets: filteredPoints.map((p, i) => ({
          label: p.name,
          data: [{ x: p.x, y: p.y }],
          pointRadius: 8,
          pointHoverRadius: 13,
          backgroundColor: `hsl(${(i * 360) / filteredPoints.length}, 70%, 55%)`,
          clip: false,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        layout: { padding: { top: 8, bottom: 8 } },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { color: '#f0f0f5', font: { size: 13 }, usePointStyle: true, padding: 20 },
            onHover(_e, item, legend) {
              legend.chart.data.datasets.forEach((ds, i) => {
                (ds as { pointRadius: number }).pointRadius =
                  i === item.datasetIndex ? 16 : 5
              })
              legend.chart.update('none')
            },
            onLeave(_e, _item, legend) {
              legend.chart.data.datasets.forEach((ds) => {
                (ds as { pointRadius: number }).pointRadius = 8
              })
              legend.chart.update('none')
            },
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: (items) => wrapName(items[0]?.dataset.label ?? ''),
              label: (ctx) =>
                `сладость: ${fmt(ctx.parsed.x)}   кислотность: ${fmt(ctx.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            type: 'linear' as const,
            min: 1,
            max: 5,
            title: { display: true, text: 'Сладость →', color: '#0066cc' },
            grid: { color: 'rgba(255,255,255,0.08)' },
            ticks: { color: '#9090a8', stepSize: 1 },
          },
          y: {
            type: 'linear' as const,
            min: 1,
            max: 5,
            title: { display: true, text: 'Кислотность →', color: '#00e5ff' },
            grid: { color: 'rgba(255,255,255,0.08)' },
            ticks: { color: '#9090a8', stepSize: 1 },
          },
        },
      },
    }

    chartRef.current = new Chart(canvasRef.current, config)
    return () => { chartRef.current?.destroy() }
  }, [filteredPoints])

  return (
    <div>
      <FilterPanel />
      <div className="glass rounded-xl p-6">
        {filteredPoints.length === 0 ? (
          <p className="text-[#9090a8] py-16 text-center">
            Ничего не найдено — попробуйте изменить фильтры.
          </p>
        ) : (
          <div style={{ height: 500, position: 'relative' }}>
            <canvas ref={canvasRef} />
          </div>
        )}
      </div>
    </div>
  )
}
