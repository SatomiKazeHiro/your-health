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

console.log(`[exe-icon] ${ico} → ${exe}`)
await rcedit(exe, { icon: ico })
console.log('[exe-icon] 完成')