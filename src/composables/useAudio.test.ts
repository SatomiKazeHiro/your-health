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
})

describe('useAudio', () => {
  it('play() 创建 Audio 并设置 loop', async () => {
    const { play } = useAudio()
    await play('bell-1', 0.5)
    expect(mockAudioInstances).toHaveLength(1)
    expect(mockAudioInstances[0].src).toBe('/sounds/bell-1.wav')
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

  it('play() 当 audio.play() 失败时不会向调用方抛出', async () => {
    const origPlay = MockAudio.prototype.play
    MockAudio.prototype.play = vi.fn().mockRejectedValue(new Error('autoplay blocked'))
    try {
      const { play } = useAudio()
      await expect(play('bell-1', 0.5)).resolves.toBeUndefined()
    } finally {
      MockAudio.prototype.play = origPlay
    }
  })

  it('stop(fadeMs) 渐弱后 pause', async () => {
    const { play, stop } = useAudio()
    await play('bell-1', 1)
    const audio = mockAudioInstances[0]
    await stop(60)
    expect(audio.pause).toHaveBeenCalled()
    expect(audio.volume).toBeCloseTo(0, 5)
  })

  it('play() 会等待上一次 stop(fadeMs) 完成', async () => {
    const { play, stop } = useAudio()
    await play('bell-1', 0.5)
    const fading = stop(60) // 不 await
    // 立即 play,应被串行化等 fade 完成才 pause 旧的
    const playPromise = play('bell-2', 0.5)
    // 此时第一次的 audio 还没 pause
    expect(mockAudioInstances[0].pause).not.toHaveBeenCalled()
    await fading
    await playPromise
    expect(mockAudioInstances[0].pause).toHaveBeenCalled()
    expect(mockAudioInstances).toHaveLength(2)
  })
})
