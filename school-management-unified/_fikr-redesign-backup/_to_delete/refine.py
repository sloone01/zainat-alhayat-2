import re, sys, os
root = sys.argv[1]
def rw(path, fn):
    p=os.path.join(root,path); s=open(p).read(); s2=fn(s); open(p,'w').write(s2); print('ok', path)

# 1. Page header: compact editorial header
def header(s):
    return '''<template>
  <header class="fk-pagehead">
    <div class="min-w-0">
      <p v-if="eyebrow" class="fk-pagehead__eyebrow">{{ eyebrow }}</p>
      <h1 class="fk-pagehead__title">{{ title }}</h1>
      <p v-if="subtitle" class="fk-pagehead__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
    <div v-if="$slots.default" class="basis-full">
      <slot />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  eyebrow?: string
}>()
</script>
'''
rw('src/components/FikrPageHeader.vue', header)

# 2. CSS refinements
def css(s):
    rep = [
      # hero block -> compact head
      ('''  .fk-hero {
    @apply relative overflow-hidden rounded-card bg-navy-800 px-6 py-7 text-white sm:px-8 sm:py-9;
  }''','''  .fk-hero {
    @apply relative overflow-hidden rounded-card bg-navy-800 px-6 py-7 text-white sm:px-8 sm:py-9;
  }
  /* Compact editorial page head — title + actions on one line, hairline below */
  .fk-pagehead {
    @apply flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-fikr-hairline pb-5;
  }
  .fk-pagehead__eyebrow {
    @apply mb-1 text-xs font-medium text-primary-600;
  }
  .fk-pagehead__title {
    @apply text-[22px] font-semibold leading-tight tracking-[-0.01em] text-fikr-ink sm:text-2xl;
  }
  .fk-pagehead__subtitle {
    @apply mt-1 max-w-2xl text-sm leading-relaxed text-fikr-ink-soft;
  }'''),
      ('.fk-page {\n    @apply space-y-6 pb-10;', '.fk-page {\n    @apply space-y-5 pb-10;'),
      # softer radius on cards
      ("--fk-radius-card: 18px;", "--fk-radius-card: 14px;"),
      # card header tighter
      ('@apply flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6;','@apply flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-3.5 sm:px-6;'),
      ('@apply text-base font-semibold tracking-[-0.01em] text-fikr-ink sm:text-lg;','@apply text-[15px] font-semibold text-fikr-ink;'),
      # stat tiles: no dark variant look
      ('''  .fk-stat--navy {
    @apply border-navy-800 bg-navy-800 text-white;
  }
  .fk-stat--navy .fk-stat__label { @apply text-white/70; }
  .fk-stat--navy .fk-stat__value { @apply text-white; }''','''  .fk-stat--navy {
    @apply border-fikr-hairline bg-white;
  }
  .fk-stat--navy .fk-stat__value { @apply text-navy-800; }'''),
      ('@apply mt-1 text-2xl font-semibold tracking-[-0.01em] text-fikr-ink tabular-nums;','@apply mt-0.5 text-[22px] font-semibold text-fikr-ink tabular-nums;'),
      # buttons: 10px radius instead of pill
      ('@apply inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill px-4 py-2 text-sm font-semibold','@apply inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-3.5 py-2 text-sm font-medium'),
      ('.fk-btn--pearl {\n    @apply border border-fikr-hairline bg-fikr-pearl text-fikr-ink hover:border-fikr-outline hover:bg-white;','.fk-btn--pearl {\n    @apply border border-fikr-hairline bg-white text-fikr-ink hover:bg-fikr-pearl;'),
      ('.fk-btn--sm { @apply px-3 py-1.5 text-xs; }','.fk-btn--sm { @apply px-2.5 py-1.5 text-[13px]; }'),
      ('@apply relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-fikr-hairline bg-white text-fikr-ink-muted','@apply relative inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-fikr-hairline bg-white text-fikr-ink-muted'),
      # inputs
      ('@apply w-full rounded-lg border border-fikr-hairline bg-white px-3 py-2.5 text-sm text-fikr-ink placeholder:text-fikr-ink-soft','@apply w-full rounded-[10px] border border-fikr-hairline bg-white px-3 py-2 text-sm text-fikr-ink placeholder:text-fikr-ink-soft'),
      ('.fk-input--search {\n    @apply rounded-pill px-4;','.fk-input--search {\n    @apply rounded-[10px];'),
      ('@apply mb-1.5 block text-sm font-medium text-fikr-ink;','@apply mb-1 block text-[13px] font-medium text-fikr-ink-muted;'),
      # settings group title: sentence case
      ('@apply text-[11px] font-semibold uppercase tracking-[0.14em] text-fikr-ink-soft;','@apply text-xs font-medium text-fikr-ink-soft;'),
      ('.fk-setting {\n    @apply flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6;','.fk-setting {\n    @apply flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 sm:px-6;'),
      # chips: quieter
      ('@apply inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-semibold leading-5;','@apply inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium leading-5;'),
      ('.fk-chip--teal   { @apply bg-primary-50 text-primary-700; }','.fk-chip--teal   { @apply bg-primary-50 text-primary-700; }'),
      # table header: sentence case, not uppercase
      ('@apply bg-fikr-parchment text-[11px] font-semibold uppercase tracking-[0.08em] text-fikr-ink-soft;','@apply bg-white text-xs font-medium text-fikr-ink-soft;'),
      ('.fk-table th {\n    @apply px-4 py-3 text-start font-semibold;','.fk-table th {\n    @apply border-b border-fikr-hairline px-4 py-2.5 text-start font-medium;'),
      ('.fk-table td {\n    @apply px-4 py-3 align-middle text-fikr-ink;','.fk-table td {\n    @apply px-4 py-2.5 align-middle text-fikr-ink;'),
      # empty state less "icon in a box"
      ('@apply flex flex-col items-center justify-center rounded-card border border-dashed border-fikr-outline bg-fikr-pearl px-6 py-14 text-center;','@apply flex flex-col items-center justify-center rounded-card border border-fikr-hairline bg-fikr-pearl px-6 py-12 text-center;'),
      ('@apply mb-3 flex h-14 w-14 items-center justify-center rounded-card bg-white text-primary-500 ring-1 ring-fikr-hairline;','@apply mb-3 flex h-10 w-10 items-center justify-center text-fikr-ink-soft;'),
      # monogram: quieter
      ('@apply flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700 ring-1 ring-primary-100;','@apply flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fikr-parchment text-[13px] font-medium text-fikr-ink-muted;'),
      ('.fk-monogram--navy {\n    @apply bg-navy-800 text-white ring-navy-700;','.fk-monogram--navy {\n    @apply bg-navy-50 text-navy-800;'),
      # subnav / tabs
      ('@apply whitespace-nowrap rounded-pill px-3.5 py-1.5 text-sm font-medium text-fikr-ink-muted','@apply whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-fikr-ink-muted'),
      # item card stats
      ('@apply mt-auto grid grid-cols-2 gap-x-3 gap-y-2 rounded-b-card border-t border-fikr-hairline bg-fikr-pearl px-4 py-3 text-xs;','@apply mt-auto grid grid-cols-2 gap-x-3 gap-y-2 rounded-b-card border-t border-fikr-hairline px-4 py-3 text-xs;'),
    ]
    for a,b in rep:
        if a not in s: print('  MISSING css:', a[:50])
        s=s.replace(a,b)
    return s
