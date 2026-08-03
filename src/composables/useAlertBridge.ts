import { onMounted, onUnmounted } from 'vue'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { useTimerStore } from '@/stores/timerStore'
import { ALERT_ACTION_EVENT, type AlertActionPayload } from '@/lib/events'

export function useAlertBridge() {
  const store = useTimerStore()
  let unlisten: UnlistenFn | null = null

  onMounted(async () => {
    unlisten = await listen<AlertActionPayload>(ALERT_ACTION_EVENT, (event) => {
      if (event.payload.action === 'acknowledge') {
        store.acknowledge()
      } else if (event.payload.action === 'snooze') {
        store.snooze()
      }
    })
  })

  onUnmounted(() => {
    if (unlisten) {
      unlisten()
      unlisten = null
    }
  })
}