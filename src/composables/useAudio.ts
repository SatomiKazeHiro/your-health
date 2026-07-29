import { ref } from 'vue'
import { convertFileSrc } from '@tauri-apps/api/core'

export function useAudio() {
  const audioRef = ref<HTMLAudioElement | null>(null)

  async function play(soundId: string, volume: number) {
    stop()
    const url = convertFileSrc(`assets/sounds/${soundId}.wav`)
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

  return { play, stop }
}
