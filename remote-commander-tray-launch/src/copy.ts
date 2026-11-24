// On-screen copy for both cuts. The app's own UI (terminal, menu, toast) stays
// English in both: the app ships in English only.
export type Lang = "en" | "zh";

export const COPY = {
  en: {
    hook: "Using Desktop Commander Remote?",
    pain: "Close this window, and your PC goes offline.",
    name: "Remote Commander Tray",
    value: "No console window. Always ready in your tray.",
    signIn: ["Starts when you sign in.", "Connects on its own."],
    crash: ["Crashes? It restarts itself."],
    quiet: ["Quiet until it needs you."],
    control: ["Zero console clutter.", "Full lifecycle control."],
    facts: ["Microsoft Store & portable", "x64 & ARM64", "No admin rights", "Never reads your credentials"],
    tagline: "No console window. Always ready in your tray.",
  },
  zh: {
    hook: "你也在用 Desktop Commander Remote 吗？",
    pain: "这个窗口一关，电脑就掉线。",
    name: "Remote Commander Tray",
    value: "告别黑窗口，托盘里随时待命。",
    signIn: ["登录即启动，", "自动连上线。"],
    crash: ["崩了？自己重启。"],
    quiet: ["没事不打扰，有事才找你。"],
    control: ["桌面清清爽爽，", "启停尽在掌控。"],
    facts: ["Microsoft Store 版与便携版", "原生支持 x64 与 ARM64", "无需管理员权限", "从不读取你的登录凭据"],
    tagline: "告别黑窗口，托盘里随时待命。",
  },
} as const;

// Latin glyphs from Segoe UI Variable, CJK from Microsoft YaHei UI.
export const DISPLAY = {
  en: '"Segoe UI Variable Display", "Segoe UI Variable", "Segoe UI", sans-serif',
  zh: '"Segoe UI Variable Display", "Microsoft YaHei UI", "Microsoft YaHei", sans-serif',
} as const;
export const HEAVY = { en: 600, zh: 700 } as const;
