import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const exe = resolve(root, 'src-tauri/target/release/your-health.exe')
const ico = resolve(root, 'src-tauri/icons/icon.ico')

if (!existsSync(exe)) {
  console.error(`[exe-icon] 找不到 ${exe},请先运行 pnpm app:portable`)
  process.exit(1)
}
if (!existsSync(ico)) {
  console.error(`[exe-icon] 找不到 ${ico}`)
  process.exit(1)
}

const require = createRequire(import.meta.url)
const { rcedit } = require('rcedit')

// rcedit 直接修改 PE 资源段,如果 .exe 仍被占用(残留进程、Windows
// Defender 实时扫描刚完成、Explorer 预览句柄未释放等),会报
// "Unable to commit changes"。短窗口内通常会自动释放,所以重试几
// 次而不是让整个 pnpm app:portable 失败。
const MAX_ATTEMPTS = 5
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    console.log(`[exe-icon] ${ico} → ${exe} (attempt ${attempt}/${MAX_ATTEMPTS})`)
    await rcedit(exe, { icon: ico })
    console.log('[exe-icon] 完成')
    process.exit(0)
  } catch (err) {
    const message = String(err?.stderr ?? err?.message ?? err)
    const transient = /Unable to commit changes|Access is denied/i.test(message)
    if (!transient || attempt === MAX_ATTEMPTS) {
      console.error(`[exe-icon] 失败: ${message}`)
      console.error('[exe-icon] 如果 .exe 仍在运行请先关闭,或等待 Defender 扫描完成后再试')
      process.exit(1)
    }
    await new Promise((r) => setTimeout(r, 500 * attempt))
  }
}