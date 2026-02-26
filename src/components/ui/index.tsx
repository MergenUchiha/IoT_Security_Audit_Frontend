import React from 'react'
import clsx from 'clsx'
import type { Severity, AuditStatus, LogLevel } from '../../types'

// ─── Severity Badge ──────────────────────────────────────────────────────────
const severityColors: Record<Severity, string> = {
  INFO:     'bg-blue-500/20 text-blue-400 border border-blue-500/40',
  LOW:      'bg-green-500/20 text-green-400 border border-green-500/40',
  MEDIUM:   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  HIGH:     'bg-orange-500/20 text-orange-400 border border-orange-500/40',
  CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/40',
}
const severityDots: Record<Severity, string> = {
  INFO:     'bg-blue-400',
  LOW:      'bg-green-400',
  MEDIUM:   'bg-yellow-400',
  HIGH:     'bg-orange-400',
  CRITICAL: 'bg-red-400 animate-pulse',
}

export const SeverityBadge = ({ severity, label }: { severity: Severity; label?: string }) => (
  <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold', severityColors[severity])}>
    <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', severityDots[severity])} />
    {label ?? severity}
  </span>
)

const statusColors: Record<AuditStatus, string> = {
  PENDING: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  RUNNING: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  SUCCESS: 'bg-green-500/20 text-green-400 border border-green-500/30',
  FAILED:  'bg-red-500/20 text-red-400 border border-red-500/30',
}

export const StatusBadge = ({ status, label }: { status: AuditStatus; label?: string }) => (
  <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold', statusColors[status])}>
    {status === 'RUNNING' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
    {label ?? status}
  </span>
)

const levelColors: Record<LogLevel, string> = {
  TRACE: 'text-slate-500',
  DEBUG: 'text-blue-500',
  INFO:  'text-green-500',
  WARN:  'text-yellow-500',
  ERROR: 'text-red-500',
  FATAL: 'text-red-600 font-bold',
}

export const LevelTag = ({ level }: { level: LogLevel }) => (
  <span className={clsx('font-mono text-xs font-semibold uppercase tracking-wider w-12 inline-block flex-shrink-0', levelColors[level])}>
    {level}
  </span>
)

// ─── Button ──────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, BtnProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center gap-2 font-body font-semibold rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none'
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }

    const variants: Record<string, string> = {
      primary:   'bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-[0_0_12px_rgba(0,217,255,0.25)] hover:shadow-[0_0_20px_rgba(0,217,255,0.45)]',
      secondary: 'bg-slate-600/40 hover:bg-slate-600/60 text-white border border-slate-600/60',
      danger:    'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/40',
      ghost:     'hover:bg-slate-500/15 t-text-secondary hover:t-text-primary',
      outline:   't-border border t-text-secondary hover:border-cyan-500/60 hover:text-cyan-400',
    }

    // Light mode adjustments for some variants
    const lightFix: Record<string, string> = {
      ghost:   '',
      outline: '',
      secondary: '',
    }

    return (
      <button ref={ref} className={clsx(base, variants[variant], lightFix[variant] ?? '', sizes[size], className)} disabled={disabled || loading} {...props}>
        {loading ? <Spinner size="sm" /> : icon}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ─── Card ────────────────────────────────────────────────────────────────────
export const Card = ({ children, className, glow }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <div className={clsx('rounded-xl t-card border backdrop-blur-sm', glow && 'border-cyan-500/30 shadow-[0_0_20px_rgba(0,217,255,0.07)]', className)}>
    {children}
  </div>
)

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx('px-5 py-4 border-b t-border flex items-center justify-between', className)}>
    {children}
  </div>
)

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={clsx('font-display font-semibold t-text-primary text-base', className)}>{children}</h3>
)

export const CardBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx('p-5', className)}>{children}</div>
)

