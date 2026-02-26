import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '../i18n'
import { translations } from '../i18n'

// Helper — apply dark class to <html> immediately
function applyTheme(dark: boolean) {
  const html = document.documentElement
  if (dark) {
    html.classList.add('dark')
    html.style.colorScheme = 'dark'
  } else {
    html.classList.remove('dark')
    html.style.colorScheme = 'light'
  }
}

// ─── Theme Store ─────────────────────────────────────────────────────────────
interface ThemeState {
  dark: boolean
  toggle: () => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: true,
      toggle: () => {
        const next = !get().dark
        applyTheme(next)
        set({ dark: next })
      },
    }),
    {
      name: 'iot-theme',
      onRehydrateStorage: () => (state) => {
        // After localStorage rehydration, sync DOM immediately
        if (state) applyTheme(state.dark)
      },
    }
  )
)

// ─── Language Store ───────────────────────────────────────────────────────────
interface LangState {
  lang: Lang
  t: (key: string) => string
  setLang: (lang: Lang) => void
}

export const useLang = create<LangState>()(
  persist(
    (set) => ({
      lang: 'ru',
      t: (key: string) => (translations.ru as Record<string, string>)[key] ?? key,
      setLang: (lang: Lang) =>
        set({
          lang,
          t: (key: string) => (translations[lang] as Record<string, string>)[key] ?? key,
        }),
    }),
    { name: 'iot-lang' }
  )
)

// ─── Notification Store ───────────────────────────────────────────────────────
interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

interface NotifState {
  notifications: Notification[]
  push: (n: Omit<Notification, 'id'>) => void
  remove: (id: string) => void
}

export const useNotifications = create<NotifState>((set) => ({
  notifications: [],
  push: (n) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ notifications: [...s.notifications, { ...n, id }] }))
    setTimeout(() => set((s) => ({ notifications: s.notifications.filter(x => x.id !== id) })), 4000)
  },
  remove: (id) => set((s) => ({ notifications: s.notifications.filter(x => x.id !== id) })),
}))
