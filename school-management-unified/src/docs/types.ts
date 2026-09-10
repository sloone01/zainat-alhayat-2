export type DocsAudience = 'staff' | 'parents'

export type DocsArticle = {
  title: string
  intro: string
  who: string
  when: string
  steps: string[]
  notes?: string[]
  related?: string[]
}

export type DocsContentMap = Record<string, DocsArticle>

export type DocsNavNode = {
  id: string
  audience: DocsAudience
  groupKey: string
  children: { slug: string }[]
}
