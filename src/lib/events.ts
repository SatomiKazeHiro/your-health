// 跨窗口事件契约。所有跨 webview 通信的事件名和 payload 类型在此集中。
// 主窗口 (main) 与提醒弹窗 (alert) 各自在独立 JS 上下文,仅靠事件互通。

export const ALERT_ACTION_EVENT = 'alert:action'

export type AlertAction = 'acknowledge' | 'snooze'

export interface AlertActionPayload {
  action: AlertAction
}