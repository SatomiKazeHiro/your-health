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
  <main class="min-h-screen flex flex-col font-body" v-if="loaded">
    <header class="px-5 py-3 flex items-center gap-3">
      <button
        class="bg-transparent border-0 text-primary text-lg cursor-pointer select-none px-2 py-1 rounded-md transition-colors duration-150 ease-[var(--ease-fresh)] hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :aria-label="zhCN.settings.title"
        @click="goBack"
      >
        {{ zhCN.settings.back }}
      </button>
      <span class="text-primary-dark text-base font-medium">{{ zhCN.settings.title }}</span>
    </header>

    <div class="w-full h-px bg-hairline" />

    <div class="flex-1 flex flex-col justify-center max-w-[400px] mx-auto w-full px-5">
      <div class="flex justify-between items-center py-3.5 border-b border-hairline text-primary-dark">
        <span class="text-sm">{{ zhCN.settings.duration }}</span>
        <select
          :value="duration"
          @change="onDurationChange"
          class="px-3 py-1.5 rounded-md border border-hairline text-primary bg-surface text-sm cursor-pointer transition-colors duration-150 ease-[var(--ease-fresh)] hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <option v-for="d in DURATION_OPTIONS" :key="d" :value="d">
            {{ d }} 分钟
          </option>
        </select>
      </div>

      <div class="flex justify-between items-center py-3.5 border-b border-hairline text-primary-dark">
        <span class="text-sm">{{ zhCN.settings.sound }}</span>
        <select
          :value="sound"
          @change="onSoundChange"
          class="px-3 py-1.5 rounded-md border border-hairline text-primary bg-surface text-sm cursor-pointer transition-colors duration-150 ease-[var(--ease-fresh)] hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <option v-for="s in SOUND_OPTIONS" :key="s.id" :value="s.id">
            {{ s.label }}
          </option>
        </select>
      </div>

      <div class="flex flex-col gap-3 py-3.5 border-b border-hairline text-primary-dark">
        <div class="flex justify-between items-center text-sm">
          <span>{{ zhCN.settings.volume }}</span>
          <span class="text-primary tabular-nums">{{ Math.round(volume * 100) }}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          :value="Math.round(volume * 100)"
          @input="onVolumeChange"
          class="w-full accent-[var(--color-primary)] cursor-pointer"
        />
      </div>

      <div class="flex justify-center py-4">
        <PillButton variant="primary" size="md" @click="previewSound">
          {{ zhCN.settings.playPreview }}
        </PillButton>
      </div>
    </div>

    <footer class="px-5 py-3 text-center text-faint text-[10px] tracking-[0.1em]">
      {{ version }}
    </footer>
  </main>
</template>