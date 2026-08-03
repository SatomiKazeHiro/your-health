// v1 显式选择单语言(zh-CN)。所有文案直接 import 使用,
// 不引入 i18n 库,不做 key 树。如未来需要多语言,在此处拆出 locale 目录
// 并替换 import 路径即可。

export const zhCN = {
  appName: 'Your Health',
  idle: {
    label: '本次坐姿',
    start: '开始',
    settings: '⚙ 设置',
  },
  running: {
    remaining: '剩余',
    halfway: '已过半',
    pause: '中断',
    end: '结束',
  },
  paused: {
    paused: '已暂停',
    resume: '继续',
    end: '结束',
  },
  alert: {
    title: '该起来活动啦!',
    subtitle: '你已经坐了 {{minutes}} 分钟，起来走走吧',
    sittingFor: '本次久坐时长',
    snooze: '延后 5 分钟',
    acknowledge: '我知道了',
  },
  alerting: {
    label: '已结束',
    prompt: '请在弹窗中确认',
    acknowledge: '我知道了',
  },
  endConfirm: {
    title: '结束本次计时?',
    message: '已开始一段时间,确定要提前结束吗?',
    confirm: '结束',
    cancel: '取消',
  },
  settings: {
    title: '设置',
    back: '←',
    duration: '提醒时长',
    sound: '提醒铃声',
    volume: '音量',
    preview: '预览',
    playPreview: '▶ 试听铃声',
  },
} as const

export type Translation = typeof zhCN
