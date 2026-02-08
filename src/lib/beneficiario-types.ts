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

// ── Persona (miembro del hogar) ─────────────────────────────────────

export interface PersonaResumen {
  personas_id: number
  correlativo: number
  cui: number | null
  nombre_completo: string
  genero: string
  fecha_nacimiento: string | null
  edad: number
  estado_civil: string
  celular: number | null
  parentesco: string
  pueblo: string
  comunidad_linguistica: string
  idioma_materno: string
  dificultad_ver: string
  dificultad_oir: string
  dificultad_caminar: string
  dificultad_recordar: string
  dificultad_cuidado_personal: string
  dificultad_entender: string
  embarazada: string
  sabe_leer_escribir: string
  inscrito_escuela: string
  nivel_educativo: string
  actividad_principal: string
  tiene_ingreso: string
}

// ── Vivienda detalle ────────────────────────────────────────────────

export interface ViviendaDetalle {
  condicion_vivienda: string
  tipo_vivienda: string
  material_paredes: string
  material_techo: string
  material_piso: string
  tenencia: string
  propietario: string
  personas_habituales: number
  personas_hogar: number
  hombres: number
  mujeres: number
  ninos: number
  ninas: number
  cuartos: number
  dormitorios: number
  cocina_exclusiva: string
  combustible_cocina: string
  usa_lenia: string
  lugar_cocina: string
  chimenea: string
  fuente_agua: string
  dias_sin_agua: number
  tratamiento_agua: string
  tipo_sanitario: string
  uso_sanitario: string
  aguas_grises: string
  alumbrado: string
  dias_sin_electricidad: number
  eliminacion_basura: string
  radio: string
  estufa_lenia: string
  estufa_gas: string
  televisor: string
  refrigerador: string
  lavadora: string
  computadora: string
  internet: string
  moto: string
  carro: string
  preocupacion_alimentos: string
  sin_alimentos: string
  adulto_sin_alimentacion_saludable: string
  nino_sin_alimentacion_saludable: string
  adulto_sin_variedad: string
  nino_sin_variedad: string
  adulto_sin_tiempo_comida: string
  nino_sin_tiempo_comida: string
  adulto_comio_menos: string
  nino_comio_menos: string
  adulto_sintio_hambre: string
  nino_sintio_hambre: string
  adulto_comio_una_vez: string
  nino_comio_una_vez: string
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