rw('src/assets/main.css', css)

# 3. page tweaks
def grades(s):
    return s.replace('<span class="fk-monogram fk-monogram--navy text-xs">{{ (grade.code || \'?\').slice(0, 3) }}</span>','').replace('<div class="flex items-center gap-3">\n                    \n                    <div class="min-w-0">','<div class="min-w-0">').replace('''                      <div class="font-medium text-fikr-ink">{{ isRTL ? grade.nameAr : grade.nameEn }}</div>
                      <div class="mt-0.5 text-xs text-fikr-ink-soft">{{ isRTL ? grade.nameEn : grade.nameAr }}</div>
                    </div>
                  </div>''','''                      <div class="font-medium text-fikr-ink">{{ isRTL ? grade.nameAr : grade.nameEn }}</div>
                      <div class="mt-0.5 text-xs text-fikr-ink-soft">{{ isRTL ? grade.nameEn : grade.nameAr }}</div>
                    </div>''').replace('<td><span class="fk-chip fk-chip--outline font-mono" dir="ltr">{{ grade.code }}</span></td>','<td><span class="font-mono text-xs text-fikr-ink-muted" dir="ltr">{{ grade.code }}</span></td>').replace('<p class="fk-card__meta">{{ grades.length }}</p>','')
rw('src/views/GradeLevelsView.vue', grades)

def sysset(s):
    s=s.replace('class="fk-grid--2 items-start"','class="grid grid-cols-1 gap-5 xl:grid-cols-2 items-start"')
    return s
rw('src/views/SystemSettingsView.vue', sysset)

