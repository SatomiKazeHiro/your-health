<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import PillButton from './PillButton.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message?: string
    confirmText?: string
    cancelText?: string
  }>(),
  {
    message: '',
    confirmText: '确认',
    cancelText: '取消',
  }
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('cancel')
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.removeEventListener('keydown', handleKeydown)
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center px-6 bg-primary-dark/40 backdrop-blur-sm"
        role="presentation"
        @click.self="emit('cancel')"
      >
        <div
          class="modal-card relative bg-surface rounded-md shadow-card px-6 py-5 max-w-[320px] w-full"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <h2 class="font-display font-medium text-lg text-primary-dark mb-2">
            {{ title }}
          </h2>
          <p v-if="message" class="text-sm text-text-subtle mb-5 leading-relaxed">
            {{ message }}
          </p>
          <div class="flex justify-end gap-2">
            <PillButton variant="ghost" size="sm" @click="emit('cancel')">
              {{ cancelText }}
            </PillButton>
            <PillButton variant="primary" size="sm" @click="emit('confirm')">
              {{ confirmText }}
            </PillButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 200ms var(--ease-fresh);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-card {
  animation: modal-pop 220ms var(--ease-fresh) both;
}

@keyframes modal-pop {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: none;
  }
  .modal-card {
    animation: none;
  }
}
</style>