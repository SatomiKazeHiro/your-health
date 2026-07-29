import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAudio } from './useAudio'

const mockAudioInstances: any[] = []

class MockAudio {
  src = ''
  volume = 1
  loop = false
  paused = true
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn(function (this: any) {
    this.paused = true
  })
  constructor(src: string) {
    this.src = src
    mockAudioInstances.push(this)
  }
}

beforeEach(() => {
  mockAudioInstances.length = 0
  ;(globalThis as any).Audio = MockAudio
  vi.mock('@tauri-apps/api/core', () => ({
    convertFileSrc: (path: string) => `tauri://localhost/${path}`,
  }))
})

describe('useAudio', () => {
  it('play() 创建 Audio 并设置 loop', async () => {
    const { play } = useAudio()
    await play('bell-1', 0.5)
    expect(mockAudioInstances).toHaveLength(1)
    expect(mockAudioInstances[0].src).toBe('tauri://localhost/assets/sounds/bell-1.wav')
    expect(mockAudioInstances[0].loop).toBe(true)
    expect(mockAudioInstances[0].volume).toBe(0.5)
    expect(mockAudioInstances[0].play).toHaveBeenCalled()
  })

  it('stop() 暂停当前 audio', async () => {
    const { play, stop } = useAudio()
    await play('bell-1', 0.5)
    const audio = mockAudioInstances[0]
    stop()
    expect(audio.pause).toHaveBeenCalled()
  })

  it('stop() 在没有 audio 时不报错', () => {
    const { stop } = useAudio()
    expect(() => stop()).not.toThrow()
  })

  it('play() 后再 play() 会先 stop 旧的', async () => {
    const { play } = useAudio()
    await play('bell-1', 0.5)
    const first = mockAudioInstances[0]
    await play('bell-2', 0.5)
    expect(first.pause).toHaveBeenCalled()
    expect(mockAudioInstances).toHaveLength(2)
  })
})
