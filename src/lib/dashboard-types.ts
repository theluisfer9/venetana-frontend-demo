export interface DashboardDepartamentoCount {
  departamento: string
  codigo: string
  cantidad: number
}

export interface DashboardClasificacionCount {
  clasificacion: string
  cantidad: number
}

export interface DashboardClasificacionDepartamentoCount {
  departamento: string
  codigo: string
  clasificacion: string
  cantidad: number
}

export interface DashboardInseguridadCount {
  nivel: string
  cantidad: number
}

export interface DashboardSexoCount {
  sexo: string
  cantidad: number
}

export interface DashboardInstitutionUsersCount {
  institution: string
  code: string
  usuarios: number
  consultas: number
}

export interface DashboardInstitutionBeneficiariosCount {
  institution: string
  code: string
  potenciales_beneficiarios: number
}

export interface AdminDashboardStats {
  total_instituciones: number
  total_usuarios: number
  total_consultas_guardadas: number
  usuarios_por_institucion: DashboardInstitutionUsersCount[]
  beneficiarios_por_institucion: DashboardInstitutionBeneficiariosCount[]
  total_hogares: number
  total_personas: number
  departamentos_cubiertos: number
  municipios_cubiertos: number
  lugares_poblados: number
  municipios_finalizados: number
  municipios_en_progreso: number
  promedio_ipm: number
  promedio_pmt: number
  promedio_nbi: number
  por_ipm_clasificacion: DashboardClasificacionCount[]
  por_nbi_clasificacion: DashboardClasificacionCount[]
  por_pmt_clasificacion: DashboardClasificacionCount[]
  ipm_por_departamento: DashboardClasificacionDepartamentoCount[]
  pmt_por_departamento: DashboardClasificacionDepartamentoCount[]
  nbi_por_departamento: DashboardClasificacionDepartamentoCount[]
  personas_por_sexo: DashboardSexoCount[]
  por_departamento: DashboardDepartamentoCount[]
  inseguridad_alimentaria: DashboardInseguridadCount[]
}

export interface DashboardBonos {
  total_intervenciones: number
  [key: string]: number
}

export interface DashboardBonosDepartamento {
  departamento: string
  codigo: string
  total_intervenciones: number
  [key: string]: string | number
}

export interface InstitutionalDashboardStats {
  institution_name: string
  institution_code: string
  total_hogares: number
  total_personas: number
  departamentos_cubiertos: number
  municipios_cubiertos: number
  lugares_poblados: number
  municipios_finalizados: number
  municipios_en_progreso: number
  promedio_ipm: number
  promedio_pmt: number
  promedio_nbi: number
  por_ipm_clasificacion: DashboardClasificacionCount[]
  por_nbi_clasificacion: DashboardClasificacionCount[]
  por_pmt_clasificacion: DashboardClasificacionCount[]
  ipm_por_departamento: DashboardClasificacionDepartamentoCount[]
  pmt_por_departamento: DashboardClasificacionDepartamentoCount[]
  nbi_por_departamento: DashboardClasificacionDepartamentoCount[]
  personas_por_sexo: DashboardSexoCount[]
  por_departamento: DashboardDepartamentoCount[]
  inseguridad_alimentaria: DashboardInseguridadCount[]
  total_consultas: number
  total_fuentes_datos: number
  bonos: DashboardBonos
  bonos_por_departamento: DashboardBonosDepartamento[]
}

export type UnifiedDashboardStats = AdminDashboardStats | InstitutionalDashboardStats