def landing(s):
    s=s.replace('''          <span
            class="fk-chip"
            :class="form.is_published ? 'bg-primary-500/20 text-primary-200' : 'bg-white/10 text-white/80'"
          >''','''          <span
            class="fk-chip"
            :class="form.is_published ? 'fk-chip--green' : 'fk-chip--amber'"
          >''')
    s=s.replace("class=\"rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors\"\n            :class=\"activeTab === tab ? 'bg-navy-800 text-white' : 'text-fikr-ink-muted hover:bg-fikr-parchment hover:text-fikr-ink'\"","class=\"-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors\"\n            :class=\"activeTab === tab ? 'border-navy-800 text-fikr-ink' : 'border-transparent text-fikr-ink-soft hover:text-fikr-ink'\"")
    s=s.replace('<div class="flex flex-wrap gap-2 border-b border-fikr-hairline pb-4">','<div class="flex flex-wrap gap-6 border-b border-fikr-hairline">')
    return s
rw('src/views/SchoolLandingEditorView.vue', landing)

def group(s):
    s=s.replace('''                <div
                  class="absolute inset-x-5 top-0 h-1 rounded-b-full"
                  :class="group.status === 'active' ? 'bg-primary-500' : 'bg-fikr-outline'"
                  aria-hidden="true"
                />
''','')
    s=s.replace('class="fk-monogram fk-monogram--navy h-11 w-11 rounded-xl"','class="fk-monogram fk-monogram--navy"')
    s=s.replace('<div class="mt-auto flex items-center justify-end rounded-b-card border-t border-fikr-hairline bg-fikr-pearl px-4 py-2.5">','<div class="mt-auto flex items-center justify-end rounded-b-card border-t border-fikr-hairline px-4 py-2">')
    return s
rw('src/views/GroupManagementView.vue', group)

def users(s):
    return s.replace('<div class="px-4 py-4">','<div class="px-4 pt-4 pb-3">')
rw('src/views/UserManagementView.vue', users)

# 4. sidebar: quieter active state
def layout(s):
    s=s.replace('''.nav-main-link--active {
  @apply bg-navy-800 text-white;
}''','''.nav-main-link--active {
  @apply bg-fikr-parchment text-navy-800;
}''')
    s=s.replace('''.nav-main-link--active .nav-chevron {
  color: rgb(255 255 255 / 0.7);
}''','''.nav-main-link--active .nav-chevron {
  color: rgb(65 71 83);
}''')
    s=s.replace('''.nav-main-icon--active {
  @apply text-primary-300;
}
.nav-main-link--active:hover .nav-main-icon {
  @apply text-primary-300;
}
.nav-main-link--active:hover {
  @apply bg-navy-800 text-white;
}''','''.nav-main-icon--active {
  @apply text-primary-600;
}
.nav-main-link--active:hover {
  @apply bg-fikr-parchment text-navy-800;
}''')
    s=s.replace('''.nav-sub-item--active {
  @apply bg-primary-50;
}''','''.nav-sub-item--active {
  @apply bg-transparent;
}''')
    s=s.replace('''.nav-sub-item--active .nav-sub-link {
  @apply text-primary-700 font-medium;
}''','''.nav-sub-item--active .nav-sub-link {
  @apply text-primary-700 font-medium;
  box-shadow: inset 2px 0 0 0 currentColor;
}
[dir='rtl'] .nav-sub-item--active .nav-sub-link {
  box-shadow: inset -2px 0 0 0 currentColor;
}''')
    s=s.replace('<div class="h-8 w-8 rounded-full bg-navy-800 flex items-center justify-center">\n                  <span class="text-sm font-medium text-white">','<div class="h-8 w-8 rounded-full bg-fikr-parchment flex items-center justify-center">\n                  <span class="text-sm font-medium text-navy-800">')
    s=s.replace('<div class="h-8 w-8 rounded-full bg-navy-800 flex items-center justify-center">\n                <span class="text-sm font-medium text-white">','<div class="h-8 w-8 rounded-full bg-fikr-parchment flex items-center justify-center">\n                <span class="text-sm font-medium text-navy-800">')
    return s
rw('src/layouts/DashboardLayout.vue', layout)

