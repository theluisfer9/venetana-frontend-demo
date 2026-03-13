/**
 * Permission module prefixes.
 * Permission codes from the backend follow the pattern "module:action",
 * e.g. "users:create", "datasources:manage".
 */
export const PermissionModule = {
  USERS: 'users',
  ROLES: 'roles',
  BENEFICIARIES: 'beneficiaries',
  DATABASES: 'databases',
  REPORTS: 'reports',
  DATASOURCES: 'datasources',
  SYSTEM: 'system',
} as const

export type PermissionModuleValue = (typeof PermissionModule)[keyof typeof PermissionModule]

/** Check if a permissions array contains a specific permission code. */
export function hasPermission(
  permissions: string[] | undefined | null,
  permission: string,
): boolean {
  if (!permissions || permissions.length === 0) return false
  return permissions.includes(permission)
}

/** Check if a permissions array contains ANY permission within a module. */
export function hasModuleAccess(
  permissions: string[] | undefined | null,
  module: PermissionModuleValue,
): boolean {
  if (!permissions || permissions.length === 0) return false
  const prefix = `${module}:`
  return permissions.some((p) => p.startsWith(prefix))
}
