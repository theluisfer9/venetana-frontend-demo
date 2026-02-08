import { usePersonasHogar } from '@/hooks/use-beneficiarios'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function PersonasList({ hogarId }: { hogarId: number }) {
  const { data: personas, isLoading } = usePersonasHogar(hogarId)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded" />
        ))}
      </div>
    )
  }

  if (!personas || personas.length === 0) {
    return <p className="text-sm text-gray-500 py-4">No se encontraron personas para este hogar.</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{personas.length} persona(s) registrada(s)</p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Genero</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Parentesco</TableHead>
              <TableHead>Estado Civil</TableHead>
              <TableHead>Educacion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personas.map((p) => (
              <TableRow key={p.personas_id}>
                <TableCell className="text-gray-400">{p.correlativo}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{p.nombre_completo}</p>
                    {p.cui && (
                      <p className="text-xs text-gray-400 font-mono">{p.cui}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{p.genero}</TableCell>
                <TableCell>{p.edad}</TableCell>
                <TableCell>{p.parentesco}</TableCell>
                <TableCell>{p.estado_civil}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{p.nivel_educativo}</p>
                    {p.sabe_leer_escribir && (
                      <p className="text-xs text-gray-400">Lee/escribe: {p.sabe_leer_escribir}</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detalle expandido por persona */}
      <div className="space-y-3">
        {personas.map((p) => {
          const dificultades = [
            p.dificultad_ver && `Ver: ${p.dificultad_ver}`,
            p.dificultad_oir && `Oir: ${p.dificultad_oir}`,
            p.dificultad_caminar && `Caminar: ${p.dificultad_caminar}`,
            p.dificultad_recordar && `Recordar: ${p.dificultad_recordar}`,
            p.dificultad_cuidado_personal && `Cuidado: ${p.dificultad_cuidado_personal}`,
            p.dificultad_entender && `Entender: ${p.dificultad_entender}`,
          ].filter(Boolean)

          const hasDificultades = dificultades.some(
            (d) => d && !d.toLowerCase().includes('sin dificultad') && !d.toLowerCase().includes('ninguna')
          )

          return (
            <div key={p.personas_id} className="border rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{p.nombre_completo}</span>
                <Badge variant="outline" className="text-xs">{p.parentesco}</Badge>
                {p.embarazada && p.embarazada.toLowerCase() !== 'no' && p.embarazada !== '' && (
                  <Badge variant="secondary" className="text-xs">Embarazada</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400">Pueblo: </span>{p.pueblo}
                </div>
                <div>
                  <span className="text-gray-400">Comunidad: </span>{p.comunidad_linguistica}
                </div>
                <div>
                  <span className="text-gray-400">Idioma: </span>{p.idioma_materno}
                </div>
                <div>
                  <span className="text-gray-400">Actividad: </span>{p.actividad_principal}
                </div>
                {p.tiene_ingreso && (
                  <div>
                    <span className="text-gray-400">Ingreso: </span>{p.tiene_ingreso}
                  </div>
                )}
                {p.inscrito_escuela && (
                  <div>
                    <span className="text-gray-400">Escuela: </span>{p.inscrito_escuela}
                  </div>
                )}
              </div>
              {hasDificultades && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {dificultades.map((d, i) => d && (
                    <Badge key={i} variant="outline" className="text-xs">{d}</Badge>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
