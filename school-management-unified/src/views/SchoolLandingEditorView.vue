<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('schoolLandingEditor.title')"
        :subtitle="$t('schoolLandingEditor.subtitle')"
      >
        <template #actions>
          <span
            class="fk-chip"
            :class="form.is_published ? 'bg-primary-500/20 text-primary-200' : 'bg-white/10 text-white/80'"
          >
            {{ form.is_published ? $t('schoolLandingEditor.published') : $t('schoolLandingEditor.draft') }}
          </span>
          <a
            :href="previewHref"
            target="_blank"
            rel="noopener"
            class="fk-btn fk-btn--pearl fk-btn--sm"
          >
            {{ $t('schoolLandingEditor.preview') }}
          </a>
        </template>
      </FikrPageHeader>

      <div class="fk-card max-w-4xl p-5 sm:p-6">
        <div class="flex flex-wrap gap-2 rounded-pill bg-fikr-surface-low p-1.5">
          <button
            v-for="(tab, i) in tabs"
            :key="tab"
            type="button"
            class="inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-[13px] font-medium transition-colors"
            :class="activeTab === tab ? 'bg-white text-fikr-ink ring-1 ring-fikr-hairline' : 'text-fikr-ink-soft hover:text-fikr-ink'"
            @click="activeTab = tab"
          >
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold"
              :class="activeTab === tab ? 'bg-navy-800 text-white' : 'bg-fikr-surface-high text-fikr-ink-muted'"
            >{{ i + 1 }}</span>
            {{ $t(`schoolLandingEditor.tab${tab}`) }}
          </button>
        </div>

        <p v-if="error" class="fk-alert fk-alert--error mt-4">{{ error }}</p>
        <p v-if="message" class="fk-alert fk-alert--ok mt-4">{{ message }}</p>

        <div v-if="loading" class="py-10 text-center text-sm text-fikr-ink-soft">{{ $t('common.loading') }}</div>

        <div v-else class="fk-form mt-5">
          <template v-if="activeTab === 'Branding'">
            <label class="fk-form__row block">
              <span class="fk-flabel">{{ $t('schoolLandingEditor.logoUrl') }}</span>
              <input v-model="form.logo_url" class="fk-field" />
            </label>
            <label class="fk-form__row block">
              <span class="fk-flabel">{{ $t('schoolLandingEditor.heroImageUrl') }}</span>
              <input v-model="form.hero_image_url" class="fk-field" />
            </label>
            <div class="fk-form__grid">
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.brandNameEn') }}</span>
                <input v-model="form.brand_name_en" class="fk-field" />
              </label>
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.brandNameAr') }}</span>
                <input v-model="form.brand_name_ar" class="fk-field" dir="rtl" />
              </label>
            </div>
            <label class="fk-form__row block">
              <span class="fk-flabel">Slug (/s/…)</span>
              <input v-model="form.landing_slug" class="fk-field" placeholder="default" />
            </label>
          </template>

          <template v-else-if="activeTab === 'Hero'">
            <div class="fk-form__grid">
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.badgeEn') }}</span>
                <input v-model="form.badge_en" class="fk-field" />
              </label>
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.badgeAr') }}</span>
                <input v-model="form.badge_ar" class="fk-field" dir="rtl" />
              </label>
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.titleEn') }}</span>
                <input v-model="form.hero_title_en" class="fk-field" />
              </label>
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.titleAr') }}</span>
                <input v-model="form.hero_title_ar" class="fk-field" dir="rtl" />
              </label>
            </div>
            <label class="fk-form__row block">
              <span class="fk-flabel">{{ $t('schoolLandingEditor.subtitleEn') }}</span>
              <textarea v-model="form.hero_subtitle_en" rows="3" class="fk-field" />
            </label>
            <label class="fk-form__row block">
              <span class="fk-flabel">{{ $t('schoolLandingEditor.subtitleAr') }}</span>
              <textarea v-model="form.hero_subtitle_ar" rows="3" class="fk-field" dir="rtl" />
            </label>
            <div class="fk-form__grid">
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.ctaPrimaryEn') }}</span>
                <input v-model="form.cta_primary_en" class="fk-field" />
              </label>
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.ctaPrimaryAr') }}</span>
                <input v-model="form.cta_primary_ar" class="fk-field" dir="rtl" />
              </label>
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.ctaSecondaryEn') }}</span>
                <input v-model="form.cta_secondary_en" class="fk-field" />
              </label>
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.ctaSecondaryAr') }}</span>
                <input v-model="form.cta_secondary_ar" class="fk-field" dir="rtl" />
              </label>
            </div>
          </template>

          <template v-else-if="activeTab === 'Features'">
            <div
              v-for="(feat, idx) in form.features"
              :key="idx"
              class="rounded-lg bg-fikr-pearl p-4 space-y-3 ring-1 ring-fikr-hairline"
            >
              <div class="flex justify-between items-center">
                <span class="fk-form__eyebrow">#{{ idx + 1 }}</span>
                <button type="button" class="text-xs text-red-600" @click="form.features.splice(idx, 1)">
                  {{ $t('common.remove') }}
                </button>
              </div>
              <div class="fk-form__grid">
                <input v-model="feat.title_en" class="fk-field" :placeholder="$t('schoolLandingEditor.featureTitleEn')" />
                <input v-model="feat.title_ar" class="fk-field" dir="rtl" :placeholder="$t('schoolLandingEditor.featureTitleAr')" />
                <textarea v-model="feat.body_en" rows="2" class="fk-field" :placeholder="$t('schoolLandingEditor.featureBodyEn')" />
                <textarea v-model="feat.body_ar" rows="2" class="fk-field" dir="rtl" :placeholder="$t('schoolLandingEditor.featureBodyAr')" />
              </div>
            </div>
            <button type="button" class="fk-btn fk-btn--ghost fk-btn--sm" @click="addFeature">
              + {{ $t('schoolLandingEditor.addFeature') }}
            </button>
          </template>

          <template v-else-if="activeTab === 'Testimonials'">
            <div
              v-for="(item, idx) in form.testimonials"
              :key="idx"
              class="rounded-lg bg-fikr-pearl p-4 space-y-3 ring-1 ring-fikr-hairline"
            >
              <div class="flex justify-between">
                <span class="fk-form__eyebrow">#{{ idx + 1 }}</span>
                <button type="button" class="text-xs text-red-600" @click="form.testimonials.splice(idx, 1)">
                  {{ $t('common.remove') }}
                </button>
              </div>
              <textarea v-model="item.quote_en" rows="2" class="fk-field" :placeholder="$t('schoolLandingEditor.quoteEn')" />
              <textarea v-model="item.quote_ar" rows="2" class="fk-field" dir="rtl" :placeholder="$t('schoolLandingEditor.quoteAr')" />
              <div class="fk-form__grid">
                <input v-model="item.author_en" class="fk-field" :placeholder="$t('schoolLandingEditor.authorEn')" />
                <input v-model="item.author_ar" class="fk-field" dir="rtl" :placeholder="$t('schoolLandingEditor.authorAr')" />
                <input v-model="item.role_en" class="fk-field" :placeholder="$t('schoolLandingEditor.roleEn')" />
                <input v-model="item.role_ar" class="fk-field" dir="rtl" :placeholder="$t('schoolLandingEditor.roleAr')" />
              </div>
            </div>
            <button type="button" class="fk-btn fk-btn--ghost fk-btn--sm" @click="addTestimonial">
              + {{ $t('schoolLandingEditor.addTestimonial') }}
            </button>
          </template>

          <template v-else>
            <div class="fk-form__grid">
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.phone') }}</span>
                <input v-model="form.phone" class="fk-field" />
              </label>
              <label class="fk-form__row block">
                <span class="fk-flabel">{{ $t('schoolLandingEditor.email') }}</span>
                <input v-model="form.email" type="email" class="fk-field" />
              </label>
            </div>
            <label class="fk-form__row block">
              <span class="fk-flabel">{{ $t('schoolLandingEditor.addressEn') }}</span>
              <textarea v-model="form.address_en" rows="2" class="fk-field" />
            </label>
            <label class="fk-form__row block">
              <span class="fk-flabel">{{ $t('schoolLandingEditor.addressAr') }}</span>
              <textarea v-model="form.address_ar" rows="2" class="fk-field" dir="rtl" />
            </label>
          </template>

          <div class="flex items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--pearl" :disabled="saving" @click="save(false)">
              {{ $t('schoolLandingEditor.saveDraft') }}
            </button>
            <button type="button" class="fk-btn fk-btn--primary" :disabled="saving" @click="save(true)">
              {{ $t('schoolLandingEditor.publish') }}
              <svg class="h-4 w-4 rtl:-scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import {
  schoolLandingService,
  type LandingFeatureItem,
  type LandingTestimonialItem,
} from '@/services/school-landing.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const tabs = ['Branding', 'Hero', 'Features', 'Testimonials', 'Contact'] as const
const activeTab = ref<(typeof tabs)[number]>('Hero')
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const message = ref('')
const previewHref = computed(() => {
  const slug = (form.landing_slug || '').trim()
  return slug ? `/s/${slug}` : '/s/zinat-al-haya'
})

