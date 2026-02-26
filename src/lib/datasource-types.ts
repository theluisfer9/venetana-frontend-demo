// ── DataSource ──

export interface DataSourceColumn {
  id: string
  column_name: string
  label: string
  description: string | null
  data_type: string
  category: string
  is_selectable: boolean
  is_filterable: boolean
  is_groupable: boolean
  display_order: number
}

export interface DataSource {
  id: string
  code: string
  name: string
  description: string | null
  ch_table: string
  base_filter_columns: string[]
  base_filter_logic: string
  institution_id: string | null
  is_active: boolean
  columns: DataSourceColumn[]
}

export interface DataSourceListItem {
  id: string
  code: string
  name: string
  description: string | null
  ch_table: string
  base_filter_columns: string[]
  is_active: boolean
  column_count: number
}

export interface DataSourceCreateBody {
  code: string
  name: string
  description?: string | null
  ch_table: string
  base_filter_columns?: string[]
  base_filter_logic?: string
  institution_id?: string | null
}

export interface DataSourceUpdateBody {
  name?: string
  description?: string | null
  ch_table?: string
  base_filter_columns?: string[]
  base_filter_logic?: string
  institution_id?: string | null
  is_active?: boolean
}

export interface ChColumn {
  name: string
  type: string
}
