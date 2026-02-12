import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConsultaCatalogos } from '@/hooks/use-consulta'
import { useMunicipios } from '@/hooks/use-beneficiarios'
import type { ConsultaFilters, InstitutionPreset } from '@/lib/consulta-types'
import { Search, FilterX } from 'lucide-react'

interface Props {
  preset: InstitutionPreset
  onApply: (filters: ConsultaFilters) => void
  currentFilters: ConsultaFilters
}

const EMPTY_VALUE = '__none__'

export default function ConsultaFiltersPanel({ onApply, currentFilters }: Props) {
  const { data: catalogos } = useConsultaCatalogos()

  const [departamento, setDepartamento] = useState(currentFilters.departamento_codigo ?? '')
  const [municipio, setMunicipio] = useState(currentFilters.municipio_codigo ?? '')
  const [buscar, setBuscar] = useState((currentFilters.buscar as string) ?? '')

  const { data: municipios } = useMunicipios(departamento || undefined)

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setMunicipio('')
  }, [departamento])

  const activeCount = [departamento, municipio, buscar.trim()].filter(Boolean).length

  function handleApply() {
    const filters: ConsultaFilters = {}
    if (departamento) filters.departamento_codigo = departamento
    if (municipio) filters.municipio_codigo = municipio
    if (buscar.trim()) filters.buscar = buscar.trim()
    onApply(filters)
  }

  function handleClear() {
    setDepartamento('')
    setMunicipio('')
    setBuscar('')
    onApply({})
  }

  function selectValue(val: string) {
    return val || EMPTY_VALUE
  }

  function onSelectChange(setter: (v: string) => void) {
    return (val: string) => setter(val === EMPTY_VALUE ? '' : val)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por ID de hogar..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="pl-9 h-9"
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            />
          </div>
        </div>

        <div className="min-w-[180px]">
          <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Departamento</Label>
          <Select value={selectValue(departamento)} onValueChange={onSelectChange(setDepartamento)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              {catalogos?.departamentos.map((d) => (
                <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[180px]">
          <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Municipio</Label>
          <Select value={selectValue(municipio)} onValueChange={onSelectChange(setMunicipio)} disabled={!departamento}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              {municipios?.map((m) => (
                <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleApply}>
            Aplicar
          </Button>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <FilterX className="mr-1 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
