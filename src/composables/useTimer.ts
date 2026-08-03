import { watch, onUnmounted, getCurrentInstance } from 'vue'
import { useTimerStore } from '@/stores/timerStore'

// 计时器副作用层。store 负责纯状态机;这个 composable 把 setInterval 的
// 生命周期跟 store.state 绑定,以及在窗口失焦/失活时补偿 wall-clock 漂移。
export function useTimer() {
  const store = useTimerStore()
  let intervalId: number | null = null

  function tick() {
    store.recompute()
    if (store.state !== 'running') stopTicker()
  }

  function startTicker() {
    if (intervalId !== null) return
    intervalId = window.setInterval(tick, 1000)
  }

  function stopTicker() {
    if (intervalId !== null) {
      window.clearInterval(intervalId)
      intervalId = null
    }
  }

  function start() {
    store.start()
    startTicker()
  }

  function pause() {
    stopTicker()
    store.pause()
  }

  function resume() {
    store.resume()
    startTicker()
  }

  function end() {
    stopTicker()
    store.end()
  }

  // 兜底:外部事件(alert 弹窗的 snooze)直接改了 store.state,绕过 facade,
  // 仍要保证 ticker 跟上。
  watch(() => store.state, (s) => {
    if (s === 'running') startTicker()
    else stopTicker()
  })

  function catchUp() {
    if (intervalId !== null) store.recompute()
  }

  document.addEventListener('visibilitychange', catchUp)
  window.addEventListener('focus', catchUp)
  window.addEventListener('blur', catchUp)

  if (getCurrentInstance()) {
    onUnmounted(() => {
      document.removeEventListener('visibilitychange', catchUp)
      window.removeEventListener('focus', catchUp)
      window.removeEventListener('blur', catchUp)
      stopTicker()
    })
  }

  return { start, pause, resume, end }
}