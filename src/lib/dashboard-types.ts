export interface DashboardDepartamentoCount {
  departamento: string
  codigo: string
  cantidad: number
}

export interface DashboardClasificacionCount {
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
  por_ipm_clasificacion: DashboardClasificacionCount[]
  personas_por_sexo: DashboardSexoCount[]
  por_departamento: DashboardDepartamentoCount[]
  inseguridad_alimentaria: DashboardInseguridadCount[]
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
  por_ipm_clasificacion: DashboardClasificacionCount[]
  personas_por_sexo: DashboardSexoCount[]
  por_departamento: DashboardDepartamentoCount[]
  inseguridad_alimentaria: DashboardInseguridadCount[]
  total_consultas: number
  total_fuentes_datos: number
}

export type UnifiedDashboardStats = AdminDashboardStats | InstitutionalDashboardStats
