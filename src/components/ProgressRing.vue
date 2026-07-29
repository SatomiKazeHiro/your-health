<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    progress: number  // 0 - 1
    size?: number
    strokeWidth?: number
    color?: string
    bgColor?: string
    dashed?: boolean
  }>(),
  {
    size: 200,
    strokeWidth: 12,
    color: '#16a34a',
    bgColor: '#bbf7d0',
    dashed: false,
  }
)

const radius = computed(() => (props.size - props.strokeWidth) / 2 - 8)
const circumference = computed(() => Math.round(2 * Math.PI * radius.value))
const dashOffset = computed(() => circumference.value * (1 - props.progress))
const viewBox = computed(() => `0 0 ${props.size} ${props.size}`)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    :style="{ transform: 'rotate(-90deg)' }"
    role="progressbar"
    :aria-valuenow="Math.round(progress * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="`Progress: ${Math.round(progress * 100)}%`"
  >
    <circle
      :cx="size / 2"
      :cy="size / 2"
      :r="radius"
      fill="none"
      :stroke="bgColor"
      :stroke-width="strokeWidth"
    />
    <circle
      class="progress"
      :cx="size / 2"
      :cy="size / 2"
      :r="radius"
      fill="none"
      :stroke="color"
      :stroke-width="strokeWidth"
      :stroke-dasharray="dashed ? '2 6' : circumference"
      :stroke-dashoffset="dashOffset"
      stroke-linecap="round"
    />
  </svg>
</template>
