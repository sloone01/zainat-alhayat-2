<template>
  <p v-if="loading" class="ppc-loading">{{ $t('common.loading') }}…</p>
  <div v-else-if="cards.length" class="ppc-prices" role="list">
    <article
      v-for="plan in cards"
      :key="plan.code"
      class="ppc-price"
      :class="{
        'ppc-price--featured': plan.featured,
        'ppc-price--selected': selectable && selectedCode === plan.code && !plan.contactOnly,
      }"
      role="listitem"
    >
      <span v-if="plan.featured" class="ppc-price__badge">{{ $t('forSchools.gallery.mostPopular') }}</span>
      <p class="ppc-price__name">{{ plan.name }}</p>
      <p class="ppc-price__amount" :dir="plan.yearly != null ? 'ltr' : undefined">
        <template v-if="plan.yearly != null">
          {{ formatOmr(plan.yearly) }} <span>{{ $t('forSchools.gallery.perYear') }}</span>
        </template>
        <template v-else>{{ $t('forSchools.gallery.custom') }}</template>
      </p>
      <p v-if="plan.startingMonthly != null" class="ppc-price__from">
        {{ $t('landingPricing.startingFromMonth', { amount: formatOmr(plan.startingMonthly) }) }}
      </p>
      <p v-if="plan.description" class="ppc-price__desc">{{ plan.description }}</p>
      <p v-if="plan.seats" class="ppc-price__desc">{{ plan.seatsLabel }}</p>
      <p v-if="plan.overage" class="ppc-price__desc">
        {{ $t('landingPricing.extraStudent', { amount: plan.overage }) }}
      </p>
      <p v-if="plan.addsOnBaseline" class="ppc-price__adds">
        {{ $t('landingPricing.everythingInEntryPlus') }}
      </p>
      <ul v-if="plan.bullets.length" class="ppc-list">
        <li v-for="bullet in plan.bullets" :key="bullet">{{ bullet }}</li>
      </ul>
      <p v-if="plan.extraCount > 0" class="ppc-price__desc">
        {{ $t('landingPricing.andMoreModules', { count: plan.extraCount }) }}
      </p>

      <router-link
        v-if="!selectable && !plan.contactOnly"
        :to="{ path: '/subscribe', query: { plan: plan.code }, hash: '#subscribe-plan' }"
        class="ppc-btn ppc-btn--block"
        :class="plan.featured ? 'ppc-btn--teal' : 'ppc-btn--outline'"
      >
        {{ $t('forSchools.gallery.register') }}
      </router-link>
      <router-link
        v-else-if="!selectable"
        to="/custom-plan"
        class="ppc-btn ppc-btn--outline ppc-btn--block"
      >
        {{ $t('forSchools.gallery.chooseModules') }}
      </router-link>
      <button
        v-else
        type="button"
        class="ppc-btn ppc-btn--block"
        :class="ctaClass(plan)"
        :aria-pressed="selectedCode === plan.code && !plan.contactOnly"
        @click="$emit('select', plan)"
      >
        {{ selectCta(plan) }}
      </button>
    </article>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { PublicPricingCard } from '@/utils/public-pricing-cards'

const props = defineProps<{
  cards: PublicPricingCard[]
  loading?: boolean
  selectable?: boolean
  selectedCode?: string
}>()

defineEmits<{
  select: [plan: PublicPricingCard]
}>()

const { locale, t } = useI18n()

function formatOmr(amount: number) {
  return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
    style: 'currency',
    currency: 'OMR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function selectCta(plan: PublicPricingCard) {
  if (plan.contactOnly) return t('forSchools.gallery.chooseModules')
  if (props.selectedCode === plan.code) return t('subscription.planSelected')
  return t('forSchools.gallery.register')
}

function ctaClass(plan: PublicPricingCard) {
  if (plan.contactOnly) return 'ppc-btn--outline'
  if (props.selectedCode === plan.code) return 'ppc-btn--teal'
  return plan.featured ? 'ppc-btn--teal' : 'ppc-btn--outline'
}
</script>

<style scoped>
.ppc-prices,
.ppc-price,
.ppc-btn,
.ppc-list {
  --navy: #0b2a4a;
  --teal: #0e9c8c;
  --teal-deep: #0b7e71;
  --ink-soft: #4b5b6b;
  --on-dark: #c9d6e3;
  box-sizing: border-box;
}

.ppc-loading {
  margin: 1.5rem 0 0;
  font-size: 15px;
  color: var(--ink-soft, #4b5b6b);
}

.ppc-prices {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
}

.ppc-price {
  position: relative;
  border: 2px solid #fff;
  background: #fff;
  box-shadow: 0 10px 30px rgba(11, 42, 74, 0.06);
  padding: clamp(22px, 2.4vw, 32px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  text-align: start;
}

.ppc-price--featured {
  background: var(--navy);
  color: #fff;
  border-color: var(--navy);
  transform: translateY(-12px);
}

.ppc-price--selected:not(.ppc-price--featured) {
  border-color: var(--teal);
  box-shadow: 0 0 0 2px rgba(14, 156, 140, 0.28);
}

.ppc-price--featured.ppc-price--selected {
  box-shadow: 0 0 0 3px rgba(14, 156, 140, 0.55);
}

.ppc-price__badge {
  position: absolute;
  top: 0;
  inset-inline-start: clamp(22px, 2.4vw, 32px);
  background: var(--teal);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
}

.ppc-price__name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--teal);
  letter-spacing: 0.06em;
}

.ppc-price--featured .ppc-price__name {
  margin-top: 10px;
}

.ppc-price__amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0;
  font-size: clamp(30px, 2.8vw, 42px);
  font-weight: 700;
  line-height: 1;
}

.ppc-price__amount span,
.ppc-price__from,
.ppc-price__desc {
  font-size: 15px;
  font-weight: 500;
  color: var(--ink-soft);
}

.ppc-price__from,
.ppc-price__desc,
.ppc-price__adds {
  margin: 0;
}

.ppc-price__from {
  font-weight: 600;
}

.ppc-price--featured .ppc-price__amount span,
.ppc-price--featured .ppc-price__from,
.ppc-price--featured .ppc-price__desc {
  color: var(--on-dark);
}

.ppc-price__adds {
  font-size: 13px;
  color: var(--teal);
  font-weight: 600;
}

.ppc-list {
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  display: grid;
  gap: 10px;
  font-size: 15px;
  line-height: 1.5;
  flex: 1;
}

.ppc-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.ppc-list li::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--teal);
  flex: none;
  margin-top: 8px;
}

.ppc-btn {
  display: inline-block;
  margin-top: auto;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 26px;
  border: 2px solid transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: center;
  background: transparent;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.ppc-btn--teal {
  background: var(--teal);
  color: #fff;
  border-color: var(--teal);
}

.ppc-btn--teal:hover {
  background: var(--teal-deep);
  border-color: var(--teal-deep);
}

.ppc-btn--outline {
  border-color: var(--navy);
  color: var(--navy);
}

.ppc-btn--outline:hover {
  background: var(--navy);
  color: #fff;
}

.ppc-price--featured .ppc-btn--outline {
  border-color: #fff;
  color: #fff;
}

.ppc-btn--block {
  display: block;
  width: 100%;
}

@media (max-width: 767px) {
  .ppc-prices {
    grid-template-columns: 1fr;
    max-width: 520px;
    margin-inline: auto;
  }

  .ppc-price--featured {
    transform: none;
  }
}
</style>
