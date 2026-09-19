<template>
  <p
    v-if="enabled"
    class="fk-alert shrink-0 border-amber-200 bg-amber-50 text-amber-950"
    role="status"
  >
    {{ $t('chatAudit.participantNotice') }}
  </p>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { chatApiService } from '@/services/chat.service'

const enabled = ref(false)

onMounted(() => {
  void chatApiService.adminReviewNotice().then((on) => {
    enabled.value = on
  }).catch(() => {
    enabled.value = false
  })
})
</script>
