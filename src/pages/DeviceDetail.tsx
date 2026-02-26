import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { summaryApi, logsApi, auditApi, alertsApi, createLogStream } from '../api'
import { useLang, useNotifications } from '../stores'
import { PageHeader } from '../components/layout'
import {
  Card, CardHeader, CardTitle, CardBody, Button, Input, Select, Toggle,
  SeverityBadge, StatusBadge, LevelTag, EmptyState, Spinner, Modal,
  Table, Thead, Th, Tbody, Tr, Td,
} from '../components/ui'
import type { DeviceSummary, LogEntry, AuditRun, Alert, RunAuditDto } from '../types'
import { format } from 'date-fns'

type Tab = 'summary' | 'audit' | 'logs' | 'alerts'

function SummaryTab({ summary }: { summary: DeviceSummary }) {
  const { t } = useLang()
  const f = summary.lastAudit?.summary?.findings

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('totalAlerts'), value: summary.alerts.total, color: 'text-orange-400' },
          { label: t('unackedAlerts'), value: summary.alerts.unacked, color: 'text-red-400' },
          { label: 'Critical', value: f?.critical ?? '—', color: 'text-red-400' },
          { label: 'High', value: f?.high ?? '—', color: 'text-orange-400' },
        ].map(s => (
          <Card key={s.label}>
            <CardBody className="text-center py-4">
              <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs t-text-muted font-body mt-1">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>{t('deviceDetails')}</CardTitle></CardHeader>
        <CardBody>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              [t('name'), summary.device.name],
              [t('ip'), summary.device.ip ?? '—'],
              [t('hostname'), summary.device.hostname ?? '—'],
              [t('deviceType'), t(summary.device.type as any)],
              [t('status'), summary.device.isActive ? t('active') : t('inactive')],
              [t('lastSeen'), summary.lastSeen ? format(new Date(summary.lastSeen), 'dd.MM.yyyy HH:mm') : '—'],
              [t('lastLog'), summary.lastLog ? `${summary.lastLog.level} @ ${format(new Date(summary.lastLog.ts), 'HH:mm')}` : '—'],
              [t('lastAudit'), summary.lastAudit ? t(summary.lastAudit.status) : '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="t-text-muted text-xs font-body uppercase tracking-wider">{k}</dt>
                <dd className="t-text-primary font-mono text-sm mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>
    </div>
  )
}

function AuditTab({ deviceId }: { deviceId: string }) {
  const { t } = useLang()
  const { push } = useNotifications()
  const [audits, setAudits] = useState<AuditRun[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [showRun, setShowRun] = useState(false)
  const [selected, setSelected] = useState<AuditRun | null>(null)
  const [dto, setDto] = useState<RunAuditDto>({ nmap: true, nuclei: false })

  const load = async () => {
    setLoading(true)
    try { setAudits(await auditApi.list(deviceId)) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [deviceId])

  const handleRun = async () => {
    setRunning(true)
    push({ type: 'info', message: t('auditRunning') })
    try {
      await auditApi.run(deviceId, dto)
      push({ type: 'success', message: t('auditSuccess') })
      setShowRun(false)
      load()
    } catch {
      push({ type: 'error', message: t('auditFailed') })
    } finally { setRunning(false) }
  }

  const handleViewDetails = async (run: AuditRun) => {
    const detail = await auditApi.get(run.id).catch(() => null)
    setSelected(detail ?? run)
  }

  const sevColors: Record<string, string> = {
    CRITICAL: 'text-red-400', HIGH: 'text-orange-400', MEDIUM: 'text-yellow-400', LOW: 'text-green-400', INFO: 'text-blue-400'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowRun(true)} icon={<span>▶</span>}>{t('runAudit')}</Button>
      </div>

      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : (
        <Card>
          {audits.length === 0 ? <EmptyState icon="🔍" message={t('noAudits')} /> : (
            <Table>
              <Thead>
                <tr>
                  <Th>{t('status')}</Th>
                  <Th>{t('createdAt')}</Th>
                  <Th>{t('findings')}</Th>
                  <Th>{t('details')}</Th>
                </tr>
              </Thead>
              <Tbody>
                {audits.map(a => (
                  <Tr key={a.id}>
                    <Td><StatusBadge status={a.status} label={t(a.status)} /></Td>
                    <Td><span className="font-mono text-xs">{format(new Date(a.createdAt), 'dd.MM.yyyy HH:mm')}</span></Td>
                    <Td>
                      {a.summary?.findings ? (
                        <div className="flex gap-2 flex-wrap">
                          {a.summary.findings.critical > 0 && <span className="text-xs font-mono text-red-400">C:{a.summary.findings.critical}</span>}
                          {a.summary.findings.high > 0 && <span className="text-xs font-mono text-orange-400">H:{a.summary.findings.high}</span>}
                          {a.summary.findings.medium > 0 && <span className="text-xs font-mono text-yellow-400">M:{a.summary.findings.medium}</span>}
                          <span className="text-xs font-mono t-text-muted">Σ:{a.summary.findings.total}</span>
                        </div>
                      ) : '—'}
                    </Td>
                    <Td>
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(a)}>{t('details')}</Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      )}

      {/* Run audit modal */}
      <Modal open={showRun} onClose={() => setShowRun(false)} title={t('runAudit')}>
        <div className="space-y-4">
          <div className="space-y-3">
            <Toggle checked={dto.nmap ?? true} onChange={v => setDto(d => ({ ...d, nmap: v }))} label={t('nmapScan')} />
            <Toggle checked={dto.nuclei ?? false} onChange={v => setDto(d => ({ ...d, nuclei: v }))} label={t('nucleiScan')} />
            {dto.nuclei && (
              <Input
                label={t('targetUrl')}
                value={dto.nucleiTargetUrl ?? ''}
                onChange={e => setDto(d => ({ ...d, nucleiTargetUrl: e.target.value }))}
                placeholder="https://192.168.1.1"
              />
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowRun(false)}>{t('cancel')}</Button>
            <Button onClick={handleRun} loading={running}>{t('run')}</Button>
          </div>
        </div>
      </Modal>

      {/* Findings detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={t('findings')} wide>
        {selected?.findings && selected.findings.length > 0 ? (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {selected.findings.map(f => (
              <div key={f.id} className="border t-border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={f.severity} label={t(f.severity)} />
                  <span className="t-text-primary font-body font-medium text-sm">{f.title}</span>
                  {f.port && (
                    <span className="ml-auto font-mono text-xs text-cyan-300">{f.port}/{f.protocol}</span>
                  )}
                </div>
                {f.description && <p className="t-text-muted text-xs font-body">{f.description}</p>}
                {f.remediation && (
                  <p className="text-green-400 text-xs font-mono border-l-2 border-green-500/40 pl-2">{f.remediation}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="✓" message={t('noFindings')} />
        )}
      </Modal>
    </div>
  )
}

function LogsTab({ deviceId }: { deviceId: string }) {
  const { t } = useLang()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [streamLogs, setStreamLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [streaming, setStreaming] = useState(false)
  const [levelFilter, setLevelFilter] = useState('')
  const stopRef = useRef<(() => void) | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await logsApi.list(deviceId, { limit: 100, level: levelFilter || undefined })
      setLogs(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadHistory() }, [deviceId, levelFilter])

  const startStream = () => {
    setStreamLogs([])
    setStreaming(true)
    stopRef.current = createLogStream(deviceId, (log) => {
      setStreamLogs(prev => [...prev.slice(-199), log])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    })
  }

  const stopStream = () => {
    stopRef.current?.()
    stopRef.current = null
    setStreaming(false)
  }

  useEffect(() => () => stopRef.current?.(), [])

  const displayLogs = streaming ? streamLogs : logs
  const levelColors: Record<string, string> = {
    TRACE: 't-text-muted', DEBUG: 'text-blue-400', INFO: 'text-green-400',
    WARN: 'text-yellow-400', ERROR: 'text-red-400', FATAL: 'text-red-500',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="w-36">
          <option value="">{t('all')}</option>
          {['TRACE','DEBUG','INFO','WARN','ERROR','FATAL'].map(l => (
            <option key={l} value={l}>{t(l as any)}</option>
          ))}
        </Select>
        <Button variant="outline" onClick={loadHistory} disabled={streaming}>{t('refresh')}</Button>
        {!streaming ? (
          <Button onClick={startStream} icon={<span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />}>
            {t('realtime')}
          </Button>
        ) : (
          <Button variant="danger" onClick={stopStream}>{t('disconnected')} ✕</Button>
        )}
        {streaming && (
          <span className="flex items-center gap-1.5 text-xs font-mono text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {t('connected')}
          </span>
        )}
        <Button variant="ghost" onClick={() => streaming ? setStreamLogs([]) : setLogs([])}>{t('clearLogs')}</Button>
      </div>

      <Card>
        {loading && !streaming ? (
          <CardBody className="flex justify-center py-8"><Spinner /></CardBody>
        ) : displayLogs.length === 0 ? (
          <EmptyState icon="📋" message={streaming ? t('connecting') : t('noLogs')} />
        ) : (
          <div className="font-mono text-xs t-divide max-h-[480px] overflow-y-auto">
            {displayLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 px-4 py-2 t-hover transition-colors">
                <span className="text-slate-600 flex-shrink-0 w-36 truncate">
                  {format(new Date(log.ts), 'MM-dd HH:mm:ss.SSS')}
                </span>
                <LevelTag level={log.level} />
                <span className="t-text-muted flex-shrink-0 w-20 truncate">{log.app ?? log.source}</span>
                <span className={`flex-1 break-all ${levelColors[log.level] ?? 't-text-secondary'}`}>
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </Card>
    </div>
  )
}

function AlertsTab({ deviceId }: { deviceId: string }) {
  const { t } = useLang()
  const { push } = useNotifications()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [onlyUnacked, setOnlyUnacked] = useState(false)
  const [acking, setAcking] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setAlerts(await alertsApi.list(deviceId, { unacked: onlyUnacked || undefined, limit: 100 }))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [deviceId, onlyUnacked])

  const ack = async (id: string) => {
    setAcking(id)
    try {
      await alertsApi.ack(id)
      push({ type: 'success', message: t('ackSuccess') })
      load()
    } catch { push({ type: 'error', message: t('error') }) }
    finally { setAcking(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Toggle checked={onlyUnacked} onChange={setOnlyUnacked} label={t('unacknowledged')} />
        <Button variant="outline" onClick={load} icon={<span>↺</span>}>{t('refresh')}</Button>
      </div>
      <Card>
        {loading ? <CardBody className="flex justify-center py-8"><Spinner /></CardBody> : (
          alerts.length === 0 ? <EmptyState icon="🔔" message={t('noAlerts')} /> : (
            <Table>
              <Thead>
                <tr>
                  <Th>{t('severity')}</Th>
                  <Th>{t('alertType')}</Th>
                  <Th>{t('message')}</Th>
                  <Th>{t('time')}</Th>
                  <Th>{t('status')}</Th>
                </tr>
              </Thead>
              <Tbody>
                {alerts.map(a => (
                  <Tr key={a.id}>
                    <Td><SeverityBadge severity={a.severity} label={t(a.severity)} /></Td>
                    <Td><span className="text-xs font-mono t-text-muted">{t(a.type as any)}</span></Td>
                    <Td>
                      <div>
                        <p className="text-sm t-text-primary">{a.title}</p>
                        <p className="text-xs t-text-muted truncate max-w-xs">{a.message}</p>
                      </div>
                    </Td>
                    <Td><span className="font-mono text-xs">{format(new Date(a.createdAt), 'dd.MM HH:mm')}</span></Td>
                    <Td>
                      {a.acknowledgedAt ? (
                        <span className="text-xs font-mono text-green-400">✓ {t('acknowledged')}</span>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => ack(a.id)} loading={acking === a.id}>
                          {t('acknowledge')}
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )
        )}
      </Card>
    </div>
  )
}

export default function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useLang()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<DeviceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('summary')

  useEffect(() => {
    if (!id) return
    summaryApi.get(id).then(setSummary).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!summary) return <div className="text-red-400 text-center py-16">{t('error')}</div>

  const tabs: { key: Tab; label: string }[] = [
    { key: 'summary', label: t('dashboard') },
    { key: 'audit', label: t('audit') },
    { key: 'logs', label: t('logs') },
    { key: 'alerts', label: t('alerts') },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={summary.device.name}
        sub={summary.device.ip ?? summary.device.hostname ?? t('unknown')}
        actions={<Button variant="ghost" onClick={() => navigate('/devices')}>← {t('devices')}</Button>}
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b t-border pb-0">
        {tabs.map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-2.5 text-sm font-body font-medium transition-all border-b-2 -mb-px ${
              tab === tb.key
                ? 'text-cyan-300 border-cyan-400'
                : 't-text-muted border-transparent hover:text-slate-200'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'summary' && <SummaryTab summary={summary} />}
        {tab === 'audit' && id && <AuditTab deviceId={id} />}
        {tab === 'logs' && id && <LogsTab deviceId={id} />}
        {tab === 'alerts' && id && <AlertsTab deviceId={id} />}
      </div>
    </div>
  )
}
