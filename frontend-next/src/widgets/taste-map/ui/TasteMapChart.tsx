'use client'

import { useEffect, useRef } from 'react'
import {
  Chart,
  ScatterController,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from 'chart.js'

Chart.register(ScatterController, LinearScale, PointElement, Tooltip, Legend)

interface Point {
  id: number
  name: string
  x: number
  y: number
}

interface TasteMapChartProps {
  points: Point[]
}

export function TasteMapChart({ points }: TasteMapChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    chartRef.current?.destroy()

    const config: ChartConfiguration<'scatter'> = {
      type: 'scatter',
      data: {
        datasets: points.map((p, i) => ({
          label: p.name,
          data: [{ x: p.x, y: p.y }],
          pointRadius: 8,
          pointHoverRadius: 13,
          backgroundColor: `hsl(${(i * 360) / points.length}, 70%, 55%)`,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        plugins: {
          legend: {
            display: true,
            labels: { color: '#f0f0f5', font: { size: 13 }, usePointStyle: true },
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
            callbacks: {
              label: (ctx) =>
                `${ctx.dataset.label}   сладость: ${ctx.parsed.x}   кислота: ${ctx.parsed.y}`,
            },
          },
        },
        scales: {
          x: {
            type: 'linear' as const,
            min: 0.5,
            max: 5.5,
            title: { display: true, text: 'Сладость →', color: '#9090a8' },
            grid: { color: 'rgba(255,255,255,0.08)' },
            ticks: { color: '#9090a8', stepSize: 1 },
          },
          y: {
            type: 'linear' as const,
            min: 0.5,
            max: 5.5,
            title: { display: true, text: 'Кислотность →', color: '#9090a8' },
            grid: { color: 'rgba(255,255,255,0.08)' },
            ticks: { color: '#9090a8', stepSize: 1 },
          },
        },
      },
    }

    chartRef.current = new Chart(canvasRef.current, config)
    return () => { chartRef.current?.destroy() }
  }, [points])

  return (
    <div className="glass rounded-xl p-6">
      <div style={{ height: 500, position: 'relative' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
