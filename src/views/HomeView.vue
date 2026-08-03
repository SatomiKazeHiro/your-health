<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TimerState } from '@/types'
import { useTimerStore } from '@/stores/timerStore'
import { useTimer } from '@/composables/useTimer'
import { useAlerting } from '@/composables/useAlerting'
import { useAlertBridge } from '@/composables/useAlertBridge'
import { closeAlertWindow } from '@/lib/tauri'
import ConfirmModal from '@/components/ConfirmModal.vue'
import IdlePanel from '@/components/panels/IdlePanel.vue'
import RunningPanel from '@/components/panels/RunningPanel.vue'
import PausedPanel from '@/components/panels/PausedPanel.vue'
import AlertingPanel from '@/components/panels/AlertingPanel.vue'
import { zhCN } from '@/i18n/zh-CN'

const store = useTimerStore()
const timer = useTimer()
useAlerting()
useAlertBridge()

const prevState = ref<TimerState | null>(null)
watch(
  () => store.state,
  (_newVal, oldVal) => {
    prevState.value = oldVal as TimerState | null
  },
  { immediate: true }
)

const animateProgress = computed(
  () => store.state === 'running' && (prevState.value === 'idle' || prevState.value === 'alerting')
)

const showEndConfirm = ref(false)

function onStart() { timer.start() }
function onPause() { timer.pause() }
function onResume() { timer.resume() }
function requestEnd() { showEndConfirm.value = true }
function confirmEnd() {
  showEndConfirm.value = false
  timer.end()
}
function cancelEnd() { showEndConfirm.value = false }

async function onAcknowledgeFromAlerting() {
  store.acknowledge()
  await closeAlertWindow()
}
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center px-6 py-10 font-body overflow-hidden">
    <Transition name="state" mode="out-in">
      <IdlePanel v-if="store.state === 'idle'" key="idle" @start="onStart" />
      <RunningPanel
        v-else-if="store.state === 'running'"
        key="running"
        :animate-progress="animateProgress"
        @pause="onPause"
        @request-end="requestEnd"
      />
      <PausedPanel
        v-else-if="store.state === 'paused'"
        key="paused"
        :animate-progress="animateProgress"
        @resume="onResume"
        @request-end="requestEnd"
      />
      <AlertingPanel
        v-else-if="store.state === 'alerting'"
        key="alerting"
        @acknowledge="onAcknowledgeFromAlerting"
      />
    </Transition>

    <ConfirmModal
      :open="showEndConfirm"
      :title="zhCN.endConfirm.title"
      :message="zhCN.endConfirm.message"
      :confirm-text="zhCN.endConfirm.confirm"
      :cancel-text="zhCN.endConfirm.cancel"
      @confirm="confirmEnd"
      @cancel="cancelEnd"
    />
  </main>
</template>

<style scoped>
.state-enter-active,
.state-leave-active {
  transition: opacity 280ms var(--ease-fresh), transform 280ms var(--ease-fresh);
}
.state-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.state-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .state-enter-active,
  .state-leave-active {
    transition: none;
  }
}
</style>