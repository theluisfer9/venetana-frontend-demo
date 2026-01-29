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

  const pctF = stats.total > 0 ? Math.round((stats.genero_f / stats.total) * 100) : 0
  const pctM = 100 - pctF

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Total filtrados" value={stats.total} />
      <StatCard label="Promedio IPM" value={stats.promedio_ipm.toFixed(2)} />
      <StatCard label="Genero (F / M)" value={`${pctF}% / ${pctM}%`} />
      <StatCard label="Hogares c/ menores <5" value={stats.hogares_con_menores} />
    </div>
  )
}
