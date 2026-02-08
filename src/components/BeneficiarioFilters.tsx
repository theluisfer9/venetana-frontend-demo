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
import { Separator } from '@/components/ui/separator'
import { useCatalogos, useMunicipios, useLugaresPoblados } from '@/hooks/use-beneficiarios'
import type { BeneficiarioFilters as Filters } from '@/lib/beneficiario-types'
import { Search, FilterX } from 'lucide-react'

interface Props {
  onApply: (filters: Filters) => void
  currentFilters: Filters
}

const EMPTY_VALUE = '__none__'

export default function BeneficiarioFilters({ onApply, currentFilters }: Props) {
  const { data: catalogos } = useCatalogos()

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

  // Reset municipio and lugar poblado when departamento changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setMunicipio('')
    setLugarPoblado('')
  }, [departamento])

  // Reset lugar poblado when municipio changes (skip when cleared by departamento effect)
  const prevMunicipio = useRef(municipio)
  useEffect(() => {
    if (prevMunicipio.current === municipio) return
    prevMunicipio.current = municipio
    if (municipio === '') return
    setLugarPoblado('')
  }, [municipio])

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
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border">
      {/* Busqueda */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Busqueda</Label>
        <div className="relative mt-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Nombre o CUI"
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
          <Select
            value={selectValue(lugarPoblado)}
            onValueChange={onSelectChange(setLugarPoblado)}
            disabled={!municipio}
          >
            <SelectTrigger><SelectValue placeholder="Lugar poblado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              {lugaresPoblados?.map((lp) => (
                <SelectItem key={lp.code} value={lp.code}>{lp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectValue(area)} onValueChange={onSelectChange(setArea)}>
            <SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
              {catalogos?.areas.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Demograficos */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Demograficos</Label>
        <div className="space-y-2 mt-1">
          <Select value={selectValue(sexoJefe)} onValueChange={onSelectChange(setSexoJefe)}>
            <SelectTrigger><SelectValue placeholder="Sexo jefe hogar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              <SelectItem value="Femenino">Femenino</SelectItem>
              <SelectItem value="Masculino">Masculino</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tiene-menores-5"
              checked={tieneMenores5}
              onCheckedChange={(v) => setTieneMenores5(!!v)}
            />
            <label htmlFor="tiene-menores-5" className="text-sm">Con menores &lt;5</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tiene-adultos-mayores"
              checked={tieneAdultosMayores}
              onCheckedChange={(v) => setTieneAdultosMayores(!!v)}
            />
            <label htmlFor="tiene-adultos-mayores" className="text-sm">Con adultos mayores</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tiene-embarazadas"
              checked={tieneEmbarazadas}
              onCheckedChange={(v) => setTieneEmbarazadas(!!v)}
            />
            <label htmlFor="tiene-embarazadas" className="text-sm">Con embarazadas</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tiene-discapacidad"
              checked={tieneDiscapacidad}
              onCheckedChange={(v) => setTieneDiscapacidad(!!v)}
            />
            <label htmlFor="tiene-discapacidad" className="text-sm">Con discapacidad</label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pobreza */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Pobreza</Label>
        <div className="space-y-2 mt-1">
          <Select value={selectValue(ipmClasificacion)} onValueChange={onSelectChange(setIpmClasificacion)}>
            <SelectTrigger><SelectValue placeholder="Clasificacion IPM" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
              {catalogos?.clasificaciones_ipm.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectValue(pmtClasificacion)} onValueChange={onSelectChange(setPmtClasificacion)}>
            <SelectTrigger><SelectValue placeholder="Clasificacion PMT" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
              {catalogos?.clasificaciones_pmt.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectValue(nbiClasificacion)} onValueChange={onSelectChange(setNbiClasificacion)}>
            <SelectTrigger><SelectValue placeholder="Clasificacion NBI" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
              {catalogos?.clasificaciones_nbi.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
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

      {/* Inseguridad Alimentaria */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Inseguridad Alimentaria</Label>
        <div className="space-y-2 mt-1">
          <Select value={selectValue(nivelInseguridad)} onValueChange={onSelectChange(setNivelInseguridad)}>
            <SelectTrigger><SelectValue placeholder="Nivel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              {catalogos?.niveles_inseguridad.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Servicios basicos */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Servicios Basicos</Label>
        <div className="space-y-2 mt-1">
          <Select value={selectValue(fuenteAgua)} onValueChange={onSelectChange(setFuenteAgua)}>
            <SelectTrigger><SelectValue placeholder="Fuente de agua" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
              {catalogos?.fuentes_agua.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectValue(tipoSanitario)} onValueChange={onSelectChange(setTipoSanitario)}>
            <SelectTrigger><SelectValue placeholder="Tipo sanitario" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              {catalogos?.tipos_sanitario.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectValue(alumbrado)} onValueChange={onSelectChange(setAlumbrado)}>
            <SelectTrigger><SelectValue placeholder="Alumbrado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              {catalogos?.tipos_alumbrado.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectValue(combustibleCocina)} onValueChange={onSelectChange(setCombustibleCocina)}>
            <SelectTrigger><SelectValue placeholder="Combustible cocina" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todos</SelectItem>
              {catalogos?.combustibles_cocina.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Bienes del hogar */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Bienes del Hogar</Label>
        <div className="space-y-2 mt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tiene-internet"
              checked={tieneInternet}
              onCheckedChange={(v) => setTieneInternet(!!v)}
            />
            <label htmlFor="tiene-internet" className="text-sm">Con internet</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tiene-computadora"
              checked={tieneComputadora}
              onCheckedChange={(v) => setTieneComputadora(!!v)}
            />
            <label htmlFor="tiene-computadora" className="text-sm">Con computadora</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tiene-refrigerador"
              checked={tieneRefrigerador}
              onCheckedChange={(v) => setTieneRefrigerador(!!v)}
            />
            <label htmlFor="tiene-refrigerador" className="text-sm">Con refrigerador</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="con-hacinamiento"
              checked={conHacinamiento}
              onCheckedChange={(v) => setConHacinamiento(!!v)}
            />
            <label htmlFor="con-hacinamiento" className="text-sm">Con hacinamiento</label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Educacion y empleo */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Educacion y Empleo</Label>
        <div className="space-y-2 mt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="con-analfabetismo"
              checked={conAnalfabetismo}
              onCheckedChange={(v) => setConAnalfabetismo(!!v)}
            />
            <label htmlFor="con-analfabetismo" className="text-sm">Con analfabetismo</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="con-menores-sin-escuela"
              checked={conMenoresSinEscuela}
              onCheckedChange={(v) => setConMenoresSinEscuela(!!v)}
            />
            <label htmlFor="con-menores-sin-escuela" className="text-sm">Menores sin escuela</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sin-empleo"
              checked={sinEmpleo}
              onCheckedChange={(v) => setSinEmpleo(!!v)}
            />
            <label htmlFor="sin-empleo" className="text-sm">Sin empleo en hogar</label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Fase */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase">Fase</Label>
        <div className="space-y-2 mt-1">
          <Select value={selectValue(fase)} onValueChange={onSelectChange(setFase)}>
            <SelectTrigger><SelectValue placeholder="Fase" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>Todas</SelectItem>
              {catalogos?.fases.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
