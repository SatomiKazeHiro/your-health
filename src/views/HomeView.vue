<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTimerStore } from '@/stores/timerStore'
import { useTimer } from '@/composables/useTimer'
import ProgressRing from '@/components/ProgressRing.vue'
import CountdownText from '@/components/CountdownText.vue'
import PillButton from '@/components/PillButton.vue'
import { zhCN } from '@/i18n/zh-CN'

const router = useRouter()
const store = useTimerStore()
const timer = useTimer()

const halfway = computed(() => store.progress >= 0.5)

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
    <!-- idle -->
    <template v-if="store.state === 'idle'">
      <div class="ring-wrap">
        <ProgressRing :progress="0" :size="200" />
        <div class="center">
          <div class="not-started">{{ zhCN.idle.notStarted }}</div>
          <div class="setting-info">
            {{ zhCN.idle.settingDuration.replace('{{minutes}}', String(store.selectedDuration)) }}
          </div>
        </div>
      </div>
      <PillButton variant="primary" size="lg" @click="onStart">
        {{ zhCN.idle.start }}
      </PillButton>
      <button class="settings-link" @click="goSettings">{{ zhCN.idle.settings }}</button>
    </template>

    <!-- running -->
    <template v-else-if="store.state === 'running'">
      <div class="ring-wrap">
        <ProgressRing :progress="store.progress" :size="200" />
        <div class="center">
          <CountdownText :seconds="store.remainingSeconds" />
          <div class="hint">
            {{ halfway ? zhCN.running.halfway : zhCN.running.remaining }}
          </div>
        </div>
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

    <!-- paused -->
    <template v-else-if="store.state === 'paused'">
      <div class="ring-wrap">
        <ProgressRing
          :progress="store.progress"
          :size="200"
          :color="'#86efac'"
          dashed
        />
        <div class="center">
          <CountdownText :seconds="store.remainingSeconds" color="#15803d" />
          <div class="hint">{{ zhCN.paused.paused }}</div>
        </div>
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
  padding: 32px 24px;
  gap: 24px;
}

.ring-wrap {
  position: relative;
  width: 200px;
  height: 200px;
}

.center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.not-started {
  font-size: 18px;
  color: var(--color-primary);
  font-weight: 500;
}

.setting-info {
  font-size: 13px;
  color: var(--color-primary);
  margin-top: 4px;
}

.hint {
  font-size: 12px;
  color: var(--color-text);
  margin-top: 4px;
}

.actions {
  display: flex;
  gap: 12px;
}

.settings-link {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 14px;
  cursor: pointer;
}
</style>