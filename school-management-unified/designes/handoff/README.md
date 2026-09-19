# FIKR brochure landing — drop-in

Files
- `ForSchoolsBrochureLanding.vue` → copy to `school-management-unified/src/views/`
- `fikr-logo-white.png` → copy to `school-management-unified/public/` (used in the mission tile)

Wiring (nothing else changes; the current `ForSchoolsGalleryLanding.vue` stays untouched)

1. Font — add to `index.html` `<head>`:
   `<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">`
   (falls back to Inter / Noto Sans Arabic if omitted)

2. Switch — in `src/views/ForSchoolsView.vue`:
   ```vue
   <template>
     <ForSchoolsBrochureLanding v-if="brochure" />
     <ForSchoolsGalleryLanding v-else />
   </template>
   ```
   ```ts
   import ForSchoolsBrochureLanding from '@/views/ForSchoolsBrochureLanding.vue'
   import { useRoute } from 'vue-router'
   const route = useRoute()
   const brochure = computed(() =>
     route.query.v === 'brochure' || import.meta.env.VITE_LANDING_VARIANT === 'brochure')
   ```
   Preview: `http://localhost:5173/?v=brochure`. Make it default with `VITE_LANDING_VARIANT=brochure` in `.env.local`, or just swap the `v-if` once approved.

Preserved from the existing page
- All `forSchools.*` / `landingPricing.*` i18n keys (AR + EN, RTL/LTR handled via `[dir]` rules)
- `platformBillingService.listPublicPlans()` pricing cards, featured-tier logic, contact card fallback
- `schoolSubscriptionService.submitInquiry()` consult form, thanks/error states
- `PlatformMarketingNav` / `PlatformMarketingFooter`
- Feature tiles link to the same `/docs/staff/*` routes
- Images: `/landing/shots/*` and `/landing/features/*` (with `?v=14` cache key)

Notes
- 12M+ / 99% stats are carried over as static text from the current page.
- Design tokens: navy `#0b2a4a`, teal `#0e9c8c`, mint `#e9f5f3` — defined as CSS vars on `.fk`.
