import { useState, useEffect } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { useCatalogos, useMunicipios } from '@/hooks/use-beneficiarios'
import type { BeneficiarioFilters as Filters } from '@/lib/beneficiario-types'
import { Search, FilterX } from 'lucide-react'

interface Props {
  onApply: (filters: Filters) => void
  currentFilters: Filters
}

const EMPTY_VALUE = '__none__'

export default function BeneficiarioFilters({ onApply, currentFilters }: Props) {
  const { data: catalogos } = useCatalogos()

  const [departamento, setDepartamento] = useState(currentFilters.departamento_code ?? '')
  const [municipio, setMunicipio] = useState(currentFilters.municipio_code ?? '')
  const [institucion, setInstitucion] = useState(currentFilters.institucion_code ?? '')
  const [tipoIntervencion, setTipoIntervencion] = useState(currentFilters.tipo_intervencion_code ?? '')
  const [sinIntervencion, setSinIntervencion] = useState(currentFilters.sin_intervencion ?? false)
  const [genero, setGenero] = useState(currentFilters.genero ?? '')
  const [edadMin, setEdadMin] = useState(currentFilters.edad_min?.toString() ?? '')
  const [edadMax, setEdadMax] = useState(currentFilters.edad_max?.toString() ?? '')
  const [nivelPrivacion, setNivelPrivacion] = useState(currentFilters.nivel_privacion ?? '')
  const [ipmMin, setIpmMin] = useState(currentFilters.ipm_min?.toString() ?? '')
  const [ipmMax, setIpmMax] = useState(currentFilters.ipm_max?.toString() ?? '')
  const [conMenores, setConMenores] = useState(currentFilters.con_menores_5 ?? false)
  const [conAdultosMayores, setConAdultosMayores] = useState(currentFilters.con_adultos_mayores ?? false)
  const [buscar, setBuscar] = useState(currentFilters.buscar ?? '')

  const { data: municipios } = useMunicipios(departamento || undefined)

  // Reset municipio when departamento changes
  useEffect(() => {
    setMunicipio('')
  }, [departamento])

  function handleApply() {
    const filters: Filters = {}
    if (departamento) filters.departamento_code = departamento
    if (municipio) filters.municipio_code = municipio
    if (institucion) filters.institucion_code = institucion
    if (tipoIntervencion) filters.tipo_intervencion_code = tipoIntervencion
    if (sinIntervencion) filters.sin_intervencion = true
    if (genero) filters.genero = genero
    if (edadMin) filters.edad_min = parseInt(edadMin)
    if (edadMax) filters.edad_max = parseInt(edadMax)
    if (nivelPrivacion) filters.nivel_privacion = nivelPrivacion
    if (ipmMin) filters.ipm_min = parseFloat(ipmMin)
    if (ipmMax) filters.ipm_max = parseFloat(ipmMax)
    if (conMenores) filters.con_menores_5 = true
    if (conAdultosMayores) filters.con_adultos_mayores = true
    if (buscar.trim()) filters.buscar = buscar.trim()
    onApply(filters)
  }

  function handleClear() {
    setDepartamento('')
    setMunicipio('')
    setInstitucion('')
    setTipoIntervencion('')
    setSinIntervencion(false)
    setGenero('')
    setEdadMin('')
    setEdadMax('')
    setNivelPrivacion('')
    setIpmMin('')
    setIpmMax('')
    setConMenores(false)
    setConAdultosMayores(false)
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
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border">
      {/* Busqueda */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Busqueda</Label>
        <div className="relative mt-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Nombre o DPI"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Separator />

      {/* Geograficos */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Geograficos</Label>
        <div className="space-y-2 mt-1">
          <Select value={selectValue(departamento)} onValueChange={onSelectChange(setDepartamento)}>
            <SelectTrigger><SelectValue placeholder="Departamento" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              {catalogos?.departamentos.map((d) => (
                <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectValue(municipio)}
            onValueChange={onSelectChange(setMunicipio)}
            disabled={!departamento}
          >
            <SelectTrigger><SelectValue placeholder="Municipio" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              {municipios?.map((m) => (
                <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Intervencion */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Intervencion</Label>
        <div className="space-y-2 mt-1">
          <Select value={selectValue(institucion)} onValueChange={onSelectChange(setInstitucion)}>
            <SelectTrigger><SelectValue placeholder="Institucion" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
              {catalogos?.instituciones.map((i) => (
                <SelectItem key={i.code} value={i.code}>{i.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectValue(tipoIntervencion)} onValueChange={onSelectChange(setTipoIntervencion)}>
            <SelectTrigger><SelectValue placeholder="Tipo intervencion" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              {catalogos?.tipos_intervencion.map((t) => (
                <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sin-intervencion"
              checked={sinIntervencion}
              onCheckedChange={(v) => setSinIntervencion(!!v)}
            />
            <label htmlFor="sin-intervencion" className="text-sm">Sin intervencion</label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Demograficos */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Demograficos</Label>
        <div className="space-y-2 mt-1">
          <Select value={selectValue(genero)} onValueChange={onSelectChange(setGenero)}>
            <SelectTrigger><SelectValue placeholder="Genero" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              <SelectItem value="F">Femenino</SelectItem>
              <SelectItem value="M">Masculino</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Edad min"
              value={edadMin}
              onChange={(e) => setEdadMin(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Edad max"
              value={edadMax}
              onChange={(e) => setEdadMax(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="con-menores"
              checked={conMenores}
              onCheckedChange={(v) => setConMenores(!!v)}
            />
            <label htmlFor="con-menores" className="text-sm">Con menores &lt;5</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="con-adultos-mayores"
              checked={conAdultosMayores}
              onCheckedChange={(v) => setConAdultosMayores(!!v)}
            />
            <label htmlFor="con-adultos-mayores" className="text-sm">Con adultos mayores</label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pobreza */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Pobreza</Label>
        <div className="space-y-2 mt-1">
          <Select value={selectValue(nivelPrivacion)} onValueChange={onSelectChange(setNivelPrivacion)}>
            <SelectTrigger><SelectValue placeholder="Nivel privacion" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              {catalogos?.niveles_privacion.map((n) => (
                <SelectItem key={n.code} value={n.code}>{n.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder="IPM min"
              value={ipmMin}
              onChange={(e) => setIpmMin(e.target.value)}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="IPM max"
              value={ipmMax}
              onChange={(e) => setIpmMax(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Botones */}
      <div className="flex gap-2">
        <Button onClick={handleApply} className="flex-1">
          Aplicar
        </Button>
        <Button variant="outline" onClick={handleClear} className="flex-1">
          <FilterX className="mr-1 h-4 w-4" />
          Limpiar
        </Button>
      </div>
    </div>
  )
}
