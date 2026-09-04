<template>
  <DashboardLayout>
    <div class="space-y-4 max-w-4xl" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ $t('schoolLandingEditor.title') }}</h1>
            <p class="mt-1 text-sm text-gray-600">{{ $t('schoolLandingEditor.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="form.is_published ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'"
            >
              {{ form.is_published ? $t('schoolLandingEditor.published') : $t('schoolLandingEditor.draft') }}
            </span>
            <a
              :href="previewHref"
              target="_blank"
              rel="noopener"
              class="text-sm text-primary-700 hover:underline"
            >
              {{ $t('schoolLandingEditor.preview') }}
            </a>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2 border-b border-gray-100 pb-3">
          <button
            v-for="tab in tabs"
            :key="tab"
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-medium"
            :class="activeTab === tab ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-50'"
            @click="activeTab = tab"
          >
            {{ $t(`schoolLandingEditor.tab${tab}`) }}
          </button>
        </div>

        <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
        <p v-if="message" class="mt-3 text-sm text-emerald-700">{{ message }}</p>

        <div v-if="loading" class="py-10 text-center text-sm text-gray-500">{{ $t('common.loading') }}</div>

        <div v-else class="mt-4 space-y-4">
          <template v-if="activeTab === 'Branding'">
            <label class="block text-sm">
              <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.logoUrl') }}</span>
              <input v-model="form.logo_url" class="input mt-1" />
            </label>
            <label class="block text-sm">
              <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.heroImageUrl') }}</span>
              <input v-model="form.hero_image_url" class="input mt-1" />
            </label>
            <div class="grid sm:grid-cols-2 gap-3">
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.brandNameEn') }}</span>
                <input v-model="form.brand_name_en" class="input mt-1" />
              </label>
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.brandNameAr') }}</span>
                <input v-model="form.brand_name_ar" class="input mt-1" dir="rtl" />
              </label>
            </div>
            <label class="block text-sm">
              <span class="font-medium text-gray-700">Slug (/s/…)</span>
              <input v-model="form.landing_slug" class="input mt-1" placeholder="default" />
            </label>
          </template>

          <template v-else-if="activeTab === 'Hero'">
            <div class="grid sm:grid-cols-2 gap-3">
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.badgeEn') }}</span>
                <input v-model="form.badge_en" class="input mt-1" />
              </label>
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.badgeAr') }}</span>
                <input v-model="form.badge_ar" class="input mt-1" dir="rtl" />
              </label>
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.titleEn') }}</span>
                <input v-model="form.hero_title_en" class="input mt-1" />
              </label>
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.titleAr') }}</span>
                <input v-model="form.hero_title_ar" class="input mt-1" dir="rtl" />
              </label>
            </div>
            <label class="block text-sm">
              <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.subtitleEn') }}</span>
              <textarea v-model="form.hero_subtitle_en" rows="3" class="input mt-1" />
            </label>
            <label class="block text-sm">
              <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.subtitleAr') }}</span>
              <textarea v-model="form.hero_subtitle_ar" rows="3" class="input mt-1" dir="rtl" />
            </label>
            <div class="grid sm:grid-cols-2 gap-3">
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.ctaPrimaryEn') }}</span>
                <input v-model="form.cta_primary_en" class="input mt-1" />
              </label>
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.ctaPrimaryAr') }}</span>
                <input v-model="form.cta_primary_ar" class="input mt-1" dir="rtl" />
              </label>
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.ctaSecondaryEn') }}</span>
                <input v-model="form.cta_secondary_en" class="input mt-1" />
              </label>
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.ctaSecondaryAr') }}</span>
                <input v-model="form.cta_secondary_ar" class="input mt-1" dir="rtl" />
              </label>
            </div>
          </template>

          <template v-else-if="activeTab === 'Features'">
            <div
              v-for="(feat, idx) in form.features"
              :key="idx"
              class="rounded-lg border border-gray-200 p-3 space-y-2"
            >
              <div class="flex justify-between items-center">
                <span class="text-xs font-semibold text-gray-500">#{{ idx + 1 }}</span>
                <button type="button" class="text-xs text-red-600" @click="form.features.splice(idx, 1)">
                  {{ $t('common.remove') }}
                </button>
              </div>
              <div class="grid sm:grid-cols-2 gap-2">
                <input v-model="feat.title_en" class="input" :placeholder="$t('schoolLandingEditor.featureTitleEn')" />
                <input v-model="feat.title_ar" class="input" dir="rtl" :placeholder="$t('schoolLandingEditor.featureTitleAr')" />
                <textarea v-model="feat.body_en" rows="2" class="input" :placeholder="$t('schoolLandingEditor.featureBodyEn')" />
                <textarea v-model="feat.body_ar" rows="2" class="input" dir="rtl" :placeholder="$t('schoolLandingEditor.featureBodyAr')" />
              </div>
            </div>
            <button type="button" class="text-sm font-medium text-primary-700" @click="addFeature">
              + {{ $t('schoolLandingEditor.addFeature') }}
            </button>
          </template>

          <template v-else-if="activeTab === 'Testimonials'">
            <div
              v-for="(item, idx) in form.testimonials"
              :key="idx"
              class="rounded-lg border border-gray-200 p-3 space-y-2"
            >
              <div class="flex justify-between">
                <span class="text-xs font-semibold text-gray-500">#{{ idx + 1 }}</span>
                <button type="button" class="text-xs text-red-600" @click="form.testimonials.splice(idx, 1)">
                  {{ $t('common.remove') }}
                </button>
              </div>
              <textarea v-model="item.quote_en" rows="2" class="input" :placeholder="$t('schoolLandingEditor.quoteEn')" />
              <textarea v-model="item.quote_ar" rows="2" class="input" dir="rtl" :placeholder="$t('schoolLandingEditor.quoteAr')" />
              <div class="grid sm:grid-cols-2 gap-2">
                <input v-model="item.author_en" class="input" :placeholder="$t('schoolLandingEditor.authorEn')" />
                <input v-model="item.author_ar" class="input" dir="rtl" :placeholder="$t('schoolLandingEditor.authorAr')" />
                <input v-model="item.role_en" class="input" :placeholder="$t('schoolLandingEditor.roleEn')" />
                <input v-model="item.role_ar" class="input" dir="rtl" :placeholder="$t('schoolLandingEditor.roleAr')" />
              </div>
            </div>
            <button type="button" class="text-sm font-medium text-primary-700" @click="addTestimonial">
              + {{ $t('schoolLandingEditor.addTestimonial') }}
            </button>
          </template>

          <template v-else>
            <div class="grid sm:grid-cols-2 gap-3">
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.phone') }}</span>
                <input v-model="form.phone" class="input mt-1" />
              </label>
              <label class="block text-sm">
                <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.email') }}</span>
                <input v-model="form.email" type="email" class="input mt-1" />
              </label>
            </div>
            <label class="block text-sm">
              <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.addressEn') }}</span>
              <textarea v-model="form.address_en" rows="2" class="input mt-1" />
            </label>
            <label class="block text-sm">
              <span class="font-medium text-gray-700">{{ $t('schoolLandingEditor.addressAr') }}</span>
              <textarea v-model="form.address_ar" rows="2" class="input mt-1" dir="rtl" />
            </label>
          </template>

          <div class="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              :disabled="saving"
              @click="save(false)"
            >
              {{ $t('schoolLandingEditor.saveDraft') }}
            </button>
            <button
              type="button"
              class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="saving"
              @click="save(true)"
            >
              {{ $t('schoolLandingEditor.publish') }}
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
  @apply w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500;
}
</style>
