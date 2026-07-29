<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTimerStore } from '@/stores/timerStore'
import { useTimer } from '@/composables/useTimer'
import { useAlerting } from '@/composables/useAlerting'
import ProgressRing from '@/components/ProgressRing.vue'
import CountdownText from '@/components/CountdownText.vue'
import PillButton from '@/components/PillButton.vue'
import { zhCN } from '@/i18n/zh-CN'

const router = useRouter()
const store = useTimerStore()
const timer = useTimer()
useAlerting()

const halfway = computed(() => store.progress >= 0.5)

const settingDurationText = computed(() =>
  zhCN.idle.settingDuration.replace('{{minutes}}', String(store.selectedDuration))
)

function onStart() {
  timer.start()
}

function onPause() {
  timer.pause()
}

function onResume() {
  timer.resume()
}

function onEnd() {
  timer.end()
}

function goSettings() {
  router.push('/settings')
}

const tickX = (i: number) => 100 + 86 * Math.sin((i - 1) * 30 * Math.PI / 180)
const tickY = (i: number) => 100 - 86 * Math.cos((i - 1) * 30 * Math.PI / 180)
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-7 px-6 py-12">
    <!-- IDLE -->
    <template v-if="store.state === 'idle'">
      <div class="flex flex-col items-center gap-3.5">
        <div class="relative w-[200px] h-[200px]">
          <ProgressRing :progress="0" :size="200" :stroke-width="14" />
          <svg
            class="absolute inset-0 pointer-events-none"
            :width="200"
            :height="200"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <g v-for="i in 12" :key="i">
              <circle
                :cx="tickX(i)"
                :cy="tickY(i)"
                r="1.6"
                fill="var(--color-primary)"
                fill-opacity="0.55"
              />
            </g>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <div class="text-[11px] font-medium tracking-[0.08em] uppercase text-text-subtle">待机</div>
            <div class="font-display font-light text-[28px] text-primary tabular-nums">
              {{ settingDurationText }}
            </div>
          </div>
        </div>
        <div class="w-60 h-px bg-primary opacity-30" />
      </div>

      <PillButton variant="primary" size="lg" @click="onStart">
        {{ zhCN.idle.start }}
      </PillButton>

      <button
        class="bg-transparent border-0 text-text-subtle text-sm tracking-[0.04em] px-3 py-2 cursor-pointer transition-colors duration-150 ease-[var(--ease-fresh)] hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-md"
        @click="goSettings"
      >
        {{ zhCN.idle.settings }}
      </button>
    </template>

    <!-- RUNNING -->
    <template v-else-if="store.state === 'running'">
      <div class="flex flex-col items-center gap-3.5">
        <div class="relative w-[200px] h-[200px]">
          <ProgressRing :progress="store.progress" :size="200" :stroke-width="14" />
          <svg
            class="absolute inset-0 pointer-events-none"
            :width="200"
            :height="200"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <g v-for="i in 12" :key="i">
              <circle
                :cx="tickX(i)"
                :cy="tickY(i)"
                r="1.6"
                fill="var(--color-primary)"
                fill-opacity="0.55"
              />
            </g>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <div class="font-display font-light text-primary-dark">
              <CountdownText :seconds="store.remainingSeconds" font="serif" />
            </div>
            <div class="text-[11px] tracking-[0.08em] uppercase text-text-subtle">
              {{ halfway ? zhCN.running.halfway : zhCN.running.remaining }}
            </div>
          </div>
        </div>
        <div class="w-60 h-px bg-primary opacity-30" />
      </div>

      <div class="flex gap-3">
        <PillButton variant="secondary" @click="onPause">
          {{ zhCN.running.pause }}
        </PillButton>
        <PillButton variant="secondary" @click="onEnd">
          {{ zhCN.running.end }}
        </PillButton>
      </div>
    </template>

    <!-- PAUSED -->
    <template v-else-if="store.state === 'paused'">
      <div class="flex flex-col items-center gap-3.5">
        <div class="relative w-[200px] h-[200px]">
          <ProgressRing
            :progress="store.progress"
            :size="200"
            :stroke-width="14"
            :color="'#86efac'"
            dashed
          />
          <svg
            class="absolute inset-0 pointer-events-none opacity-60"
            :width="200"
            :height="200"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <g v-for="i in 12" :key="i">
              <circle
                :cx="tickX(i)"
                :cy="tickY(i)"
                r="1.6"
                fill="var(--color-primary)"
                fill-opacity="0.30"
              />
            </g>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <div class="font-display font-light text-primary">
              <CountdownText :seconds="store.remainingSeconds" font="serif" color="#15803d" />
            </div>
            <div class="text-[11px] tracking-[0.08em] uppercase text-text-subtle">
              {{ zhCN.paused.paused }}
            </div>
          </div>
        </div>
        <div class="w-60 h-px border-t border-dashed border-primary opacity-40" />
      </div>

      <div class="flex gap-3">
        <PillButton variant="primary" @click="onResume">
          {{ zhCN.paused.resume }}
        </PillButton>
        <PillButton variant="secondary" @click="onEnd">
          {{ zhCN.paused.end }}
        </PillButton>
      </div>
    </template>
  </main>
</template>
