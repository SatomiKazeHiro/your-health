<script setup lang="ts">
import { computed } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import CountdownText from '@/components/CountdownText.vue'
import PillButton from '@/components/PillButton.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { zhCN } from '@/i18n/zh-CN'

defineProps<{
  animateProgress: boolean
}>()

const emit = defineEmits<{
  resume: []
  requestEnd: []
}>()

const store = useTimerStore()

const percent = computed(() => Math.round(store.progress * 100))
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="text-[11px] font-medium tracking-[0.2em] uppercase text-primary">
      {{ zhCN.paused.paused }}
    </div>
    <div class="font-display font-light leading-none">
      <CountdownText :seconds="store.remainingSeconds" font="serif" :size="112" color="#15803d" />
    </div>

    <ProgressBar :progress="store.progress" :animate="animateProgress" dashed :aria-label="`进度 ${percent}%`" />

    <div class="flex gap-3 mt-10">
      <PillButton variant="primary" @click="emit('resume')">
        {{ zhCN.paused.resume }}
      </PillButton>
      <PillButton variant="danger" @click="emit('requestEnd')">
        {{ zhCN.paused.end }}
      </PillButton>
    </div>
  </div>
</template>