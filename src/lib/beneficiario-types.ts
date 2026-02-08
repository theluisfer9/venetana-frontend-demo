// ── Catalogos ─────────────────────────────────────────────────────────

export interface CatalogoItem {
  code: string
  name: string
}

export interface MunicipioItem {
  code: string
  name: string
}

export interface LugarPobladoItem {
  code: string
  name: string
}

export interface CatalogosResponse {
  departamentos: CatalogoItem[]
  clasificaciones_ipm: string[]
  clasificaciones_pmt: string[]
  clasificaciones_nbi: string[]
  areas: string[]
  niveles_inseguridad: string[]
  fases: string[]
  comunidades_linguisticas: string[]
  pueblos: string[]
}

// ── Filtros ───────────────────────────────────────────────────────────

export interface BeneficiarioFilters {
  departamento_codigo?: string
  municipio_codigo?: string
  lugar_poblado_codigo?: string
  area?: string
  sexo_jefe?: string
  ipm_min?: number
  ipm_max?: number
  ipm_clasificacion?: string
  pmt_clasificacion?: string
  nbi_clasificacion?: string
  tiene_menores_5?: boolean
  tiene_adultos_mayores?: boolean
  tiene_embarazadas?: boolean
  tiene_discapacidad?: boolean
  nivel_inseguridad?: string
  buscar?: string
  anio?: number
  fase?: string
}

// ── Beneficiario resumen (lista) ─────────────────────────────────────

export interface BeneficiarioResumen {
  hogar_id: number
  cui_jefe_hogar: number | null
  nombre_completo: string
  sexo_jefe_hogar: string
  departamento: string
  departamento_codigo: string
  municipio: string
  municipio_codigo: string
  lugar_poblado: string
  area: string
  numero_personas: number
  hombres: number
  mujeres: number
  ipm_gt: number
  ipm_gt_clasificacion: string
  pmt: number
  pmt_clasificacion: string
  nbi: number
  nbi_clasificacion: string
}

// ── Beneficiario detalle ─────────────────────────────────────────────

export interface BeneficiarioDetalle extends BeneficiarioResumen {
  latitud: number | null
  longitud: number | null
  direccion: string
  celular_jefe: number | null
  cui_madre: number | null
  nombre_madre: string
  fase: string
  fase_estado: string
  anio: number | null
  // Demograficos
  total_personas: number | null
  menores_5: number | null
  adultos_mayores: number | null
  personas_embarazadas: number | null
  personas_con_dificultad: number | null
  tipo_jefatura: string
  comunidad_linguistica: string
  pueblo_de_pertenencia: string
  // Inseguridad alimentaria
  nivel_inseguridad_alimentaria: string
  puntos_elcsa: number | null
  // Grupos etarios
  primera_infancia: number | null
  ninos: number | null
  adolescentes: number | null
  jovenes: number | null
  adultos: number | null
}

// ── Paginacion ───────────────────────────────────────────────────────

export interface PaginatedResponse {
  items: BeneficiarioResumen[]
  total: number
  offset: number
  limit: number
}

// ── Stats ────────────────────────────────────────────────────────────

export interface DepartamentoCount {
  departamento: string
  codigo: string
  cantidad: number
}

export interface ClasificacionCount {
  clasificacion: string
  cantidad: number
}

export interface BeneficiarioStats {
  total: number
  promedio_ipm: number
  total_mujeres_jefas: number
  total_hombres_jefes: number
  total_personas: number
  total_hombres: number
  total_mujeres: number
  por_departamento: DepartamentoCount[]
  por_ipm_clasificacion: ClasificacionCount[]
}

// ── Dashboard ────────────────────────────────────────────────────────

export interface InseguridadCount {
  nivel: string
  cantidad: number
}

export interface DashboardStats {
  total_hogares: number
  departamentos_cubiertos: number
  municipios_cubiertos: number
  promedio_ipm: number
  total_personas: number
  hogares_pobres: number
  hogares_no_pobres: number
  por_departamento: DepartamentoCount[]
  inseguridad_alimentaria: InseguridadCount[]
}
