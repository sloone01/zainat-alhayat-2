import type { RbacPageCatalog } from '@/services/rbac.service'

/**
 * School groups only see school|both pages.
 * When the school has subscription modules (`entitledPageKeys`), only those pages are pickable.
 * `null`/`undefined` entitled set = no module gate yet (show all school-scoped pages).
 */
export function filterRbacPagesForSchool(
  pages: RbacPageCatalog[],
  options: {
    schoolScoped: boolean
    entitledPageKeys?: string[] | null
  },
): RbacPageCatalog[] {
  let scoped = pages
  if (options.schoolScoped) {
    scoped = pages.filter((p) => p.scope === 'school' || p.scope === 'both')
  }
  const keys = options.entitledPageKeys
  if (Array.isArray(keys)) {
    const set = new Set(keys)
    scoped = scoped.filter((p) => set.has(p.key))
  }
  return [...scoped].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function permissionsPayload(
  permissions: Record<string, string[]>,
): { pageKey: string; actions: string[] }[] {
  return Object.entries(permissions)
    .filter(([, actions]) => actions.length > 0)
    .map(([pageKey, actions]) => ({ pageKey, actions }))
}
