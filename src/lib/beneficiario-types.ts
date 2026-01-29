// ── Catalogos ─────────────────────────────────────────────────────────

export interface CatalogoItem {
  code: string
  name: string
}

export interface MunicipioItem {
  code: string
  name: string
  departamento_code: string
}

export interface CatalogosResponse {
  departamentos: CatalogoItem[]
  instituciones: CatalogoItem[]
  tipos_intervencion: CatalogoItem[]
  niveles_privacion: CatalogoItem[]
}

// ── Filtros ───────────────────────────────────────────────────────────

export interface BeneficiarioFilters {
  departamento_code?: string
  municipio_code?: string
  institucion_code?: string
  tipo_intervencion_code?: string
  sin_intervencion?: boolean
  genero?: string
  edad_min?: number
  edad_max?: number
  miembros_hogar_min?: number
  miembros_hogar_max?: number
  con_menores_5?: boolean
  con_adultos_mayores?: boolean
  nivel_privacion?: string
  ipm_min?: number
  ipm_max?: number
  buscar?: string
}

// ── Intervencion ─────────────────────────────────────────────────────

export interface Intervencion {
  institucion_code: string
  institucion_name: string
  tipo_code: string
  tipo_name: string
}

// ── Beneficiario resumen (lista) ─────────────────────────────────────

export interface BeneficiarioResumen {
  id: number
  dpi: string
  nombre_completo: string
  genero: string
  edad: number
  departamento: string
  municipio: string
  ipm: number
  nivel_privacion: string
  num_intervenciones: number
}

// ── Beneficiario detalle ─────────────────────────────────────────────

export interface BeneficiarioDetail {
  id: number
  dpi: string
  primer_nombre: string
  segundo_nombre: string
  primer_apellido: string
  segundo_apellido: string
  nombre_completo: string
  genero: string
  fecha_nacimiento: string
  edad: number
  departamento_code: string
  departamento: string
  municipio_code: string
  municipio: string
  miembros_hogar: number
  menores_5: number
  adultos_mayores: number
  ipm: number
  nivel_privacion: string
  intervenciones: Intervencion[]
}

// ── Paginacion ───────────────────────────────────────────────────────

export interface PaginatedResponse {
  items: BeneficiarioResumen[]
  total: number
  offset: number
  limit: number
}

// ── Stats ────────────────────────────────────────────────────────────

export interface BeneficiarioStats {
  total: number
  promedio_ipm: number
  genero_f: number
  genero_m: number
  hogares_con_menores: number
  hogares_con_adultos_mayores: number
  por_nivel_privacion: Record<string, number>
  por_departamento: Record<string, number>
}

// ── Dashboard ────────────────────────────────────────────────────────

export interface TopIntervencion {
  name: string
  count: number
}

export interface DashboardStats {
  total_beneficiarios: number
  departamentos_cubiertos: number
  cobertura_intervenciones: number
  promedio_ipm: number
  por_departamento: Record<string, number>
  top_intervenciones: TopIntervencion[]
}
