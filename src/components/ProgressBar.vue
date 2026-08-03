<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    progress: number
    animate?: boolean
    accent?: 'primary' | 'amber'
    dashed?: boolean
    ariaLabel?: string
  }>(),
  {
    animate: false,
    accent: 'primary',
    dashed: false,
    ariaLabel: '进度',
  }
)

const percent = computed(() => Math.round(props.progress * 100))
const fillClass = computed(() => [
  props.accent === 'amber' ? 'bg-amber' : 'bg-primary',
  { 'animate-progress-fill': props.animate },
])
</script>

<template>
  <div class="w-64 h-px relative mt-6">
    <div
      v-if="dashed"
      class="absolute inset-0 border-t border-dashed border-hairline"
    />
    <div
      class="absolute inset-y-0 left-0 origin-left transition-[width] duration-1000 ease-linear"
      :class="fillClass"
      :style="{ width: `${percent}%` }"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="ariaLabel"
    />
  </div>
</template>