# 5. Login: calmer
def login(s):
    s=s.replace('''      <div class="flex items-center justify-end gap-3">
        <span class="text-xl font-bold tracking-[0.04em] text-white" dir="ltr">FIKR</span>
        <span class="grid grid-cols-3 gap-1" aria-hidden="true">
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400/50" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400/70" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
        </span>
      </div>''','''      <div class="flex items-center gap-2.5">
        <img src="/fikr-icon.png" alt="" class="h-8 w-8 rounded-md object-contain" aria-hidden="true" />
        <span class="text-lg font-semibold tracking-[0.02em] text-white" dir="ltr">FIKR</span>
      </div>''')
    s=s.replace('''        <h2 class="text-[44px] font-bold leading-[1.15] tracking-[-0.01em] text-white xl:text-[56px] xl:leading-[1.1]">
          {{ $t('login.heroTitle') }}
        </h2>
        <p class="mt-5 text-lg leading-relaxed text-white/80 xl:text-xl">
          {{ heroSubtitle }}
        </p>''','''        <h2 class="text-[40px] font-semibold leading-[1.2] tracking-[-0.01em] text-white xl:text-[48px]">
          {{ $t('login.heroTitle') }}
        </h2>
        <p class="mt-4 max-w-sm text-base leading-relaxed text-white/70 xl:text-lg">
          {{ heroSubtitle }}
        </p>''')
    s=s.replace('''      <!-- soft teal glow (flat design — no shadows, just a tonal wash) -->
      <div
        class="pointer-events-none absolute -bottom-32 -start-32 h-96 w-96 rounded-full bg-primary-500/10"
        aria-hidden="true"
      />
''','')
    s=s.replace('''          <div class="mx-auto flex h-[170px] w-[170px] items-center justify-center rounded-[22px] bg-fikr-parchment sm:h-[190px] sm:w-[190px]">
            <img
              v-if="isSchoolLogin"
              :src="schoolLogo"
              :alt="displayTitle"
              class="h-[140px] w-[140px] rounded-2xl object-contain"
            />
            <img
              v-else
              src="/fikr-logo.png?v=4"
              :alt="$t('forSchools.logoAlt')"
              class="h-[150px] w-[150px] object-contain"
            />
          </div>

          <div class="mt-6 text-center">
            <h1 class="text-[30px] font-bold tracking-[-0.01em] text-fikr-ink sm:text-[34px]">
              {{ $t('login.title') }}
            </h1>
            <p class="mt-1 text-base text-fikr-ink-soft">{{ formSubtitle }}</p>
          </div>''','''          <div class="mx-auto flex h-[132px] w-[132px] items-center justify-center rounded-2xl border border-fikr-hairline bg-fikr-pearl">
            <img
              v-if="isSchoolLogin"
              :src="schoolLogo"
              :alt="displayTitle"
              class="h-[104px] w-[104px] rounded-xl object-contain"
            />
            <img
              v-else
              src="/fikr-logo.png?v=4"
              :alt="$t('forSchools.logoAlt')"
              class="h-[112px] w-[112px] object-contain"
            />
          </div>

          <div class="mt-6 text-center">
            <h1 class="text-[26px] font-semibold tracking-[-0.01em] text-fikr-ink">
              {{ $t('login.title') }}
            </h1>
            <p class="mt-1 text-[15px] text-fikr-ink-soft">{{ formSubtitle }}</p>
          </div>''')
    s=s.replace('class="fk-input rounded-xl px-4 py-3.5 text-base"','class="fk-input px-3.5 py-3 text-[15px]"')
    s=s.replace('class="fk-input rounded-xl px-4 py-3.5 pe-12 text-base tracking-[0.15em]"','class="fk-input px-3.5 py-3 pe-11 text-[15px]"')
    s=s.replace('<legend class="mb-2 text-sm font-medium text-fikr-ink">','<legend class="mb-2 text-[13px] font-medium text-fikr-ink-muted">')
    s=s.replace('class="rounded-xl border px-3 py-3 text-sm font-medium transition-colors','class="rounded-[10px] border px-3 py-2.5 text-sm font-medium transition-colors')
    s=s.replace("? 'border-primary-500 bg-primary-500 text-white'\n                      : 'border-fikr-hairline bg-white text-fikr-ink hover:border-fikr-outline'","? 'border-primary-500 bg-primary-500 text-white'\n                      : 'border-fikr-hairline bg-white text-fikr-ink-muted hover:border-fikr-outline hover:text-fikr-ink'")
    s=s.replace('class="fk-btn fk-btn--primary mt-3 w-full rounded-xl py-3.5 text-base"','class="fk-btn fk-btn--primary mt-2 w-full py-3 text-[15px]"')
    s=s.replace('<form class="mt-7 space-y-3" @submit.prevent="handleLogin">','<form class="mt-6 space-y-3" @submit.prevent="handleLogin">')
    s=s.replace('class="fk-btn fk-btn--pearl fk-btn--tool px-4 py-2 text-sm font-medium"','class="fk-btn fk-btn--pearl fk-btn--sm"')
    s=s.replace('class="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"','class="text-[13px] font-medium text-primary-600 hover:underline"')
    return s
rw('src/views/LoginView.vue', login)
