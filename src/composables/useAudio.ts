import { onScopeDispose, ref } from 'vue'
import type { SoundId } from '@/types'

export function useAudio() {
  const audioRef = ref<HTMLAudioElement | null>(null)

  async function play(soundId: SoundId, volume: number) {
    stop()
    const url = `/sounds/${soundId}.wav`
    const audio = new Audio(url)
    audio.volume = volume
    audio.loop = true
    audioRef.value = audio
    try {
      await audio.play()
    } catch (err) {
      console.warn('Audio play failed:', err)
    }
  }

  function stop() {
    if (audioRef.value) {
      audioRef.value.pause()
      audioRef.value = null
    }
  }

  onScopeDispose(stop)

  return { play, stop }
}
