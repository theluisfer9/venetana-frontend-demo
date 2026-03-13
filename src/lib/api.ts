const BASE_URL = 'http://localhost:8000/api/v1'

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

interface WrappedResponse<T> {
  result: boolean
  message: string
  data: T
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const hasNoContent = response.status === 204 || response.headers.get('content-length') === '0'
  const contentType = response.headers.get('content-type') ?? ''
  const raw = hasNoContent ? '' : await response.text()
  const json = raw && contentType.includes('application/json') ? JSON.parse(raw) : raw || null

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      clearTokens()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
      throw new ApiError(401, 'Sesión expirada')
    }
    const message =
      (json as WrappedResponse<unknown>).message ??
      (json as { detail?: string }).detail ??
      'Error desconocido'
    throw new ApiError(response.status, message, json)
  }

  // Unwrap the middleware response envelope
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as WrappedResponse<T>).data
  }

  return json as T
}

async function download(path: string, filename: string): Promise<void> {
  const headers: Record<string, string> = {}

  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, { headers })

  if (!response.ok) {
    if (response.status === 401) {
      clearTokens()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
      throw new ApiError(401, 'Sesión expirada')
    }
    throw new ApiError(response.status, 'Error al descargar archivo')
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition')
  const serverFilename = disposition?.split('filename="')[1]?.replace('"', '')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = serverFilename || filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function downloadPost(path: string, body: unknown, filename: string): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearTokens()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
      throw new ApiError(401, 'Sesión expirada')
    }
    throw new ApiError(response.status, 'Error al descargar archivo')
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition')
  const serverFilename = disposition?.split('filename="')[1]?.replace('"', '')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = serverFilename || filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  download,
  downloadPost,
}
