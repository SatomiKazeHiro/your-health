import { getCurrentScope, onScopeDispose, ref } from 'vue'
import type { SoundId } from '@/types'

export function useAudio() {
  const audioRef = ref<HTMLAudioElement | null>(null)
  let stopPromise: Promise<void> = Promise.resolve()

  function stopImmediate() {
    if (audioRef.value) {
      audioRef.value.pause()
      audioRef.value = null
    }
  }

  async function play(soundId: SoundId, volume: number) {
    // 串行化:如果上一次 stop 还在淡出,先等它结束再开始新音频
    await stopPromise
    stopImmediate()
    const audio = new Audio(`/sounds/${soundId}.wav`)
    audio.volume = volume
    audio.loop = true
    audioRef.value = audio
    try {
      await audio.play()
    } catch (err) {
      console.warn('Audio play failed:', err)
    }
  }

  function stop(fadeMs = 0): Promise<void> {
    if (!audioRef.value) return stopPromise
    if (fadeMs <= 0) {
      stopImmediate()
      stopPromise = Promise.resolve()
      return stopPromise
    }
    const audio = audioRef.value
    audioRef.value = null
    const startVolume = audio.volume
    const steps = Math.max(1, Math.floor(fadeMs / 30))
    const stepMs = fadeMs / steps
    let i = 0
    stopPromise = new Promise<void>((resolve) => {
      const tick = () => {
        i += 1
        audio.volume = startVolume * (1 - i / steps)
        if (i >= steps) {
          audio.pause()
          resolve()
        } else {
          window.setTimeout(tick, stepMs)
        }
      }
      window.setTimeout(tick, stepMs)
    })
    return stopPromise
  }

  if (getCurrentScope()) {
    onScopeDispose(() => stopImmediate())
  }

  return { play, stop }
}