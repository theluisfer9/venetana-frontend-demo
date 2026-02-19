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
  datasource_name: string
  column_count: number
  filter_count: number
  created_at: string
}

export interface SavedQueryDetail {
  id: string
  name: string
  datasource_id: string
  datasource_name: string
  selected_columns: string[]
  filters: QueryFilter[]
  created_at: string
}