const form = reactive({
  landing_slug: '' as string | null,
  logo_url: '' as string | null,
  hero_image_url: '' as string | null,
  brand_name_en: '' as string | null,
  brand_name_ar: '' as string | null,
  badge_en: '' as string | null,
  badge_ar: '' as string | null,
  hero_title_en: '' as string | null,
  hero_title_ar: '' as string | null,
  hero_subtitle_en: '' as string | null,
  hero_subtitle_ar: '' as string | null,
  cta_primary_en: '' as string | null,
  cta_primary_ar: '' as string | null,
  cta_secondary_en: '' as string | null,
  cta_secondary_ar: '' as string | null,
  features: [] as LandingFeatureItem[],
  testimonials: [] as LandingTestimonialItem[],
  phone: '' as string | null,
  email: '' as string | null,
  address_en: '' as string | null,
  address_ar: '' as string | null,
  is_published: false,
})

function addFeature() {
  form.features.push({ title_en: '', title_ar: '', body_en: '', body_ar: '' })
}

function addTestimonial() {
  form.testimonials.push({
    quote_en: '',
    quote_ar: '',
    author_en: '',
    author_ar: '',
    role_en: '',
    role_ar: '',
  })
}

function apply(data: Awaited<ReturnType<typeof schoolLandingService.getAdmin>>) {
  form.landing_slug = data.landing_slug || ''
  form.logo_url = data.logo_url || ''
  form.hero_image_url = data.hero_image_url || ''
  form.brand_name_en = data.brand_name_en || ''
  form.brand_name_ar = data.brand_name_ar || ''
  form.badge_en = data.badge_en || ''
  form.badge_ar = data.badge_ar || ''
  form.hero_title_en = data.hero_title_en || ''
  form.hero_title_ar = data.hero_title_ar || ''
  form.hero_subtitle_en = data.hero_subtitle_en || ''
  form.hero_subtitle_ar = data.hero_subtitle_ar || ''
  form.cta_primary_en = data.cta_primary_en || ''
  form.cta_primary_ar = data.cta_primary_ar || ''
  form.cta_secondary_en = data.cta_secondary_en || ''
  form.cta_secondary_ar = data.cta_secondary_ar || ''
  form.features = [...(data.features || [])]
  form.testimonials = [...(data.testimonials || [])]
  form.phone = data.phone || ''
  form.email = data.email || ''
  form.address_en = data.address_en || ''
  form.address_ar = data.address_ar || ''
  form.is_published = !!data.is_published
}

async function save(publish: boolean) {
  saving.value = true
  error.value = ''
  message.value = ''
  try {
    const data = await schoolLandingService.saveAdmin({
      ...form,
      landing_slug: form.landing_slug || null,
      // Publish forces live; Save draft updates content without unpublishing
      is_published: publish ? true : form.is_published,
    })
    apply(data)
    message.value = publish
      ? t('schoolLandingEditor.publishedOk')
      : t('schoolLandingEditor.saved')
  } catch (e: any) {
    error.value = e?.message || t('schoolLandingEditor.saveError')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    apply(await schoolLandingService.getAdmin())
  } catch (e: any) {
    error.value = e?.message || t('schoolLandingEditor.loadError')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.input {
  @apply w-full rounded-lg border border-fikr-hairline bg-white px-3 py-2.5 text-sm text-fikr-ink placeholder:text-fikr-ink-soft focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20;
}
</style>
