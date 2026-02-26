import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { devicesApi, alertsApi, summaryApi } from '../api'
import { useLang } from '../stores'
import { PageHeader } from '../components/layout'
import {
  StatCard, Card, CardHeader, CardTitle, CardBody,
  SeverityBadge, StatusBadge, EmptyState, Spinner,
} from '../components/ui'
import type { Device, Alert, DeviceSummary } from '../types'
import { format } from 'date-fns'

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH: '#F97316',
  MEDIUM: '#EAB308',
  LOW: '#22C55E',
  INFO: '#3B82F6',
}

export default function DashboardPage() {
  const { t } = useLang()
  const navigate = useNavigate()

  const [devices, setDevices] = useState<Device[]>([])
  const [summaries, setSummaries] = useState<DeviceSummary[]>([])
  const [allAlerts, setAllAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const devs = await devicesApi.list()
        setDevices(devs)

        const sumPromises = devs.slice(0, 10).map(d => summaryApi.get(d.id).catch(() => null))
        const sums = (await Promise.all(sumPromises)).filter(Boolean) as DeviceSummary[]
        setSummaries(sums)

        const alertPromises = devs.slice(0, 5).map(d => alertsApi.list(d.id, { limit: 10 }).catch(() => []))
        const alerts = (await Promise.all(alertPromises)).flat()
        alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setAllAlerts(alerts.slice(0, 15))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeDevices = devices.filter(d => d.isActive).length
  const totalUnacked = summaries.reduce((s, sum) => s + sum.alerts.unacked, 0)
  const totalAlerts = summaries.reduce((s, sum) => s + sum.alerts.total, 0)

  // Severity distribution for findings
  const findingsBySeverity = summaries.reduce((acc, sum) => {
    const f = sum.lastAudit?.summary?.findings
    if (!f) return acc
    acc.CRITICAL = (acc.CRITICAL || 0) + f.critical
    acc.HIGH = (acc.HIGH || 0) + f.high
    acc.MEDIUM = (acc.MEDIUM || 0) + f.medium
    acc.LOW = (acc.LOW || 0) + f.low
    acc.INFO = (acc.INFO || 0) + f.info
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(findingsBySeverity)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  // Device type distribution
  const typeData = devices.reduce((acc, d) => {
    const k = d.type
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const barData = Object.entries(typeData).map(([type, count]) => ({ type: t(type as any), count }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={t('dashboard')} sub="IoT Security Audit Platform" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('totalDevices')}
          value={devices.length}
          sub={`${activeDevices} ${t('active')}`}
          icon={<span className="text-2xl">◉</span>}
          accent="bg-cyan-500"
        />
        <StatCard
          label={t('totalAlerts')}
          value={totalAlerts}
          sub={`${totalUnacked} ${t('unackedAlerts')}`}
          icon={<span className="text-2xl">◎</span>}
          accent="bg-orange-500"
        />
        <StatCard
          label={t('criticalFindings')}
          value={findingsBySeverity.CRITICAL ?? 0}
          sub="Nmap + Nuclei"
          icon={<span className="text-2xl">⚠</span>}
          accent="bg-red-500"
        />
        <StatCard
          label={t('unackedAlerts')}
          value={totalUnacked}
          sub={totalUnacked > 0 ? '⚡ Требует внимания' : '✓ Всё в порядке'}
          icon={<span className="text-2xl">🔔</span>}
          accent={totalUnacked > 0 ? 'bg-yellow-500' : 'bg-green-500'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Findings pie */}
        <Card glow>
          <CardHeader><CardTitle>{t('securityPosture')}</CardTitle></CardHeader>
          <CardBody>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Legend formatter={(v) => <span className="t-text-secondary text-xs font-mono">{t(v as any)}</span>} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                    itemStyle={{ color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon="🔍" message={t('noFindings')} />
            )}
          </CardBody>
        </Card>

        {/* Device types bar */}
        <Card>
          <CardHeader><CardTitle>{t('deviceOverview')}</CardTitle></CardHeader>
          <CardBody>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                  <XAxis dataKey="type" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                    itemStyle={{ color: '#94a3b8' }}
                    cursor={{ fill: 'rgba(0,217,255,0.05)' }}
                  />
                  <Bar dataKey="count" fill="#00D9FF" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon="📊" message={t('noData')} />
            )}
          </CardBody>
        </Card>

        {/* Devices status mini list */}
        <Card>
          <CardHeader>
            <CardTitle>{t('devices')}</CardTitle>
            <button onClick={() => navigate('/devices')} className="text-xs font-mono text-cyan-400 hover:text-cyan-300">→</button>
          </CardHeader>
          <CardBody className="p-0">
            <div className="t-divide max-h-[248px] overflow-y-auto">
              {summaries.length === 0 && <EmptyState icon="📡" message={t('noDevices')} />}
              {summaries.map(sum => (
                <button
                  key={sum.device.id}
                  onClick={() => navigate(`/devices/${sum.device.id}`)}
                  className="w-full flex items-center gap-3 px-5 py-3 t-hover transition-colors text-left"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sum.device.isActive ? 'bg-green-400' : 'bg-slate-600'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-body font-medium t-text-primary truncate">{sum.device.name}</p>
                    <p className="text-xs font-mono t-text-muted truncate">{sum.device.ip ?? sum.device.hostname ?? '—'}</p>
                  </div>
                  {sum.alerts.unacked > 0 && (
                    <span className="text-xs font-mono bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      {sum.alerts.unacked}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent alerts */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentAlerts')}</CardTitle>
          <button onClick={() => navigate('/alerts')} className="text-xs font-mono text-cyan-400 hover:text-cyan-300">→ {t('all')}</button>
        </CardHeader>
        <CardBody className="p-0">
          {allAlerts.length === 0 ? (
            <EmptyState icon="🔔" message={t('noAlerts')} />
          ) : (
            <div className="t-divide max-h-72 overflow-y-auto">
              {allAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-4 px-5 py-3">
                  <SeverityBadge severity={alert.severity} label={t(alert.severity)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-body t-text-primary truncate">{alert.title}</p>
                    <p className="text-xs font-mono t-text-muted truncate">{alert.message}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-mono t-text-muted">
                      {format(new Date(alert.createdAt), 'dd.MM HH:mm')}
                    </p>
                    {alert.acknowledgedAt ? (
                      <span className="text-xs font-mono text-green-400">✓</span>
                    ) : (
                      <span className="text-xs font-mono text-orange-400">!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
