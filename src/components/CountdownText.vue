<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    seconds: number
    size?: number
    color?: string
    font?: 'serif' | 'mono' | 'sans'
  }>(),
  {
    size: 38,
    color: '#14532d',
    font: 'mono',
  }
)

const formatted = computed(() => {
  const m = Math.floor(props.seconds / 60)
  const s = props.seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
</script>

<template>
  <time
    :datetime="`PT${seconds}S`"
    :aria-label="`${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`"
    :style="{
      fontSize: `${size}px`,
      fontWeight: 300,
      color,
      fontFamily: font === 'serif' ? 'var(--font-display)' : font === 'mono' ? 'monospace' : 'var(--font-body)',
      fontVariantNumeric: font === 'serif' ? 'tabular-nums lining-nums' : undefined,
      lineHeight: 1.05,
      letterSpacing: font === 'mono' ? '0.02em' : undefined,
    }"
  >
    {{ formatted }}
  </time>
</template>