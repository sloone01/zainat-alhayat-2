import { DEMO_PASSWORD, DEMO_SCHOOL_SLUG, DEMO_STAFF_EMAIL } from '../defaults'
import { demoSay, type DemoTopic } from '../types'
import { withDemoQuery } from '@/utils/demo-play'

export const signInDemo: DemoTopic = {
  slug: 'sign-in',
  audience: 'staff',
  groupKey: 'staffGettingStarted',
  src: withDemoQuery(`/s/${DEMO_SCHOOL_SLUG}/login`, 'staff'),
  addressBar: `fikr.om/s/${DEMO_SCHOOL_SLUG}/login`,
  steps: [
    { action: 'wait', ms: 500 },
    { action: 'waitFor', target: '[data-demo="email"]', ms: 10000 },
    demoSay('demo.say.signInEmail'),
    { action: 'move', target: '[data-demo="email"]' },
    { action: 'type', target: '[data-demo="email"]', text: DEMO_STAFF_EMAIL },
    { action: 'wait', ms: 280 },
    demoSay('demo.say.signInPassword'),
    { action: 'move', target: '[data-demo="password"]' },
    { action: 'type', target: '[data-demo="password"]', text: DEMO_PASSWORD },
    { action: 'wait', ms: 280 },
    demoSay('demo.say.signInSubmit'),
    { action: 'move', target: '[data-demo="submit"]' },
    { action: 'click', target: '[data-demo="submit"]' },
    { action: 'waitFor', target: '[data-demo="page"]', ms: 14000 },
    demoSay('demo.say.signInHome'),
    { action: 'move', target: '[data-demo="page"]' },
    { action: 'wait', ms: 900 },
  ],
}
