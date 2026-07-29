export const zhCN = {
  appName: 'Your Health',
  idle: {
    notStarted: '未开始',
    settingDuration: '设置: {{minutes}} 分钟',
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
    subtitle: '你已经坐了 {{minutes}} 分钟,起来走走吧',
    sittingFor: '本次久坐时长',
    snooze: '延后 5 分钟',
    acknowledge: '我知道了',
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
