export type DemoAudience = 'staff' | 'parents'

export type DemoStep =
  | { action: 'wait'; ms: number }
  | { action: 'move'; target: string }
  | { action: 'click'; target: string }
  | { action: 'type'; target: string; text: string }

export type DemoTopic = {
  slug: string
  audience: DemoAudience
  groupKey: string
  src: string
  addressBar: string
  steps: DemoStep[]
}
