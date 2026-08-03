import sharp from 'sharp'
import { spawn } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const svgPath = process.argv[2]
if (!svgPath) {
  console.error('Usage: pnpm icons:build <path/to/icon.svg>')
  process.exit(1)
}

const tmpPng = resolve(root, 'src-tauri/app-icon.png')

console.log(`[icons] SVG → 1024×1024 PNG`)
await sharp(resolve(root, svgPath))
  .resize(1024, 1024, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(tmpPng)

console.log('[icons] 生成 32/128/128@2x PNG + ICO + ICNS')
await new Promise((resolve, reject) => {
  const proc = spawn('pnpm', ['tauri', 'icon', tmpPng], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  })
  proc.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`tauri icon exited ${code}`))))
})

console.log('[icons] 完成')