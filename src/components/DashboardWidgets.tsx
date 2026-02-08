import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/use-beneficiarios'
import { Users, MapPin, ShieldCheck, BarChart3 } from 'lucide-react'

export default function DashboardWidgets() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-60 rounded-lg" />
          <Skeleton className="h-60 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!stats) return null

  const widgets = [
    {
      title: 'Total Hogares',
      value: (stats.total_hogares ?? 0).toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Departamentos Cubiertos',
      value: stats.departamentos_cubiertos,
      icon: MapPin,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Municipios Cubiertos',
      value: stats.municipios_cubiertos,
      icon: ShieldCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Promedio IPM',
      value: (stats.promedio_ipm ?? 0).toFixed(2),
      icon: BarChart3,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  const deptoData = [...stats.por_departamento].sort((a, b) => b.cantidad - a.cantidad)
  const maxDepto = deptoData.length > 0 ? deptoData[0].cantidad : 1

  return (
    <div className="space-y-6">
      {/* 4 metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((w) => (
          <Card key={w.title}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`p-3 rounded-lg ${w.bg}`}>
                <w.icon className={`h-6 w-6 ${w.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{w.value}</p>
                <p className="text-xs text-gray-500">{w.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribution + Food Insecurity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribucion por Departamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deptoData.map((item) => (
              <div key={item.codigo} className="flex items-center gap-3">
                <span className="text-sm w-36 truncate">{item.departamento}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(item.cantidad / maxDepto) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">{item.cantidad.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Food insecurity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inseguridad Alimentaria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.inseguridad_alimentaria.map((item, i) => (
              <div key={item.nivel} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                <span className="text-sm flex-1 truncate">{item.nivel}</span>
                <span className="text-sm font-medium">{item.cantidad.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
