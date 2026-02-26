import React, { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useTheme, useLang, useNotifications } from '../../stores'
import type { Lang } from '../../i18n'

const NAV_ITEMS = [
  { to: '/',        icon: '⬡', key: 'dashboard' },
  { to: '/devices', icon: '◉', key: 'devices' },
  { to: '/alerts',  icon: '◎', key: 'alerts' },
  { to: '/rules',   icon: '⌬', key: 'rules' },
] as const

// ─── Notifications ─────────────────────────────────────────────────────────
export const NotificationStack = () => {
  const { notifications, remove } = useNotifications()
  const icons: Record<string, string> = { success: '✓', error: '✗', info: 'ℹ', warning: '⚠' }
  const colors: Record<string, string> = {
    success: 'border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400',
    error:   'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400',
    info:    'border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  }
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {notifications.map(n => (
        <div key={n.id} onClick={() => remove(n.id)}
          className={clsx('flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm cursor-pointer animate-slide-in shadow-lg', colors[n.type])}>
          <span className="text-sm font-mono flex-shrink-0 mt-0.5">{icons[n.type]}</span>
          <span className="text-sm font-body">{n.message}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Language Switcher ─────────────────────────────────────────────────────
const LANGS: { value: Lang; label: string; flag: string }[] = [
  { value: 'en', label: 'EN', flag: '🇺🇸' },
  { value: 'ru', label: 'RU', flag: '🇷🇺' },
  { value: 'tk', label: 'TK', flag: '🇹🇲' },
]

// ─── Top Bar ───────────────────────────────────────────────────────────────
export const TopBar = () => {
  const { dark, toggle } = useTheme()
  const { lang, setLang } = useLang()
  const location = useLocation()

  return (
    <header className="h-14 border-b t-border t-header flex items-center px-6 gap-4 sticky top-0 z-30 backdrop-blur-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 t-text-muted text-xs font-mono">
          <span style={{ color: 'var(--text-code)' }}>IoT</span>
          <span>/</span>
          <span className="t-text-secondary">{location.pathname.replace('/', '') || 'dashboard'}</span>
        </div>
      </div>

      {/* Online indicator */}
      <div className="flex items-center gap-1.5 text-xs font-mono text-green-500">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="hidden sm:inline">online</span>
      </div>

      {/* Language switcher */}
      <div className="flex items-center gap-0.5 t-card border rounded-lg p-1">
        {LANGS.map(l => (
          <button
            key={l.value}
            onClick={() => setLang(l.value)}
            className={clsx(
              'px-2 py-1 rounded-md text-xs font-mono font-semibold transition-all duration-150',
              lang === l.value
                ? 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/40'
                : 't-text-muted hover:t-text-secondary'
            )}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="w-9 h-9 rounded-lg border t-border t-card hover:border-cyan-500/50 transition-all flex items-center justify-center t-text-muted hover:text-cyan-500 text-base"
      >
        {dark ? '☀' : '☾'}
      </button>
    </header>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────
export const Sidebar = () => {
  const { t } = useLang()

  return (
    <aside className="w-16 xl:w-56 h-screen flex-shrink-0 border-r t-border t-sidebar flex flex-col sticky top-0 z-40 backdrop-blur-sm">
      {/* Logo */}
      <div className="h-14 border-b t-border flex items-center px-4 gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
          <span className="text-cyan-500 text-sm font-mono font-bold">⬡</span>
        </div>
        <div className="hidden xl:block overflow-hidden">
          <p className="font-display font-bold t-text-primary text-sm leading-none">IoT Audit</p>
          <p className="font-mono text-[10px] text-cyan-500/70 mt-0.5">Security Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ to, icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group border',
              isActive
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500'
                : 't-text-muted border-transparent t-hover'
            )}
          >
            {({ isActive }) => (
              <>
                <span className={clsx('text-base flex-shrink-0', isActive ? 'text-cyan-500' : 't-text-muted')}>
                  {icon}
                </span>
                <span className="hidden xl:block text-sm font-body font-medium truncate">
                  {t(key)}
                </span>
                {isActive && <span className="hidden xl:block ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t t-border">
        <div className="hidden xl:block text-center">
          <p className="font-mono text-[10px] t-text-muted opacity-50">v0.1.0 • Diploma</p>
        </div>
      </div>
    </aside>
  )
}

// ─── Page Layout ──────────────────────────────────────────────────────────
export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const { dark } = useTheme()

  // Sync dark class on every change
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'var(--grid-bg)' }} />
      {/* Glow orbs — only in dark */}
      {dark && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
      <NotificationStack />
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────────────────
export const PageHeader = ({ title, sub, actions }: {
  title: string; sub?: string; actions?: React.ReactNode
}) => (
  <div className="flex items-start justify-between mb-6 gap-4">
    <div>
      <h1 className="font-display font-bold text-2xl t-text-primary">{title}</h1>
      {sub && <p className="t-text-muted text-sm font-body mt-1">{sub}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
  </div>
)
