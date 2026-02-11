// -- Preset Info --
export interface InstitutionPreset {
  institution_code: string
  name: string
  table: string
  columns: string[]
  intervention_columns: string[]
  allowed_filters: string[]
  labels: Record<string, string>
}

// -- Filters --
export interface ConsultaFilters {
  departamento_codigo?: string
  municipio_codigo?: string
  buscar?: string
  [key: string]: string | boolean | undefined
}

// -- Resumen (list) --
export interface BeneficioHogarResumen {
  hogar_id: number
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
  [key: string]: string | number
}

// -- Paginated --
export interface PaginatedConsulta {
  items: BeneficioHogarResumen[]
  total: number
  offset: number
  limit: number
}

// -- Dashboard stats --
export interface DepartamentoCount {
  departamento: string
  codigo: string
  cantidad: number
}

export interface IntervencionCount {
  intervencion: string
  cantidad: number
}

export interface ConsultaDashboardStats {
  total_hogares: number
  departamentos_cubiertos: number
  municipios_cubiertos: number
  total_personas: number
  por_departamento: DepartamentoCount[]
  por_intervencion: IntervencionCount[]
}

// -- Catalogos --
export interface CatalogoItem {
  code: string
  name: string
}

export interface ConsultaCatalogosResponse {
  departamentos: CatalogoItem[]
}
