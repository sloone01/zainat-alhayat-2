export type DemoAudience = 'staff' | 'parents'

export type DemoStep =
  | { action: 'say'; caption: string; ms?: number }
  | { action: 'wait'; ms: number; caption?: string }
  | { action: 'waitFor'; target: string; ms?: number; caption?: string }
  | { action: 'move'; target: string; caption?: string }
  | { action: 'scroll'; target: string; caption?: string }
  | { action: 'click'; target: string; caption?: string }
  | { action: 'type'; target: string; text: string; caption?: string }
  | { action: 'select'; target: string; value?: string; caption?: string }
  | { action: 'navigate'; path: string; caption?: string }

export type DemoTopic = {
  slug: string
  audience: DemoAudience
  groupKey: string
  src: string
  addressBar: string
  steps: DemoStep[]
}

export function demoSay(caption: string, ms = 1400): DemoStep {
  return { action: 'say', caption, ms }
}

export function captionCount(steps: DemoStep[]): number {
  return steps.filter((step) => step.action === 'say' || step.caption).length
}
