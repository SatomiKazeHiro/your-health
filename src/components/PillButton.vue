<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'ghost-white' | 'solid-white'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    disabled: false,
    type: 'button',
  }
)

defineEmits<{
  click: [event: MouseEvent]
}>()

const style = computed(() => {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '12px 28px', fontSize: '15px' },
    lg: { padding: '14px 36px', fontSize: '16px' },
  }
  const variants = {
    primary: {
      border: 'none',
      background: '#16a34a',
      color: 'white',
      boxShadow: '0 2px 6px rgba(22,163,74,0.3)',
    },
    secondary: {
      border: '1px solid rgba(22,163,74,0.2)',
      background: 'white',
      color: '#15803d',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    ghost: {
      border: 'none',
      background: 'transparent',
      color: '#15803d',
      boxShadow: 'none',
    },
    'ghost-white': {
      border: '1px solid rgba(255,255,255,0.4)',
      background: 'rgba(255,255,255,0.1)',
      color: 'white',
      boxShadow: 'none',
    },
    'solid-white': {
      border: 'none',
      background: 'white',
      color: '#15803d',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    },
  }
  return {
    ...sizes[props.size],
    ...variants[props.variant],
    borderRadius: '24px',
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    opacity: props.disabled ? 0.5 : 1,
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :style="style"
    @click="(e) => !disabled && $emit('click', e)"
  >
    <slot />
  </button>
</template>

<style scoped>
button:focus-visible {
  outline: 2px solid #16a34a;
  outline-offset: 2px;
}
</style>
