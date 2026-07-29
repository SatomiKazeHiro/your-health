<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import { useAudio } from '@/composables/useAudio'
import { useConfig } from '@/composables/useConfig'
import { closeAlertWindow } from '@/lib/tauri'
import PillButton from '@/components/PillButton.vue'
import { zhCN } from '@/i18n/zh-CN'

const store = useTimerStore()
const { play, stop } = useAudio()
const { load } = useConfig()

const sittingSeconds = ref(store.totalSeconds)
let intervalId: number | null = null

onMounted(async () => {
  const config = await load()
  play(store.selectedSound, config.volume)
  intervalId = window.setInterval(() => {
    sittingSeconds.value += 1
  }, 1000)
})

onUnmounted(() => {
  if (intervalId !== null) window.clearInterval(intervalId)
  stop()
})

async function onAcknowledge() {
  store.acknowledge()
  await closeAlertWindow()
}

async function onSnooze() {
  store.snooze()
  await closeAlertWindow()
}

const subtitleText = computed(() =>
  zhCN.alert.subtitle.replace('{{minutes}}', String(Math.floor(sittingSeconds.value / 60)))
)
</script>

<template>
  <div
    class="min-h-screen px-8 py-12 flex flex-col items-center justify-center gap-2 text-white font-body"
    :style="{
      background: 'radial-gradient(800px 400px at 50% -10%, #16a34a 0%, transparent 70%), linear-gradient(180deg, #16a34a 0%, #14532d 100%)',
    }"
  >
    <div class="text-[80px] mb-4">🚶</div>
    <h1 class="text-[32px] font-semibold mb-2">{{ zhCN.alert.title }}</h1>
    <p class="text-base text-white/85 mb-10">{{ subtitleText }}</p>
    <div class="font-display font-light text-[96px] tabular-nums lining-nums tracking-[0.01em] mb-3">
      {{ String(Math.floor(sittingSeconds / 60)).padStart(2, '0') }}:{{ String(sittingSeconds % 60).padStart(2, '0') }}
    </div>
    <div class="text-sm text-white/70 mb-12">{{ zhCN.alert.sittingFor }}</div>
    <div class="flex gap-3">
      <PillButton variant="ghost-white" size="lg" @click="onSnooze">
        {{ zhCN.alert.snooze }}
      </PillButton>
      <PillButton variant="solid-white" size="lg" @click="onAcknowledge">
        {{ zhCN.alert.acknowledge }}
      </PillButton>
    </div>
  </div>
</template>
