import type { DemoAudience, DemoTopic } from './types'
import { signInDemo } from './scripts/sign-in'

export const DEMO_TOPICS: DemoTopic[] = [signInDemo]

export const DEFAULT_DEMO_SLUG = signInDemo.slug

export function demoPath(slug: string): string {
  return `/demo/${slug}`
}

export function getDemoTopic(slug: string): DemoTopic | undefined {
  return DEMO_TOPICS.find((topic) => topic.slug === slug)
}

export function firstDemoSlug(audience: DemoAudience): string | undefined {
  return DEMO_TOPICS.find((topic) => topic.audience === audience)?.slug
}

export function demoAudiences(): DemoAudience[] {
  return [...new Set(DEMO_TOPICS.map((topic) => topic.audience))]
}

export function demoTopicsForAudience(audience: DemoAudience): DemoTopic[] {
  return DEMO_TOPICS.filter((topic) => topic.audience === audience)
}

export function groupKeysForAudience(audience: DemoAudience): string[] {
  const keys: string[] = []
  for (const topic of demoTopicsForAudience(audience)) {
    if (!keys.includes(topic.groupKey)) keys.push(topic.groupKey)
  }
  return keys
}
