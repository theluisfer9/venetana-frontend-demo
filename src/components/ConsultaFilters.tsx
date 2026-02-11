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
import { Checkbox } from '@/components/ui/checkbox'
import { useConsultaCatalogos } from '@/hooks/use-consulta'
import { useMunicipios } from '@/hooks/use-beneficiarios'
import type { ConsultaFilters, InstitutionPreset } from '@/lib/consulta-types'
import { Search, FilterX, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'

interface Props {
  preset: InstitutionPreset
  onApply: (filters: ConsultaFilters) => void
  currentFilters: ConsultaFilters
}

const EMPTY_VALUE = '__none__'

export default function ConsultaFiltersPanel({ preset, onApply, currentFilters }: Props) {
  const { data: catalogos } = useConsultaCatalogos()
  const [expanded, setExpanded] = useState(false)

  const [departamento, setDepartamento] = useState(currentFilters.departamento_codigo ?? '')
  const [municipio, setMunicipio] = useState(currentFilters.municipio_codigo ?? '')
  const [buscar, setBuscar] = useState((currentFilters.buscar as string) ?? '')
  const [interventionChecks, setInterventionChecks] = useState<Record<string, boolean>>({})

  const { data: municipios } = useMunicipios(departamento || undefined)

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setMunicipio('')
  }, [departamento])

  const interventionActiveCount = Object.values(interventionChecks).filter(Boolean).length
  const activeCount = [
    departamento,
    municipio,
    buscar.trim(),
  ].filter(Boolean).length + interventionActiveCount

  function handleApply() {
    const filters: ConsultaFilters = {}
    if (departamento) filters.departamento_codigo = departamento
    if (municipio) filters.municipio_codigo = municipio
    if (buscar.trim()) filters.buscar = buscar.trim()
    for (const col of preset.intervention_columns) {
      if (interventionChecks[col]) filters[col] = true
    }
    onApply(filters)
  }

  function handleClear() {
    setDepartamento('')
    setMunicipio('')
    setBuscar('')
    setInterventionChecks({})
    onApply({})
  }

  function selectValue(val: string) {
    return val || EMPTY_VALUE
  }

  function onSelectChange(setter: (v: string) => void) {
    return (val: string) => setter(val === EMPTY_VALUE ? '' : val)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-3 p-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por ID de hogar..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="pl-9 h-9"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="gap-1.5"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>

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

      {expanded && (
        <div className="border-t px-3 pb-3 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Geograficos</Label>
              <Select value={selectValue(departamento)} onValueChange={onSelectChange(setDepartamento)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Departamento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
                  {catalogos?.departamentos.map((d) => (
                    <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectValue(municipio)} onValueChange={onSelectChange(setMunicipio)} disabled={!departamento}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Municipio" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
                  {municipios?.map((m) => (
                    <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Intervenciones</Label>
              <div className="space-y-1.5 pt-1">
                {preset.intervention_columns.map((col) => (
                  <CheckItem
                    key={col}
                    id={col}
                    checked={interventionChecks[col] || false}
                    onChange={(v) => setInterventionChecks(prev => ({ ...prev, [col]: v }))}
                    label={preset.labels[col] || col}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CheckItem({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} className="h-3.5 w-3.5" />
      <label htmlFor={id} className="text-xs text-gray-600 cursor-pointer">{label}</label>
    </div>
  )
}
