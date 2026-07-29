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
  <div class="max-w-[480px] mx-auto pb-8" v-if="loaded">
    <header class="bg-surface px-5 py-4 border-b border-hairline flex items-center gap-3 sticky top-0 z-10">
      <span class="text-primary text-lg cursor-pointer select-none" @click="goBack">{{ zhCN.settings.back }}</span>
      <span class="text-primary-dark text-base font-medium">{{ zhCN.settings.title }}</span>
    </header>

    <section class="text-[11px] font-medium tracking-[0.08em] uppercase text-text-subtle px-[22px] py-3.5 bg-transparent">{{ zhCN.settings.duration }}</section>
    <div class="bg-surface px-5 py-4 flex justify-between items-center border-b border-hairline text-primary-dark">
      <span>{{ zhCN.settings.duration }}</span>
      <select
        :value="duration"
        @change="onDurationChange"
        class="px-3 py-1.5 rounded-md border border-hairline text-primary bg-surface text-sm cursor-pointer"
      >
        <option v-for="d in DURATION_OPTIONS" :key="d" :value="d">
          {{ d }} 分钟
        </option>
      </select>
    </div>

    <section class="text-[11px] font-medium tracking-[0.08em] uppercase text-text-subtle px-[22px] py-3.5 bg-transparent">{{ zhCN.settings.sound }}</section>
    <div class="bg-surface px-5 py-4 flex justify-between items-center border-b border-hairline text-primary-dark">
      <span>{{ zhCN.settings.sound }}</span>
      <select
        :value="sound"
        @change="onSoundChange"
        class="px-3 py-1.5 rounded-md border border-hairline text-primary bg-surface text-sm cursor-pointer"
      >
        <option v-for="s in SOUND_OPTIONS" :key="s.id" :value="s.id">
          {{ s.label }}
        </option>
      </select>
    </div>

    <div class="bg-surface px-5 py-4 flex flex-col items-stretch gap-3 border-b border-hairline text-primary-dark">
      <div class="flex justify-between">
        <span>{{ zhCN.settings.volume }}</span>
        <span class="text-primary">{{ Math.round(volume * 100) }}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        :value="Math.round(volume * 100)"
        @input="onVolumeChange"
        class="w-full accent-[var(--color-primary)]"
      />
    </div>

    <section class="text-[11px] font-medium tracking-[0.08em] uppercase text-text-subtle px-[22px] py-3.5 bg-transparent">{{ zhCN.settings.preview }}</section>
    <div class="bg-surface px-5 py-4 flex justify-center items-center border-b border-hairline text-primary-dark">
      <PillButton variant="primary" @click="previewSound">
        {{ zhCN.settings.playPreview }}
      </PillButton>
    </div>

    <footer class="px-5 py-5 text-center text-faint text-xs">{{ version }}</footer>
  </div>
</template>
