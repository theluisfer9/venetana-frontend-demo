export interface DataSourceColumn {
  column_name: string
  label: string
  data_type: string
  category: string
  is_selectable: boolean
  is_filterable: boolean
}

export interface AvailableDataSource {
  id: string
  code: string
  name: string
  columns: DataSourceColumn[]
}

export interface QueryFilter {
  column: string
  op: string
  value: string | number | boolean | string[]
}

export interface QueryExecuteRequest {
  datasource_id: string
  columns: string[]
  filters: QueryFilter[]
  offset: number
  limit: number
}

export interface ColumnMeta {
  column_name: string
  label: string
  data_type: string
}

export interface QueryExecuteResponse {
  items: Record<string, unknown>[]
  total: number
  offset: number
  limit: number
  columns_meta: ColumnMeta[]
}

export interface SavedQueryListItem {
  id: string
  name: string
  description: string | null
  datasource_name: string
  column_count: number
  filter_count: number
  is_shared: boolean
  institution_id: string | null
  institution_name: string | null
  created_at: string
}

export interface SavedQueryDetail {
  id: string
  name: string
  description: string | null
  datasource_id: string
  datasource_name: string
  selected_columns: string[]
  filters: QueryFilter[]
  is_shared: boolean
  institution_id: string | null
  institution_name: string | null
  created_at: string
}

export interface SavedQueryCreateBody {
  datasource_id: string
  name: string
  description?: string | null
  selected_columns: string[]
  filters: { column: string; op: string; value: unknown }[]
  institution_id?: string | null
  is_shared?: boolean
}

export interface SavedQueryUpdateBody {
  name?: string
  description?: string | null
  selected_columns?: string[]
  filters?: { column: string; op: string; value: unknown }[]
  institution_id?: string | null
  is_shared?: boolean
}

export interface Institution {
  id: string
  code: string
  name: string
  description: string | null
  is_active: boolean
}
