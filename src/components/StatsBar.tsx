import type { BeneficiarioStats } from '@/lib/beneficiario-types'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsBarProps {
  stats: BeneficiarioStats | undefined
  isLoading: boolean
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500 text-center">{label}</span>
    </div>
  )
}

export default function StatsBar({ stats, isLoading }: StatsBarProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-lg" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Total hogares" value={(stats.total ?? 0).toLocaleString()} />
      <StatCard label="Promedio IPM" value={(stats.promedio_ipm ?? 0).toFixed(2)} />
      <StatCard
        label="Jefatura (F / M)"
        value={`${(stats.total_mujeres_jefas ?? 0).toLocaleString()} / ${(stats.total_hombres_jefes ?? 0).toLocaleString()}`}
      />
      <StatCard label="Total personas" value={(stats.total_personas ?? 0).toLocaleString()} />
    </div>
  )
}
