<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTimerStore } from '@/stores/timerStore'
import PillButton from '@/components/PillButton.vue'
import { zhCN } from '@/i18n/zh-CN'

const emit = defineEmits<{
  start: []
}>()

const router = useRouter()
const store = useTimerStore()

const display = computed(() => {
  const m = store.selectedDuration
  return `${String(m).padStart(2, '0')}:00`
})

function goSettings() {
  router.push('/settings')
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="text-[11px] font-medium tracking-[0.2em] uppercase text-text-subtle">
      {{ zhCN.idle.label }}
    </div>
    <div
      class="font-display font-light text-[112px] leading-none text-primary-dark tabular-nums lining-nums"
      aria-live="polite"
    >
      {{ display }}
    </div>
    <div class="w-40 h-px bg-hairline mt-2" />

    <div class="flex flex-col items-center gap-3 mt-10">
      <PillButton variant="primary" size="lg" @click="emit('start')">
        {{ zhCN.idle.start }}
      </PillButton>
      <button
        class="bg-transparent border-0 text-text-subtle text-sm tracking-[0.04em] px-3 py-2 cursor-pointer transition-colors duration-150 ease-[var(--ease-fresh)] hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-md"
        @click="goSettings"
      >
        {{ zhCN.idle.settings }}
      </button>
    </div>
  </div>
</template>