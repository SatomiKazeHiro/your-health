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
  pause: []
  requestEnd: []
}>()

const store = useTimerStore()

const halfway = computed(() => store.progress >= 0.5)
const percent = computed(() => Math.round(store.progress * 100))
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="text-[11px] font-medium tracking-[0.2em] uppercase text-text-subtle">
      {{ halfway ? zhCN.running.halfway : zhCN.running.remaining }}
    </div>
    <div class="font-display font-light text-primary-dark leading-none">
      <CountdownText :seconds="store.remainingSeconds" font="serif" :size="112" color="#14532d" />
    </div>

    <ProgressBar :progress="store.progress" :animate="animateProgress" :aria-label="`进度 ${percent}%`" />

    <div class="flex gap-3 mt-10">
      <PillButton variant="warning" @click="emit('pause')">
        {{ zhCN.running.pause }}
      </PillButton>
      <PillButton variant="danger" @click="emit('requestEnd')">
        {{ zhCN.running.end }}
      </PillButton>
    </div>
  </div>
</template>