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
</script>

<template>
  <main class="home">
    <!-- IDLE 状态 -->
    <template v-if="store.state === 'idle'">
      <div class="stage">
        <div class="ring-shell">
          <ProgressRing :progress="0" :size="200" :stroke-width="14" />
          <!-- 12 个时钟刻度(静态,无动画) -->
          <svg class="ticks" :width="200" :height="200" viewBox="0 0 200 200" aria-hidden="true">
            <g v-for="i in 12" :key="i">
              <circle
                :cx="100 + 86 * Math.sin((i - 1) * 30 * Math.PI / 180)"
                :cy="100 - 86 * Math.cos((i - 1) * 30 * Math.PI / 180)"
                r="1.6"
                fill="var(--color-primary)"
                opacity="0.55"
              />
            </g>
          </svg>
          <div class="ring-center">
            <div class="eyebrow">待机</div>
            <div class="meta-big">{{ settingDurationText }}</div>
          </div>
        </div>
        <div class="ground-line" />
      </div>

      <PillButton variant="primary" size="lg" @click="onStart">
        {{ zhCN.idle.start }}
      </PillButton>

      <button class="settings-link" @click="goSettings">{{ zhCN.idle.settings }}</button>
    </template>

    <!-- RUNNING 状态 -->
    <template v-else-if="store.state === 'running'">
      <div class="stage">
        <div class="ring-shell">
          <ProgressRing :progress="store.progress" :size="200" :stroke-width="14" />
          <svg class="ticks" :width="200" :height="200" viewBox="0 0 200 200" aria-hidden="true">
            <g v-for="i in 12" :key="i">
              <circle
                :cx="100 + 86 * Math.sin((i - 1) * 30 * Math.PI / 180)"
                :cy="100 - 86 * Math.cos((i - 1) * 30 * Math.PI / 180)"
                r="1.6"
                fill="var(--color-primary)"
                opacity="0.55"
              />
            </g>
          </svg>
          <div class="ring-center">
            <div class="countdown">
              <CountdownText :seconds="store.remainingSeconds" font="serif" />
            </div>
            <div class="hint">{{ halfway ? zhCN.running.halfway : zhCN.running.remaining }}</div>
          </div>
        </div>
        <div class="ground-line" />
      </div>

      <div class="actions">
        <PillButton variant="secondary" @click="onPause">
          {{ zhCN.running.pause }}
        </PillButton>
        <PillButton variant="secondary" @click="onEnd">
          {{ zhCN.running.end }}
        </PillButton>
      </div>
    </template>

    <!-- PAUSED 状态 -->
    <template v-else-if="store.state === 'paused'">
      <div class="stage">
        <div class="ring-shell">
          <ProgressRing :progress="store.progress" :size="200" :stroke-width="14" :color="'#86efac'" dashed />
          <svg class="ticks paused" :width="200" :height="200" viewBox="0 0 200 200" aria-hidden="true">
            <g v-for="i in 12" :key="i">
              <circle
                :cx="100 + 86 * Math.sin((i - 1) * 30 * Math.PI / 180)"
                :cy="100 - 86 * Math.cos((i - 1) * 30 * Math.PI / 180)"
                r="1.6"
                fill="var(--color-primary)"
                opacity="0.30"
              />
            </g>
          </svg>
          <div class="ring-center">
            <div class="countdown serif-mono">
              <CountdownText :seconds="store.remainingSeconds" font="serif" color="#15803d" />
            </div>
            <div class="hint">{{ zhCN.paused.paused }}</div>
          </div>
        </div>
        <div class="ground-line dashed" />
      </div>

      <div class="actions">
        <PillButton variant="primary" @click="onResume">
          {{ zhCN.paused.resume }}
        </PillButton>
        <PillButton variant="secondary" @click="onEnd">
          {{ zhCN.paused.end }}
        </PillButton>
      </div>
    </template>

    <!-- alerting 不在此页处理 -->
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 48px 24px 32px;
  gap: 28px;
}

.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.ring-shell {
  position: relative;
  width: 200px;
  height: 200px;
}

.ticks {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ticks.paused {
  opacity: 0.6;
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.eyebrow {
  font-size: var(--text-label);
  font-weight: 500;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.meta-big {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 28px;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums lining-nums;
}

.meta-big span {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-subtle);
  margin-left: 2px;
  letter-spacing: 0.02em;
}

.countdown {
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums lining-nums;
  color: var(--color-primary-dark);
}

.hint {
  font-size: var(--text-label);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  margin-top: 2px;
}

.ground-line {
  width: 240px;
  height: 1px;
  background: var(--color-primary);
  opacity: 0.30;
}

.ground-line.dashed {
  background: none;
  border-top: 1px dashed var(--color-primary);
  opacity: 0.4;
}

.actions {
  display: flex;
  gap: 12px;
}

.settings-link {
  background: transparent;
  border: none;
  color: var(--color-text-subtle);
  font-size: 14px;
  letter-spacing: 0.04em;
  cursor: pointer;
  padding: 8px 12px;
  transition: color var(--t-fast) var(--ease);
}
.settings-link:hover {
  color: var(--color-primary);
}
.settings-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}
</style>