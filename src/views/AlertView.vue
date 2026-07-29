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
  <div class="alert">
    <div class="icon">🚶</div>
    <h1>{{ zhCN.alert.title }}</h1>
    <p class="subtitle">
      {{ subtitleText }}
    </p>
    <div class="time-serif">{{ String(Math.floor(sittingSeconds / 60)).padStart(2, '0') }}:{{ String(sittingSeconds % 60).padStart(2, '0') }}</div>
    <div class="hint">{{ zhCN.alert.sittingFor }}</div>
    <div class="actions">
      <PillButton variant="ghost-white" size="lg" @click="onSnooze">
        {{ zhCN.alert.snooze }}
      </PillButton>
      <PillButton variant="solid-white" size="lg" @click="onAcknowledge">
        {{ zhCN.alert.acknowledge }}
      </PillButton>
    </div>
  </div>
</template>

<style scoped>
.alert {
  background:
    radial-gradient(800px 400px at 50% -10%, #16a34a 0%, transparent 70%),
    linear-gradient(180deg, #16a34a 0%, #14532d 100%);
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: white;
  font-family: var(--font-body);
  gap: 8px;
}

.icon {
  font-size: 80px;
  margin-bottom: 16px;
}

h1 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 40px;
}

.time-serif {
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums lining-nums;
  font-weight: 300;
  font-size: 96px;
  letter-spacing: 0.01em;
  margin-bottom: 12px;
}

.hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 48px;
}

.actions {
  display: flex;
  gap: 12px;
}
</style>