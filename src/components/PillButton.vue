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

const sizeClass = computed(() => ({
  sm: 'px-4 py-2 text-sm',
  md: 'px-7 py-3 text-[15px]',
  lg: 'px-9 py-3.5 text-base',
}[props.size]))

const variantClass = computed(() => ({
  primary: 'bg-primary text-white border border-transparent shadow-primary',
  secondary: 'bg-surface text-primary border border-primary/20 shadow-card',
  ghost: 'bg-transparent text-primary border border-transparent',
  'ghost-white': 'bg-white/10 text-white border border-white/40 backdrop-blur',
  'solid-white': 'bg-surface text-primary-dark border border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
}[props.variant]))
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="rounded-pill font-medium transition-[transform,opacity,box-shadow] duration-150 ease-[var(--ease-fresh)] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-primary"
    :class="[sizeClass, variantClass]"
    @click="(e) => !disabled && $emit('click', e)"
  >
    <slot />
  </button>
</template>
