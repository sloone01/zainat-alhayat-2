export type DocsAudience = 'staff' | 'parents'

/** How the same module appears for other personas (school-admin manuals). */
export type DocsAppearsAs = {
  teacher?: string
  parent?: string
  driver?: string
}

export type DocsArticle = {
  title: string
  intro: string
  who: string
  when: string
  steps: string[]
  notes?: string[]
  /** School-admin manuals: what teacher / parent / driver see for this module. */
  appearsAs?: DocsAppearsAs
  related?: string[]
}

export type DocsContentMap = Record<string, DocsArticle>

export type DocsNavNode = {
  id: string
  audience: DocsAudience
  groupKey: string
  children: { slug: string }[]
}
