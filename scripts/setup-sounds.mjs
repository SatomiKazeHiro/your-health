// 占位脚本: MVP 阶段使用生成的 WAV 文件
// 真实铃声应在后续替换为从 Freesound 下载的音频
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const soundsDir = join(__dirname, '..', 'public', 'sounds')
mkdirSync(soundsDir, { recursive: true })

// 生成 5 个不同的简短 WAV (440Hz 不同长度的正弦波)
const sampleRate = 22050
const durations = [0.3, 0.4, 0.5, 0.25, 0.6]
const frequencies = [880, 660, 1320, 440, 990]

for (let i = 0; i < 5; i++) {
  const duration = durations[i]
  const freq = frequencies[i]
  const numSamples = Math.floor(sampleRate * duration)
  const buffer = Buffer.alloc(44 + numSamples * 2)

  // WAV header
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + numSamples * 2, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // PCM chunk size
  buffer.writeUInt16LE(1, 20) // format = PCM
  buffer.writeUInt16LE(1, 22) // channels = mono
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28) // byte rate
  buffer.writeUInt16LE(2, 32) // block align
  buffer.writeUInt16LE(16, 34) // bits per sample
  buffer.write('data', 36)
  buffer.writeUInt32LE(numSamples * 2, 40)

  // Generate sine wave with envelope
  for (let n = 0; n < numSamples; n++) {
    const t = n / sampleRate
    const envelope = Math.exp(-3 * t / duration)
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5
    buffer.writeInt16LE(Math.floor(sample * 32767), 44 + n * 2)
  }

  const filename = join(soundsDir, `bell-${i + 1}.wav`)
  writeFileSync(filename, buffer)
  console.log(`Generated ${filename}`)
}