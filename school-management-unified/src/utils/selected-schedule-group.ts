const STORAGE_KEY = 'schedule.selectedGroupId'

export function getSelectedScheduleGroupId(): string {
  try {
    return String(sessionStorage.getItem(STORAGE_KEY) || '').trim()
  } catch {
    return ''
  }
}

export function setSelectedScheduleGroupId(id: string | null | undefined): void {
  try {
    const value = String(id || '').trim()
    if (value) sessionStorage.setItem(STORAGE_KEY, value)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
