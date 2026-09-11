<template>
  <div class="cp" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="cp-glow cp-glow--a" aria-hidden="true" />
    <div class="cp-glow cp-glow--b" aria-hidden="true" />
    <div class="cp-mesh" aria-hidden="true" />

    <PlatformMarketingNav />

    <main class="cp-main">
      <section v-if="sent" class="cp-thanks cp-enter" role="status">
        <div class="cp-thanks__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="cp-kicker">{{ $t('forSchools.customPlan.eyebrow') }}</p>
        <h1>{{ $t('forSchools.customPlan.thanksTitle') }}</h1>
        <p class="cp-lead">{{ $t('forSchools.customPlan.thanksBody') }}</p>
        <div class="cp-thanks__actions">
          <router-link to="/" class="cp-btn cp-btn--primary">{{ $t('forSchools.customPlan.backHome') }}</router-link>
          <router-link to="/#gallery-pricing" class="cp-btn cp-btn--ghost">{{ $t('forSchools.customPlan.backPricing') }}</router-link>
        </div>
      </section>

      <template v-else>
        <section class="cp-hero cp-enter">
          <p class="cp-kicker">{{ $t('forSchools.customPlan.eyebrow') }}</p>
          <h1>{{ $t('forSchools.customPlan.pageTitle') }}</h1>
          <p class="cp-lead">{{ $t('forSchools.customPlan.pageLead') }}</p>
          <ol class="cp-steps" aria-label="steps">
            <li :class="{ 'is-active': step === 1 }">
              <span>1</span>{{ $t('forSchools.customPlan.stepModules') }}
            </li>
            <li class="cp-steps__line" aria-hidden="true" />
            <li :class="{ 'is-active': step === 2 }">
              <span>2</span>{{ $t('forSchools.customPlan.stepContact') }}
            </li>
          </ol>
        </section>

        <section v-show="step === 1" class="cp-section cp-enter cp-enter--delay">
          <div class="cp-section__head">
            <h2>{{ $t('forSchools.customPlan.modulesHeading') }}</h2>
            <p>{{ $t('forSchools.customPlan.modulesHint') }}</p>
          </div>

          <div v-if="loading" class="cp-loading">
            <span class="cp-spinner" aria-hidden="true" />
            <span>{{ $t('common.loading') }}</span>
          </div>

          <div v-else-if="loadError" class="cp-alert">
            <p>{{ loadError }}</p>
            <button type="button" class="cp-btn cp-btn--ghost" @click="loadModules">
              {{ $t('platformBilling.tryAgain') }}
            </button>
          </div>

          <div v-else class="cp-grid">
            <button
              v-for="(mod, index) in sortedModules"
              :key="mod.code"
              type="button"
              class="cp-tile"
              :class="{ 'is-on': selectedSet.has(mod.code) }"
              :style="{ '--i': index }"
              :aria-pressed="selectedSet.has(mod.code)"
              @click="toggle(mod.code)"
            >
              <span class="cp-tile__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="moduleIcon(mod.code)" />
                </svg>
              </span>
              <span class="cp-tile__body">
                <span class="cp-tile__title">{{ moduleTitle(mod) }}</span>
                <span class="cp-tile__desc">{{ moduleDesc(mod) }}</span>
              </span>
              <span class="cp-tile__check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
            </button>
          </div>
        </section>

        <section v-show="step === 2" class="cp-section cp-enter cp-enter--delay">
          <div class="cp-section__head">
            <h2>{{ $t('forSchools.customPlan.contactHeading') }}</h2>
            <p>{{ $t('forSchools.customPlan.contactHint') }}</p>
          </div>

          <div v-if="selectedCount" class="cp-picks">
            <p class="cp-picks__label">{{ $t('forSchools.customPlan.yourPicks') }}</p>
            <ul>
              <li v-for="code in selectedCodes" :key="code">
                {{ labelFor(code) }}
              </li>
            </ul>
          </div>
          <p v-else class="cp-picks cp-picks--empty">
            {{ $t('forSchools.customPlan.noPicksYet') }}
          </p>

          <form class="cp-form" @submit.prevent="submit">
            <div class="cp-field cp-field--full">
              <label for="cp-school">{{ $t('forSchools.gallery.institution') }}</label>
              <input
                id="cp-school"
                v-model="institution"
                type="text"
                required
                minlength="2"
                maxlength="200"
                :placeholder="$t('forSchools.gallery.institutionPh')"
              >
            </div>
            <div class="cp-field">
              <label for="cp-email">{{ $t('forSchools.gallery.email') }}</label>
              <input
                id="cp-email"
                v-model="email"
                type="email"
                required
                maxlength="255"
                :placeholder="$t('forSchools.gallery.emailPh')"
              >
            </div>
            <div class="cp-field">
              <label for="cp-phone">{{ $t('forSchools.gallery.phone') }}</label>
              <input
                id="cp-phone"
                v-model="phone"
                type="tel"
                required
                minlength="5"
                maxlength="30"
                :placeholder="$t('forSchools.gallery.phonePh')"
              >
            </div>
            <div class="cp-field cp-field--full">
              <label for="cp-scope">{{ $t('forSchools.gallery.scope') }}</label>
              <select id="cp-scope" v-model="scope" required>
                <option value="small">{{ $t('forSchools.gallery.scopeSmall') }}</option>
                <option value="mid">{{ $t('forSchools.gallery.scopeMid') }}</option>
                <option value="large">{{ $t('forSchools.gallery.scopeLarge') }}</option>
              </select>
            </div>
            <div class="cp-field cp-field--full">
              <label for="cp-notes">{{ $t('forSchools.customPlan.notes') }}</label>
              <textarea
                id="cp-notes"
                v-model="notes"
                rows="4"
                maxlength="2000"
                :placeholder="$t('forSchools.customPlan.notesPh')"
              />
            </div>
            <p v-if="error" class="cp-error">{{ error }}</p>
          </form>
        </section>
      </template>
    </main>

    <footer v-if="!sent" class="cp-dock">
      <div class="cp-dock__inner">
        <div class="cp-dock__meta">
          <strong>{{ $t('forSchools.customPlan.selectedCount', { count: selectedCount }) }}</strong>
          <span>{{ $t('forSchools.customPlan.optionalNote') }}</span>
        </div>
        <div class="cp-dock__actions">
          <button
            v-if="step === 2"
            type="button"
            class="cp-btn cp-btn--ghost"
            :disabled="submitting"
            @click="step = 1"
          >
            {{ $t('forSchools.customPlan.backModules') }}
          </button>
          <button
            v-if="step === 1"
            type="button"
            class="cp-btn cp-btn--primary"
            @click="step = 2"
          >
            {{ $t('forSchools.customPlan.continueContact') }}
          </button>
          <button
            v-else
            type="button"
            class="cp-btn cp-btn--primary"
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? $t('forSchools.gallery.requesting') : $t('forSchools.customPlan.submit') }}
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PlatformMarketingNav from '@/components/PlatformMarketingNav.vue'
import {
  platformBillingService,
  type PlatformModule,
} from '@/services/platform-billing.service'
import { schoolSubscriptionService } from '@/services/school-subscription.service'
import { getErrorMessage } from '@/utils/error-reporting'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const modules = ref<PlatformModule[]>([])
const loading = ref(true)
const loadError = ref('')
const step = ref<1 | 2>(1)
const selectedCodes = ref<string[]>([])
const institution = ref('')
const email = ref('')
const phone = ref('')
const scope = ref<'small' | 'mid' | 'large'>('small')
const notes = ref('')
const submitting = ref(false)
const sent = ref(false)
const error = ref('')

