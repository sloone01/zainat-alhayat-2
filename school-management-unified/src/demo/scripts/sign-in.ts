import type { DemoTopic } from '../types'

export const signInDemo: DemoTopic = {
  slug: 'sign-in',
  audience: 'staff',
  groupKey: 'staffGettingStarted',
  src: '/s/zinat-al-haya/login?demo=play',
  addressBar: 'fikr.om/s/zinat-al-haya/login',
  steps: [
    { action: 'wait', ms: 500 },
    { action: 'move', target: '[data-demo="email"]' },
    { action: 'type', target: '[data-demo="email"]', text: 'admin@school.com' },
    { action: 'wait', ms: 280 },
    { action: 'move', target: '[data-demo="password"]' },
    { action: 'type', target: '[data-demo="password"]', text: 'DemoPass1' },
    { action: 'wait', ms: 280 },
    { action: 'move', target: '[data-demo="submit"]' },
    { action: 'click', target: '[data-demo="submit"]' },
    { action: 'wait', ms: 700 },
  ],
}
