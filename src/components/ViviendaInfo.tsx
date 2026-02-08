import { useViviendaHogar } from '@/hooks/use-beneficiarios'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

function Campo({ label, value }: { label: string; value: string | number }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">{titulo}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  )
}

function BienBadge({ label, value }: { label: string; value: string }) {
  if (!value) return null
  const tiene = value.toLowerCase() === 'si' || value.toLowerCase() === 'sí' || value === '1'
  return (
    <Badge variant={tiene ? 'default' : 'outline'} className="text-xs">
      {label}
    </Badge>
  )
}

export default function ViviendaInfo({ hogarId }: { hogarId: number }) {
  const { data, isLoading } = useViviendaHogar(hogarId)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded" />
        ))}
      </div>
    )
  }

  if (!data) {
    return <p className="text-sm text-gray-500 py-4">No se encontraron datos de vivienda.</p>
  }

  return (
    <div className="space-y-5">
      {/* Materiales y tipo */}
      <Seccion titulo="Caracteristicas de la Vivienda">
        <Campo label="Condicion" value={data.condicion_vivienda} />
        <Campo label="Tipo" value={data.tipo_vivienda} />
        <Campo label="Material Paredes" value={data.material_paredes} />
        <Campo label="Material Techo" value={data.material_techo} />
        <Campo label="Material Piso" value={data.material_piso} />
        <Campo label="Tenencia" value={data.tenencia} />
        <Campo label="Propietario" value={data.propietario} />
      </Seccion>

      {/* Composicion */}
      <Seccion titulo="Composicion del Hogar">
        <Campo label="Personas Habituales" value={data.personas_habituales} />
        <Campo label="Personas Hogar" value={data.personas_hogar} />
        <Campo label="Hombres" value={data.hombres} />
        <Campo label="Mujeres" value={data.mujeres} />
        <Campo label="Ninos" value={data.ninos} />
        <Campo label="Ninas" value={data.ninas} />
        <Campo label="Cuartos" value={data.cuartos} />
        <Campo label="Dormitorios" value={data.dormitorios} />
      </Seccion>

      {/* Servicios */}
      <Seccion titulo="Servicios y Cocina">
        <Campo label="Cocina Exclusiva" value={data.cocina_exclusiva} />
        <Campo label="Combustible Cocina" value={data.combustible_cocina} />
        <Campo label="Usa Lenia" value={data.usa_lenia} />
        <Campo label="Lugar Cocina" value={data.lugar_cocina} />
        <Campo label="Chimenea" value={data.chimenea} />
        <Campo label="Fuente Agua" value={data.fuente_agua} />
        <Campo label="Dias sin Agua" value={data.dias_sin_agua} />
        <Campo label="Tratamiento Agua" value={data.tratamiento_agua} />
        <Campo label="Tipo Sanitario" value={data.tipo_sanitario} />
        <Campo label="Uso Sanitario" value={data.uso_sanitario} />
        <Campo label="Aguas Grises" value={data.aguas_grises} />
        <Campo label="Alumbrado" value={data.alumbrado} />
        <Campo label="Dias sin Electricidad" value={data.dias_sin_electricidad} />
        <Campo label="Eliminacion Basura" value={data.eliminacion_basura} />
      </Seccion>

      {/* Bienes */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Bienes del Hogar</p>
        <div className="flex flex-wrap gap-1.5">
          <BienBadge label="Radio" value={data.radio} />
          <BienBadge label="Estufa Lenia" value={data.estufa_lenia} />
          <BienBadge label="Estufa Gas" value={data.estufa_gas} />
          <BienBadge label="Televisor" value={data.televisor} />
          <BienBadge label="Refrigerador" value={data.refrigerador} />
          <BienBadge label="Lavadora" value={data.lavadora} />
          <BienBadge label="Computadora" value={data.computadora} />
          <BienBadge label="Internet" value={data.internet} />
          <BienBadge label="Moto" value={data.moto} />
          <BienBadge label="Carro" value={data.carro} />
        </div>
      </div>

      {/* ELCSA */}
      <Seccion titulo="Seguridad Alimentaria (ELCSA)">
        <Campo label="Preocupacion Alimentos" value={data.preocupacion_alimentos} />
        <Campo label="Sin Alimentos" value={data.sin_alimentos} />
        <Campo label="Adulto sin Alimentacion Saludable" value={data.adulto_sin_alimentacion_saludable} />
        <Campo label="Nino sin Alimentacion Saludable" value={data.nino_sin_alimentacion_saludable} />
        <Campo label="Adulto sin Variedad" value={data.adulto_sin_variedad} />
        <Campo label="Nino sin Variedad" value={data.nino_sin_variedad} />
        <Campo label="Adulto sin Tiempo Comida" value={data.adulto_sin_tiempo_comida} />
        <Campo label="Nino sin Tiempo Comida" value={data.nino_sin_tiempo_comida} />
        <Campo label="Adulto Comio Menos" value={data.adulto_comio_menos} />
        <Campo label="Nino Comio Menos" value={data.nino_comio_menos} />
        <Campo label="Adulto Sintio Hambre" value={data.adulto_sintio_hambre} />
        <Campo label="Nino Sintio Hambre" value={data.nino_sintio_hambre} />
        <Campo label="Adulto Comio Una Vez" value={data.adulto_comio_una_vez} />
        <Campo label="Nino Comio Una Vez" value={data.nino_comio_una_vez} />
      </Seccion>
    </div>
  )
}