const sortedModules = computed(() =>
  [...modules.value]
    .filter((m) => m.is_active !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
)

const selectedSet = computed(() => new Set(selectedCodes.value))
const selectedCount = computed(() => selectedCodes.value.length)

const DEFAULT_ICON =
  'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'

const ICONS: Record<string, string> = {
  dashboard:
    'M3 4.5A1.5 1.5 0 014.5 3h5A1.5 1.5 0 0111 4.5v5A1.5 1.5 0 019.5 11h-5A1.5 1.5 0 013 9.5v-5zM13 4.5A1.5 1.5 0 0114.5 3h5A1.5 1.5 0 0121 4.5v2A1.5 1.5 0 0119.5 8h-5A1.5 1.5 0 0113 6.5v-2zM13 11.5A1.5 1.5 0 0114.5 10h5a1.5 1.5 0 011.5 1.5v7a1.5 1.5 0 01-1.5 1.5h-5a1.5 1.5 0 01-1.5-1.5v-7zM3 14.5A1.5 1.5 0 014.5 13h5a1.5 1.5 0 011.5 1.5v4A1.5 1.5 0 019.5 20h-5A1.5 1.5 0 013 18.5v-4z',
  users_roles:
    'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  students:
    'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.908.217-1.805.494-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342',
  attendance:
    'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  schedules:
    'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  messaging:
    'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155',
  courses:
    'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  graded_courses:
    'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
  transportation:
    'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.038v-.991c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75',
  student_fees:
    'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  activities:
    'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z',
  reports:
    'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  meeting_rooms:
    'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z',
  notifications:
    'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  parent_portal:
    'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  progress:
    'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
  enrollments:
    'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  class_groups:
    'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  school_settings:
    'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.174.1.331.246.46.435l.15.194a2.25 2.25 0 002.162.82l1.275-.248a1.125 1.125 0 011.37.89l.642 2.608a1.125 1.125 0 01-.694 1.328l-1.17.483a2.25 2.25 0 00-1.326 1.52l-.14.56a2.25 2.25 0 001.326 2.647l1.08.51a1.125 1.125 0 01.588 1.381l-.642 2.608a1.125 1.125 0 01-1.37.89l-1.275-.248a2.25 2.25 0 00-2.162.82l-.15.194c-.129.189-.286.335-.46.435-.332.184-.582.496-.645.87l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a2.239 2.239 0 01-.46-.435l-.15-.194a2.25 2.25 0 00-2.162-.82l-1.275.248a1.125 1.125 0 01-1.37-.89l-.642-2.608a1.125 1.125 0 01.694-1.328l1.17-.483a2.25 2.25 0 001.326-1.52l.14-.56a2.25 2.25 0 00-1.326-2.647l-1.08-.51a1.125 1.125 0 01-.588-1.381l.642-2.608a1.125 1.125 0 011.37-.89l1.275.248a2.25 2.25 0 002.162-.82l.15-.194c.129-.189.286-.335.46-.435.332-.184.582-.496.645-.87l.213-1.28z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  weekly_plans:
    'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z',
  system_settings:
    'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75',
}

function moduleIcon(code: string) {
  return ICONS[code] || DEFAULT_ICON
}

function moduleTitle(mod: PlatformModule) {
  return (locale.value === 'ar' ? mod.name_ar : mod.name_en) || mod.code
}

function moduleDesc(mod: PlatformModule) {
  const text = (locale.value === 'ar' ? mod.description_ar : mod.description_en) || ''
  return text.trim() || t('forSchools.customPlan.noDescription')
}

function labelFor(code: string) {
  const mod = modules.value.find((m) => m.code === code)
  return mod ? moduleTitle(mod) : code
}

function toggle(code: string) {
  if (selectedCodes.value.includes(code)) {
    selectedCodes.value = selectedCodes.value.filter((c) => c !== code)
  } else {
    selectedCodes.value = [...selectedCodes.value, code]
  }
}

function normalizeEmail(raw: string) {
  return raw
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .trim()
    .toLowerCase()
}

function isValidEmail(raw: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(raw))
}

