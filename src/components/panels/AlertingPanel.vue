<script setup lang="ts">
import PillButton from '@/components/PillButton.vue'
import { zhCN } from '@/i18n/zh-CN'

const emit = defineEmits<{
  acknowledge: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="text-[11px] font-medium tracking-[0.2em] uppercase text-amber">
      {{ zhCN.alerting.label }}
    </div>
    <div
      class="font-display font-light text-[112px] leading-none text-amber tabular-nums lining-nums"
      aria-live="polite"
    >
      00:00
    </div>
    <div class="w-40 h-px bg-amber/40 mt-2" />
    <div class="text-text-subtle text-sm mt-10 tracking-[0.04em]">
      {{ zhCN.alerting.prompt }}
    </div>
    <div class="mt-2">
      <PillButton variant="primary" size="md" @click="emit('acknowledge')">
        {{ zhCN.alerting.acknowledge }}
      </PillButton>
    </div>
  </div>
</template>