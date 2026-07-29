<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTimerStore } from '@/stores/timerStore'
import {
  DURATION_OPTIONS,
  SOUND_OPTIONS,
  DurationOption,
  SoundId,
  DEFAULT_CONFIG,
} from '@/types'
import { useConfig } from '@/composables/useConfig'
import { useAudio } from '@/composables/useAudio'
import PillButton from '@/components/PillButton.vue'
import { zhCN } from '@/i18n/zh-CN'

const router = useRouter()
const store = useTimerStore()
const { load, save } = useConfig()
const { play: playPreview, stop: stopPreview } = useAudio()

const duration = ref<DurationOption>(DEFAULT_CONFIG.durationMinutes)
const sound = ref<SoundId>(DEFAULT_CONFIG.soundId)
const volume = ref(DEFAULT_CONFIG.volume)
const loaded = ref(false)

onMounted(async () => {
  const config = await load()
  duration.value = config.durationMinutes
  sound.value = config.soundId
  volume.value = config.volume
  store.applyConfig(config)
  loaded.value = true
})

async function onDurationChange(e: Event) {
  const v = Number((e.target as HTMLSelectElement).value) as DurationOption
  duration.value = v
  await persist()
}

async function onSoundChange(e: Event) {
  sound.value = (e.target as HTMLSelectElement).value as SoundId
  await persist()
}

async function onVolumeChange(e: Event) {
  const v = Number((e.target as HTMLInputElement).value) / 100
  volume.value = v
  await persist()
}

async function persist() {
  await save({ durationMinutes: duration.value, soundId: sound.value, volume: volume.value })
  store.applyConfig({
    durationMinutes: duration.value,
    soundId: sound.value,
    volume: volume.value,
  })
}

function previewSound() {
  stopPreview()
  playPreview(sound.value, volume.value)
}

function goBack() {
  stopPreview()
  router.push('/')
}

const version = 'v0.1.0'
</script>

<template>
  <div class="settings" v-if="loaded">
    <header>
      <span class="back" @click="goBack">{{ zhCN.settings.back }}</span>
      <span class="title">{{ zhCN.settings.title }}</span>
    </header>

    <section class="eyebrow">{{ zhCN.settings.duration }}</section>
    <div class="row">
      <span>{{ zhCN.settings.duration }}</span>
      <select :value="duration" @change="onDurationChange">
        <option v-for="d in DURATION_OPTIONS" :key="d" :value="d">
          {{ d }} 分钟
        </option>
      </select>
    </div>

    <section class="eyebrow">{{ zhCN.settings.sound }}</section>
    <div class="row">
      <span>{{ zhCN.settings.sound }}</span>
      <select :value="sound" @change="onSoundChange">
        <option v-for="s in SOUND_OPTIONS" :key="s.id" :value="s.id">
          {{ s.label }}
        </option>
      </select>
    </div>

    <div class="row volume-row">
      <div class="volume-header">
        <span>{{ zhCN.settings.volume }}</span>
        <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        :value="Math.round(volume * 100)"
        @input="onVolumeChange"
      />
    </div>

    <section class="eyebrow">{{ zhCN.settings.preview }}</section>
    <div class="row center">
      <PillButton variant="primary" @click="previewSound">
        {{ zhCN.settings.playPreview }}
      </PillButton>
    </div>

    <footer>{{ version }}</footer>
  </div>
</template>

<style scoped>
.settings {
  max-width: 480px;
  margin: 0 auto;
  padding-bottom: 32px;
}

header {
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-muted);
  display: flex;
  align-items: center;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back {
  color: var(--color-primary);
  font-size: 18px;
  cursor: pointer;
  user-select: none;
}

.title {
  color: var(--color-text-strong);
  font-size: 16px;
  font-weight: 500;
}

.group-label {
  padding: 8px 20px;
  font-size: 12px;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(240, 253, 244, 0.5);
}

.eyebrow {
  padding: 14px 22px 6px;
  font-size: var(--text-label);
  font-weight: 500;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  background: transparent;
}

.row {
  background: white;
  padding: 16px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(240, 253, 244, 0.5);
  color: var(--color-text-strong);
}

.row.center {
  justify-content: center;
}

.volume-row {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.volume-header {
  display: flex;
  justify-content: space-between;
}

.volume-value {
  color: var(--color-primary);
}

select {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-muted);
  color: var(--color-primary);
  background: white;
  font-size: 14px;
  cursor: pointer;
}

input[type='range'] {
  width: 100%;
  accent-color: var(--color-primary);
}

footer {
  padding: 20px;
  text-align: center;
  color: var(--color-faint);
  font-size: 12px;
}
</style>