async function loadModules() {
  loading.value = true
  loadError.value = ''
  try {
    const catalog = await platformBillingService.listPublicPlans()
    modules.value = catalog.modules || []
  } catch {
    loadError.value = t('forSchools.customPlan.loadError')
    modules.value = []
  } finally {
    loading.value = false
  }
}

async function submit() {
  error.value = ''
  const schoolName = institution.value.trim()
  const emailNorm = normalizeEmail(email.value)
  const phoneNorm = phone.value.trim()
  if (!schoolName || !emailNorm || !phoneNorm) {
    error.value = t('forSchools.customPlan.requiredFields')
    return
  }
  if (!isValidEmail(emailNorm)) {
    error.value = t('forSchools.customPlan.invalidEmail')
    return
  }
  email.value = emailNorm
  submitting.value = true
  try {
    await schoolSubscriptionService.submitCustomPlanRequest({
      school_name: schoolName,
      email: emailNorm,
      phone: phoneNorm,
      scope: scope.value,
      locale: locale.value === 'en' ? 'en' : 'ar',
      module_codes: selectedCodes.value,
      notes: notes.value.trim() || undefined,
    })
    sent.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    error.value = getErrorMessage(err, t('forSchools.customPlan.submitError'))
  } finally {
    submitting.value = false
  }
}

onMounted(loadModules)
</script>