// ─── Stat Card ───────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, icon, accentClass }: {
  label: string; value: string | number; sub?: string;
  icon?: React.ReactNode; accentClass?: string
}) => (
  <Card className="relative overflow-hidden">
    <CardBody className="flex items-center gap-4">
      {icon && (
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-cyan-500/10', accentClass)}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="t-text-muted text-xs font-body font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-display font-bold t-text-primary">{value}</p>
        {sub && <p className="t-text-muted text-xs font-mono mt-0.5">{sub}</p>}
      </div>
    </CardBody>
  </Card>
)

// ─── Input ───────────────────────────────────────────────────────────────────
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-body font-semibold t-text-muted uppercase tracking-wider block">{label}</label>}
      <input
        ref={ref}
        className={clsx('w-full px-3 py-2.5 rounded-lg border font-mono text-sm t-input transition-all', error && 'border-red-500', className)}
        {...props}
      />
      {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Select ──────────────────────────────────────────────────────────────────
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }>(
  ({ label, className, children, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-body font-semibold t-text-muted uppercase tracking-wider block">{label}</label>}
      <select
        ref={ref}
        className={clsx('w-full px-3 py-2.5 rounded-lg border font-mono text-sm t-input transition-all appearance-none cursor-pointer', className)}
        {...props}
      >
        {children}
      </select>
    </div>
  )
)
Select.displayName = 'Select'

// ─── Textarea ────────────────────────────────────────────────────────────────
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  ({ label, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-body font-semibold t-text-muted uppercase tracking-wider block">{label}</label>}
      <textarea
        ref={ref}
        className={clsx('w-full px-3 py-2.5 rounded-lg border font-mono text-sm t-input transition-all resize-none', className)}
        {...props}
      />
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─── Toggle ──────────────────────────────────────────────────────────────────
export const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) => (
  <label className="flex items-center gap-2.5 cursor-pointer select-none">
    <div
      onClick={() => onChange(!checked)}
      className={clsx('relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0', checked ? 'bg-cyan-500' : 'bg-slate-500/40 border border-slate-500/50')}
    >
      <div className={clsx('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </div>
    {label && <span className="text-sm font-body t-text-secondary">{label}</span>}
  </label>
)

// ─── Spinner ─────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const s = { sm: 'w-4 h-4 border-[2px]', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-2' }[size]
  return <div className={clsx('animate-spin rounded-full border-slate-600 border-t-cyan-400', s)} />
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode; wide?: boolean
}) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative z-10 rounded-xl t-card border w-full shadow-2xl animate-slide-in', wide ? 'max-w-3xl' : 'max-w-lg')}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b t-border">
            <h2 className="font-display font-bold t-text-primary text-lg">{title}</h2>
            <button onClick={onClose} className="t-text-muted hover:t-text-primary transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-slate-500/10">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, message }: { icon?: string; message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 t-text-muted">
    <span className="text-5xl mb-4 opacity-60">{icon ?? '📭'}</span>
    <p className="font-body text-sm">{message}</p>
  </div>
)

// ─── Table ───────────────────────────────────────────────────────────────────
export const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx('overflow-x-auto', className)}>
    <table className="w-full text-sm">{children}</table>
  </div>
)

export const Thead = ({ children }: { children: React.ReactNode }) => (
  <thead className="border-b t-border">{children}</thead>
)

export const Th = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <th className={clsx('px-4 py-3 text-left text-xs font-body font-semibold t-text-muted uppercase tracking-wider', className)}>
    {children}
  </th>
)

export const Tbody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="t-divide">{children}</tbody>
)

export const Tr = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <tr
    onClick={onClick}
    className={clsx('transition-colors duration-100 t-table-row', onClick && 'cursor-pointer', className)}
  >
    {children}
  </tr>
)

export const Td = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <td className={clsx('px-4 py-3 t-text-secondary font-body', className)}>{children}</td>
)

// ─── Confirm Modal ────────────────────────────────────────────────────────────
export const ConfirmModal = ({ open, onClose, onConfirm, message, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; message: string; loading?: boolean
}) => (
  <Modal open={open} onClose={onClose} title="Подтверждение">
    <p className="t-text-secondary font-body mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <Button variant="ghost" onClick={onClose}>Отмена</Button>
      <Button variant="danger" onClick={onConfirm} loading={loading}>Удалить</Button>
    </div>
  </Modal>
)
