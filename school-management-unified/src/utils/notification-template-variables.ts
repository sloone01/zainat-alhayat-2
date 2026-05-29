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