<style scoped>
.cp {
  --cp-teal: #00a19b;
  --cp-teal-deep: #00847f;
  --cp-navy: #0a2147;
  --cp-ink: #0a2147;
  --cp-muted: #5a6b80;
  --cp-pearl: #f4fbfb;
  --cp-line: #d5e4e3;
  --cp-white: #ffffff;
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(ellipse 90% 55% at 10% -10%, rgba(0, 161, 155, 0.16), transparent 55%),
    radial-gradient(ellipse 70% 45% at 100% 0%, rgba(10, 33, 71, 0.08), transparent 50%),
    linear-gradient(180deg, #f7fcfc 0%, #ffffff 38%, #f3f8f8 100%);
  color: var(--cp-ink);
  font-family: 'Work Sans', 'Noto Sans Arabic', system-ui, sans-serif;
  padding-bottom: 7.5rem;
}

.cp-glow {
  pointer-events: none;
  position: absolute;
  border-radius: 999px;
  filter: blur(48px);
  opacity: 0.55;
}
.cp-glow--a {
  top: 6rem;
  inset-inline-start: -6rem;
  width: 18rem;
  height: 18rem;
  background: rgba(0, 161, 155, 0.28);
}
.cp-glow--b {
  top: 18rem;
  inset-inline-end: -4rem;
  width: 14rem;
  height: 14rem;
  background: rgba(10, 33, 71, 0.12);
}

.cp-mesh {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(10, 33, 71, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10, 33, 71, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.35), transparent 55%);
}

.cp-main {
  position: relative;
  z-index: 1;
  max-width: 72rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 1rem;
}

.cp-enter {
  animation: cpRise 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.cp-enter--delay {
  animation-delay: 0.1s;
}

@keyframes cpRise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cp-kicker {
  margin: 0 0 0.65rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cp-teal-deep);
}

.cp-hero h1,
.cp-thanks h1 {
  margin: 0;
  font-family: 'Be Vietnam Pro', 'Noto Sans Arabic', sans-serif;
  font-size: clamp(1.85rem, 4vw, 2.75rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: var(--cp-navy);
}

.cp-lead {
  margin: 0.85rem 0 0;
  max-width: 38rem;
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--cp-muted);
}

.cp-steps {
  list-style: none;
  margin: 1.75rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
}

.cp-steps li {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--cp-muted);
}

.cp-steps li span {
  display: inline-flex;
  height: 1.65rem;
  width: 1.65rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e7f1f1;
  color: var(--cp-muted);
  font-size: 0.75rem;
}

.cp-steps li.is-active {
  color: var(--cp-navy);
}
.cp-steps li.is-active span {
  background: var(--cp-teal);
  color: white;
}

.cp-steps__line {
  width: 2rem;
  height: 2px !important;
  padding: 0 !important;
  background: var(--cp-line);
  border-radius: 999px;
}

.cp-section {
  margin-top: 2rem;
}

.cp-section__head {
  margin-bottom: 1.25rem;
}
.cp-section__head h2 {
  margin: 0;
  font-family: 'Be Vietnam Pro', 'Noto Sans Arabic', sans-serif;
  font-size: 1.35rem;
  font-weight: 750;
  color: var(--cp-navy);
}
.cp-section__head p {
  margin: 0.4rem 0 0;
  color: var(--cp-muted);
  font-size: 0.95rem;
  line-height: 1.55;
}

.cp-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--cp-muted);
}

.cp-spinner {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 3px solid rgba(0, 161, 155, 0.2);
  border-top-color: var(--cp-teal);
  animation: cpSpin 0.8s linear infinite;
}

@keyframes cpSpin {
  to {
    transform: rotate(360deg);
  }
}

.cp-alert {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.15rem;
  border-radius: 1rem;
  border: 1px solid #f3c6c6;
  background: #fff5f5;
  color: #9b1c1c;
}

.cp-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}

@media (min-width: 640px) {
  .cp-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .cp-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.cp-tile {
  --i: 0;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  text-align: start;
  padding: 1.05rem 1rem 1.05rem 1.05rem;
  min-height: 7.25rem;
  border-radius: 1.15rem;
  border: 1px solid rgba(213, 228, 227, 0.95);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8px 24px rgba(10, 33, 71, 0.04);
  cursor: pointer;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    background 0.22s ease;
  animation: cpRise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i) * 28ms);
}

.cp-tile:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 161, 155, 0.45);
  box-shadow: 0 14px 28px rgba(0, 161, 155, 0.1);
}

.cp-tile.is-on {
  border-color: rgba(0, 161, 155, 0.7);
  background: linear-gradient(160deg, rgba(0, 161, 155, 0.12), rgba(255, 255, 255, 0.95) 55%);
  box-shadow: 0 14px 30px rgba(0, 161, 155, 0.14);
}

.cp-tile__icon {
  flex-shrink: 0;
  display: inline-flex;
  height: 2.55rem;
  width: 2.55rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.85rem;
  background: rgba(0, 161, 155, 0.1);
  color: var(--cp-teal-deep);
}
.cp-tile.is-on .cp-tile__icon {
  background: var(--cp-teal);
  color: white;
}
.cp-tile__icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.cp-tile__body {
  min-width: 0;
  flex: 1;
  padding-inline-end: 1.5rem;
}

