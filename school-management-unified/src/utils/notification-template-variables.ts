/**
 * Replace `{{ key }}` placeholders (spaces inside braces allowed). Keys may include dots.
 * Must match backend `applyNotificationTemplateVariables` in notification-template.service.ts.
 */
export function applyNotificationTemplateVariables(
  template: string | null | undefined,
  variables: Record<string, string>,
): string {
  if (template == null || template === '') return ''
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : `{{${key}}}`,
  )
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * HTML-context variant: every substituted value is HTML-escaped, since variables
 * (student/parent/school names) originate from user input. Keys ending in `Html`
 * (e.g. `schoolLogoHtml`) carry server-built, pre-escaped markup and are inserted as-is.
 * Must match backend `applyNotificationTemplateVariablesHtml`.
 */
export function applyNotificationTemplateVariablesHtml(
  template: string | null | undefined,
  variables: Record<string, string>,
): string {
  if (template == null || template === '') return ''
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(variables, key)) return `{{${key}}}`
    const value = String(variables[key])
    return key.endsWith('Html') ? value : escapeHtml(value)
  })
}
