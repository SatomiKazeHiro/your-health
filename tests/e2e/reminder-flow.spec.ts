import { test, expect } from '@playwright/test'

test.describe('久坐提醒 - 冒烟测试', () => {
  test('应用启动显示 idle 状态', async ({ page }) => {
    // 注:此测试需要先运行 npm run tauri dev
    // tauri-driver 会自动连接到 Tauri 应用
    await page.goto('tauri://localhost')
    await expect(page.locator('text=未开始')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('text=开始')).toBeVisible()
  })

  test('点开始 → 进入 running 状态', async ({ page }) => {
    await page.goto('tauri://localhost')
    await page.locator('text=开始').click()
    await expect(page.locator('text=中断')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('text=结束')).toBeVisible()
  })
})