.cp-tile__title {
  display: block;
  font-family: 'Be Vietnam Pro', 'Noto Sans Arabic', sans-serif;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--cp-navy);
  line-height: 1.3;
}

.cp-tile__desc {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--cp-muted);
}

.cp-tile__check {
  position: absolute;
  top: 0.85rem;
  inset-inline-end: 0.85rem;
  display: inline-flex;
  height: 1.45rem;
  width: 1.45rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1.5px solid var(--cp-line);
  background: white;
  color: transparent;
  transition: all 0.2s ease;
}
.cp-tile.is-on .cp-tile__check {
  border-color: var(--cp-teal);
  background: var(--cp-teal);
  color: white;
  transform: scale(1.05);
}
.cp-tile__check svg {
  width: 0.85rem;
  height: 0.85rem;
}

.cp-picks {
  margin: 0 0 1.25rem;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  background: rgba(0, 161, 155, 0.08);
  border: 1px solid rgba(0, 161, 155, 0.18);
}
.cp-picks--empty {
  color: var(--cp-muted);
  font-size: 0.92rem;
}
.cp-picks__label {
  margin: 0 0 0.55rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cp-teal-deep);
}
.cp-picks ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.cp-picks li {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: white;
  border: 1px solid rgba(0, 161, 155, 0.22);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--cp-navy);
}

.cp-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.95rem;
  padding: 1.25rem;
  border-radius: 1.35rem;
  border: 1px solid var(--cp-line);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px rgba(10, 33, 71, 0.05);
}

@media (min-width: 720px) {
  .cp-form {
    grid-template-columns: 1fr 1fr;
  }
  .cp-field--full {
    grid-column: 1 / -1;
  }
}

.cp-field label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.82rem;
  font-weight: 650;
  color: var(--cp-navy);
}

.cp-field input,
.cp-field select,
.cp-field textarea {
  width: 100%;
  border-radius: 0.8rem;
  border: 1px solid #cfdcdc;
  background: #fff;
  padding: 0.7rem 0.85rem;
  font: inherit;
  color: var(--cp-ink);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.cp-field input:focus,
.cp-field select:focus,
.cp-field textarea:focus {
  outline: none;
  border-color: var(--cp-teal);
  box-shadow: 0 0 0 3px rgba(0, 161, 155, 0.18);
}

.cp-error {
  grid-column: 1 / -1;
  margin: 0;
  color: #b42318;
  font-size: 0.9rem;
  font-weight: 600;
}

.cp-thanks {
  text-align: center;
  padding: 4rem 1rem 2rem;
  max-width: 34rem;
  margin: 0 auto;
}
.cp-thanks__mark {
  display: inline-flex;
  height: 4rem;
  width: 4rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  border-radius: 999px;
  background: rgba(0, 161, 155, 0.12);
  color: var(--cp-teal-deep);
  animation: cpPop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.cp-thanks__mark svg {
  width: 2.2rem;
  height: 2.2rem;
}
.cp-thanks .cp-lead {
  margin-inline: auto;
}
.cp-thanks__actions {
  margin-top: 1.75rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
}

@keyframes cpPop {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.cp-dock {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 40;
  padding: 0.85rem 1rem calc(0.85rem + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.92);
  border-top: 1px solid rgba(213, 228, 227, 0.95);
  backdrop-filter: blur(16px);
  box-shadow: 0 -10px 30px rgba(10, 33, 71, 0.06);
}

.cp-dock__inner {
  max-width: 72rem;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
}

.cp-dock__meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.cp-dock__meta strong {
  font-size: 0.95rem;
  color: var(--cp-navy);
}
.cp-dock__meta span {
  font-size: 0.78rem;
  color: var(--cp-muted);
}

.cp-dock__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.cp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.65rem;
  padding: 0.55rem 1.15rem;
  border-radius: 0.85rem;
  font: inherit;
  font-weight: 700;
  font-size: 0.92rem;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}
.cp-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.cp-btn--primary {
  background: linear-gradient(135deg, var(--cp-teal), var(--cp-teal-deep));
  color: white;
  box-shadow: 0 10px 22px rgba(0, 161, 155, 0.28);
}
.cp-btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(0, 161, 155, 0.34);
}
.cp-btn--ghost {
  background: white;
  border-color: var(--cp-line);
  color: var(--cp-navy);
}
.cp-btn--ghost:hover:not(:disabled) {
  border-color: rgba(0, 161, 155, 0.45);
  background: rgba(0, 161, 155, 0.06);
}
</style>
