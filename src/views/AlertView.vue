<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { emitTo } from '@tauri-apps/api/event'
import { useAudio } from '@/composables/useAudio'
import { closeAlertWindow } from '@/lib/tauri'
import { ALERT_ACTION_EVENT, type AlertAction } from '@/lib/events'
import PillButton from '@/components/PillButton.vue'
import { zhCN } from '@/i18n/zh-CN'

const route = useRoute()
const { play, stop } = useAudio()

const sittingSeconds = ref(0)
const selectedDuration = ref(45)
let intervalId: number | null = null

onMounted(async () => {
  const queryMinutes = Number(route.query.minutes)
  if (Number.isFinite(queryMinutes) && queryMinutes > 0) {
    selectedDuration.value = queryMinutes
  }
  const soundId = String(route.query.sound ?? 'bell-1')
  const volume = Math.min(1, Math.max(0, Number(route.query.volume ?? 0.7)))
  play(soundId as Parameters<typeof play>[0], volume)
  intervalId = window.setInterval(() => {
    sittingSeconds.value += 1
  }, 1000)
})

onUnmounted(() => {
  if (intervalId !== null) window.clearInterval(intervalId)
  stop()
})

async function sendAction(action: AlertAction) {
  await emitTo('main', ALERT_ACTION_EVENT, { action })
  await closeAlertWindow()
}

const subtitleText = computed(() =>
  zhCN.alert.subtitle.replace('{{minutes}}', String(selectedDuration.value))
)
</script>

<template>
  <div
    class="h-screen box-border overflow-hidden px-8 py-8 flex flex-col items-center justify-center gap-2 text-white font-body"
    :style="{
      background: 'radial-gradient(800px 400px at 50% -10%, #16a34a 0%, transparent 70%), linear-gradient(180deg, #16a34a 0%, #14532d 100%)',
    }"
  >
    <div class="text-[64px] mb-3">🚶</div>
    <h1 class="text-[28px] font-semibold mb-2">{{ zhCN.alert.title }}</h1>
    <p class="text-base text-white/85 mb-8">{{ subtitleText }}</p>
    <div class="font-display font-light text-[80px] tabular-nums lining-nums tracking-[0.01em] mb-3">
      {{ String(Math.floor(sittingSeconds / 60)).padStart(2, '0') }}:{{ String(sittingSeconds % 60).padStart(2, '0') }}
    </div>
    <div class="text-sm text-white/70 mb-10">{{ zhCN.alert.sittingFor }}</div>
    <div class="flex gap-3">
      <PillButton variant="ghost-white" size="lg" @click="sendAction('snooze')">
        {{ zhCN.alert.snooze }}
      </PillButton>
      <PillButton variant="solid-white" size="lg" @click="sendAction('acknowledge')">
        {{ zhCN.alert.acknowledge }}
      </PillButton>
    </div>
  </div>
</template>