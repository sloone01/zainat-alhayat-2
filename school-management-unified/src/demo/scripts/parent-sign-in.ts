import { DEMO_PARENT_EMAIL, DEMO_PASSWORD, DEMO_SCHOOL_SLUG } from '../defaults'
import { demoSay, type DemoTopic } from '../types'
import { withDemoQuery } from '@/utils/demo-play'

export const parentSignInDemo: DemoTopic = {
  slug: 'parent-sign-in',
  audience: 'parents',
  groupKey: 'parentGettingStarted',
  src: withDemoQuery(`/s/${DEMO_SCHOOL_SLUG}/login`, 'parents'),
  addressBar: `fikr.om/s/${DEMO_SCHOOL_SLUG}/login`,
  steps: [
    { action: 'wait', ms: 500 },
    { action: 'waitFor', target: '[data-demo="email"]', ms: 10000 },
    demoSay('demo.say.parentEmail'),
    { action: 'move', target: '[data-demo="email"]' },
    { action: 'type', target: '[data-demo="email"]', text: DEMO_PARENT_EMAIL },
    { action: 'wait', ms: 280 },
    demoSay('demo.say.parentPassword'),
    { action: 'move', target: '[data-demo="password"]' },
    { action: 'type', target: '[data-demo="password"]', text: DEMO_PASSWORD },
    { action: 'wait', ms: 280 },
    demoSay('demo.say.parentSubmit'),
    { action: 'move', target: '[data-demo="submit"]' },
    { action: 'click', target: '[data-demo="submit"]' },
    { action: 'waitFor', target: '[data-demo="page"]', ms: 14000 },
    demoSay('demo.say.parentHome'),
    { action: 'move', target: '[data-demo="page"]' },
    { action: 'wait', ms: 900 },
  ],
}
