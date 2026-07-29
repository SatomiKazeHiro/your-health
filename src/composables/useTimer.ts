import { onUnmounted, getCurrentInstance } from 'vue'
import { useTimerStore } from '@/stores/timerStore'

export function useTimer() {
  const store = useTimerStore()
  let intervalId: number | null = null
  let lastTickAt = Date.now()

  function doTick() {
    const now = Date.now()
    const elapsed = Math.floor((now - lastTickAt) / 1000)
    if (elapsed > 0) {
      store.tick(elapsed)
      lastTickAt = now
    }
  }

  function start() {
    if (intervalId !== null) return
    store.start()
    lastTickAt = Date.now()
    intervalId = window.setInterval(doTick, 1000)
  }

  function pause() {
    if (intervalId === null) return
    window.clearInterval(intervalId)
    intervalId = null
    store.pause()
  }

  function resume() {
    if (intervalId !== null) return
    store.resume()
    lastTickAt = Date.now()
    intervalId = window.setInterval(doTick, 1000)
  }

  function end() {
    if (intervalId !== null) {
      window.clearInterval(intervalId)
      intervalId = null
    }
    store.end()
  }

  function onVisibilityChange() {
    if (!document.hidden && intervalId !== null) {
      doTick() // 补偿
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange)

  // Only register cleanup if called inside a component setup
  if (getCurrentInstance()) {
    onUnmounted(() => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (intervalId !== null) window.clearInterval(intervalId)
    })
  }

  return { start, pause, resume, end }
}
