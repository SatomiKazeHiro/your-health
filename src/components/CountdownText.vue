<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    seconds: number
    size?: number
    color?: string
    fontFamily?: 'mono' | 'sans'
  }>(),
  {
    size: 38,
    color: '#14532d',
    fontFamily: 'mono',
  }
)

const formatted = computed(() => {
  const m = Math.floor(props.seconds / 60)
  const s = props.seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
</script>

<template>
  <div
    :style="{
      fontSize: `${size}px`,
      fontWeight: 600,
      color,
      fontFamily: fontFamily === 'mono' ? 'monospace' : 'inherit',
    }"
  >
    {{ formatted }}
  </div>
</template>