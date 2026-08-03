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

const fontClass = computed(() => ({
  serif: 'font-display font-light tabular-nums lining-nums',
  mono: 'font-mono',
  sans: 'font-body',
}[props.font]))

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
      color,
      lineHeight: '1.05',
      minWidth: `${size * 3.2}px`,
      display: 'inline-block',
      textAlign: 'center',
    }"
    :class="fontClass"
  >
    {{ formatted }}
  </time>
</template>
