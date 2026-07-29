import { onUnmounted, getCurrentInstance } from 'vue'
import { useTimerStore } from '@/stores/timerStore'

export function useTimer() {
  const store = useTimerStore()
  let intervalId: number | null = null

  function recompute() {
    store.recompute()
  }

  function start() {
    if (intervalId !== null) return
    store.start()
    intervalId = window.setInterval(recompute, 1000)
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
    intervalId = window.setInterval(recompute, 1000)
  }

  function end() {
    if (intervalId !== null) {
      window.clearInterval(intervalId)
      intervalId = null
    }
    store.end()
  }

  function catchUp() {
    if (intervalId !== null) {
      recompute()
    }
  }

  document.addEventListener('visibilitychange', catchUp)
  window.addEventListener('focus', catchUp)
  window.addEventListener('blur', catchUp)

  // Only register cleanup if called inside a component setup
  if (getCurrentInstance()) {
    onUnmounted(() => {
      document.removeEventListener('visibilitychange', catchUp)
      window.removeEventListener('focus', catchUp)
      window.removeEventListener('blur', catchUp)
      if (intervalId !== null) window.clearInterval(intervalId)
    })
  }

  return { start, pause, resume, end }
}
