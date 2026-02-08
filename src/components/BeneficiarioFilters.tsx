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
import { useCatalogos, useMunicipios, useLugaresPoblados } from '@/hooks/use-beneficiarios'
import type { BeneficiarioFilters as Filters } from '@/lib/beneficiario-types'
import { Search, FilterX, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'

interface Props {
  onApply: (filters: Filters) => void
  currentFilters: Filters
}

const EMPTY_VALUE = '__none__'

export default function BeneficiarioFilters({ onApply, currentFilters }: Props) {
  const { data: catalogos } = useCatalogos()
  const [expanded, setExpanded] = useState(false)

  const [departamento, setDepartamento] = useState(currentFilters.departamento_codigo ?? '')
  const [municipio, setMunicipio] = useState(currentFilters.municipio_codigo ?? '')
  const [lugarPoblado, setLugarPoblado] = useState(currentFilters.lugar_poblado_codigo ?? '')
  const [area, setArea] = useState(currentFilters.area ?? '')
  const [sexoJefe, setSexoJefe] = useState(currentFilters.sexo_jefe ?? '')
  const [ipmClasificacion, setIpmClasificacion] = useState(currentFilters.ipm_clasificacion ?? '')
  const [pmtClasificacion, setPmtClasificacion] = useState(currentFilters.pmt_clasificacion ?? '')
  const [nbiClasificacion, setNbiClasificacion] = useState(currentFilters.nbi_clasificacion ?? '')
  const [nivelInseguridad, setNivelInseguridad] = useState(currentFilters.nivel_inseguridad ?? '')
  const [fase, setFase] = useState(currentFilters.fase ?? '')
  const [ipmMin, setIpmMin] = useState(currentFilters.ipm_min?.toString() ?? '')
  const [ipmMax, setIpmMax] = useState(currentFilters.ipm_max?.toString() ?? '')
  const [tieneMenores5, setTieneMenores5] = useState(currentFilters.tiene_menores_5 ?? false)
  const [tieneAdultosMayores, setTieneAdultosMayores] = useState(currentFilters.tiene_adultos_mayores ?? false)
  const [tieneEmbarazadas, setTieneEmbarazadas] = useState(currentFilters.tiene_embarazadas ?? false)
  const [tieneDiscapacidad, setTieneDiscapacidad] = useState(currentFilters.tiene_discapacidad ?? false)
  const [fuenteAgua, setFuenteAgua] = useState(currentFilters.fuente_agua ?? '')
  const [tipoSanitario, setTipoSanitario] = useState(currentFilters.tipo_sanitario ?? '')
  const [alumbrado, setAlumbrado] = useState(currentFilters.alumbrado ?? '')
  const [combustibleCocina, setCombustibleCocina] = useState(currentFilters.combustible_cocina ?? '')
  const [tieneInternet, setTieneInternet] = useState(currentFilters.tiene_internet ?? false)
  const [tieneComputadora, setTieneComputadora] = useState(currentFilters.tiene_computadora ?? false)
  const [tieneRefrigerador, setTieneRefrigerador] = useState(currentFilters.tiene_refrigerador ?? false)
  const [conHacinamiento, setConHacinamiento] = useState(currentFilters.con_hacinamiento ?? false)
  const [conAnalfabetismo, setConAnalfabetismo] = useState(currentFilters.con_analfabetismo ?? false)
  const [conMenoresSinEscuela, setConMenoresSinEscuela] = useState(currentFilters.con_menores_sin_escuela ?? false)
  const [sinEmpleo, setSinEmpleo] = useState(currentFilters.sin_empleo ?? false)
  const [buscar, setBuscar] = useState(currentFilters.buscar ?? '')

  const { data: municipios } = useMunicipios(departamento || undefined)
  const { data: lugaresPoblados } = useLugaresPoblados(municipio || undefined)

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setMunicipio('')
    setLugarPoblado('')
  }, [departamento])

  const prevMunicipio = useRef(municipio)
  useEffect(() => {
    if (prevMunicipio.current === municipio) return
    prevMunicipio.current = municipio
    if (municipio === '') return
    setLugarPoblado('')
  }, [municipio])

  // Count active filters for the badge
  const activeCount = [
    departamento, municipio, lugarPoblado, area, sexoJefe,
    ipmClasificacion, pmtClasificacion, nbiClasificacion,
    nivelInseguridad, fase, ipmMin, ipmMax,
    fuenteAgua, tipoSanitario, alumbrado, combustibleCocina,
    buscar.trim(),
  ].filter(Boolean).length + [
    tieneMenores5, tieneAdultosMayores, tieneEmbarazadas, tieneDiscapacidad,
    tieneInternet, tieneComputadora, tieneRefrigerador, conHacinamiento,
    conAnalfabetismo, conMenoresSinEscuela, sinEmpleo,
  ].filter(Boolean).length

  function handleApply() {
    const filters: Filters = {}
    if (departamento) filters.departamento_codigo = departamento
    if (municipio) filters.municipio_codigo = municipio
    if (lugarPoblado) filters.lugar_poblado_codigo = lugarPoblado
    if (area) filters.area = area
    if (sexoJefe) filters.sexo_jefe = sexoJefe
    if (ipmClasificacion) filters.ipm_clasificacion = ipmClasificacion
    if (pmtClasificacion) filters.pmt_clasificacion = pmtClasificacion
    if (nbiClasificacion) filters.nbi_clasificacion = nbiClasificacion
    if (nivelInseguridad) filters.nivel_inseguridad = nivelInseguridad
    if (fase) filters.fase = fase
    if (ipmMin) filters.ipm_min = parseFloat(ipmMin)
    if (ipmMax) filters.ipm_max = parseFloat(ipmMax)
    if (tieneMenores5) filters.tiene_menores_5 = true
    if (tieneAdultosMayores) filters.tiene_adultos_mayores = true
    if (tieneEmbarazadas) filters.tiene_embarazadas = true
    if (tieneDiscapacidad) filters.tiene_discapacidad = true
    if (fuenteAgua) filters.fuente_agua = fuenteAgua
    if (tipoSanitario) filters.tipo_sanitario = tipoSanitario
    if (alumbrado) filters.alumbrado = alumbrado
    if (combustibleCocina) filters.combustible_cocina = combustibleCocina
    if (tieneInternet) filters.tiene_internet = true
    if (tieneComputadora) filters.tiene_computadora = true
    if (tieneRefrigerador) filters.tiene_refrigerador = true
    if (conHacinamiento) filters.con_hacinamiento = true
    if (conAnalfabetismo) filters.con_analfabetismo = true
    if (conMenoresSinEscuela) filters.con_menores_sin_escuela = true
    if (sinEmpleo) filters.sin_empleo = true
    if (buscar.trim()) filters.buscar = buscar.trim()
    onApply(filters)
  }

  function handleClear() {
    setDepartamento('')
    setMunicipio('')
    setLugarPoblado('')
    setArea('')
    setSexoJefe('')
    setIpmClasificacion('')
    setPmtClasificacion('')
    setNbiClasificacion('')
    setNivelInseguridad('')
    setFase('')
    setIpmMin('')
    setIpmMax('')
    setTieneMenores5(false)
    setTieneAdultosMayores(false)
    setTieneEmbarazadas(false)
    setTieneDiscapacidad(false)
    setFuenteAgua('')
    setTipoSanitario('')
    setAlumbrado('')
    setCombustibleCocina('')
    setTieneInternet(false)
    setTieneComputadora(false)
    setTieneRefrigerador(false)
    setConHacinamiento(false)
    setConAnalfabetismo(false)
    setConMenoresSinEscuela(false)
    setSinEmpleo(false)
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
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Top bar: search + toggle + actions */}
      <div className="flex items-center gap-3 p-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o CUI..."
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

      {/* Expanded filters grid */}
      {expanded && (
        <div className="border-t px-3 pb-3 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-3">

            {/* Geograficos */}
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
              <Select value={selectValue(lugarPoblado)} onValueChange={onSelectChange(setLugarPoblado)} disabled={!municipio}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Lugar poblado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
                  {lugaresPoblados?.map((lp) => (
                    <SelectItem key={lp.code} value={lp.code}>{lp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectValue(area)} onValueChange={onSelectChange(setArea)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Area" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
                  {catalogos?.areas.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pobreza */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pobreza</Label>
              <Select value={selectValue(ipmClasificacion)} onValueChange={onSelectChange(setIpmClasificacion)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Clasif. IPM" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
                  {catalogos?.clasificaciones_ipm.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectValue(pmtClasificacion)} onValueChange={onSelectChange(setPmtClasificacion)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Clasif. PMT" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
                  {catalogos?.clasificaciones_pmt.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectValue(nbiClasificacion)} onValueChange={onSelectChange(setNbiClasificacion)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Clasif. NBI" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
                  {catalogos?.clasificaciones_nbi.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-1.5">
                <Input type="number" step="0.01" placeholder="IPM min" value={ipmMin} onChange={(e) => setIpmMin(e.target.value)} className="h-8 text-xs" />
                <Input type="number" step="0.01" placeholder="IPM max" value={ipmMax} onChange={(e) => setIpmMax(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>

            {/* Demograficos */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Demograficos</Label>
              <Select value={selectValue(sexoJefe)} onValueChange={onSelectChange(setSexoJefe)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Sexo jefe" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <CheckItem id="menores5" checked={tieneMenores5} onChange={setTieneMenores5} label="Menores <5" />
                <CheckItem id="adultos-may" checked={tieneAdultosMayores} onChange={setTieneAdultosMayores} label="Adultos mayores" />
                <CheckItem id="embarazadas" checked={tieneEmbarazadas} onChange={setTieneEmbarazadas} label="Embarazadas" />
                <CheckItem id="discapacidad" checked={tieneDiscapacidad} onChange={setTieneDiscapacidad} label="Discapacidad" />
              </div>
            </div>

            {/* Inseguridad + Fase + Servicios */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Inseg. Alimentaria / Fase</Label>
              <Select value={selectValue(nivelInseguridad)} onValueChange={onSelectChange(setNivelInseguridad)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Nivel inseguridad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
                  {catalogos?.niveles_inseguridad.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectValue(fase)} onValueChange={onSelectChange(setFase)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Fase" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
                  {catalogos?.fases.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider !mt-2 block">Servicios</Label>
              <Select value={selectValue(fuenteAgua)} onValueChange={onSelectChange(setFuenteAgua)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Fuente agua" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
                  {catalogos?.fuentes_agua.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectValue(tipoSanitario)} onValueChange={onSelectChange(setTipoSanitario)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Sanitario" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
                  {catalogos?.tipos_sanitario.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Servicios cont. + Bienes + Educacion */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Servicios / Bienes</Label>
              <Select value={selectValue(alumbrado)} onValueChange={onSelectChange(setAlumbrado)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Alumbrado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
                  {catalogos?.tipos_alumbrado.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectValue(combustibleCocina)} onValueChange={onSelectChange(setCombustibleCocina)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Combustible" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
                  {catalogos?.combustibles_cocina.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <CheckItem id="internet" checked={tieneInternet} onChange={setTieneInternet} label="Internet" />
                <CheckItem id="computadora" checked={tieneComputadora} onChange={setTieneComputadora} label="Computadora" />
                <CheckItem id="refrigerador" checked={tieneRefrigerador} onChange={setTieneRefrigerador} label="Refrigerador" />
                <CheckItem id="hacinamiento" checked={conHacinamiento} onChange={setConHacinamiento} label="Hacinamiento" />
                <CheckItem id="analfabetismo" checked={conAnalfabetismo} onChange={setConAnalfabetismo} label="Analfabetismo" />
                <CheckItem id="menores-sin-esc" checked={conMenoresSinEscuela} onChange={setConMenoresSinEscuela} label="Menores sin escuela" />
                <CheckItem id="sin-empleo" checked={sinEmpleo} onChange={setSinEmpleo} label="Sin empleo" />
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
