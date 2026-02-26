import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { devicesApi, alertsApi } from '../api'
import { useLang, useNotifications } from '../stores'
import { PageHeader } from '../components/layout'
import {
  Card, Button, Select, Toggle, SeverityBadge, EmptyState, Spinner,
  Table, Thead, Th, Tbody, Tr, Td,
} from '../components/ui'
import type { Alert, Device, AlertType, Severity } from '../types'
import { format } from 'date-fns'

export default function AlertsPage() {
  const { t } = useLang()
  const { push } = useNotifications()
  const navigate = useNavigate()

  const [devices, setDevices] = useState<Device[]>([])
  const [allAlerts, setAllAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [acking, setAcking] = useState<string | null>(null)

  const [filterDevice, setFilterDevice] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterType, setFilterType] = useState('')
  const [onlyUnacked, setOnlyUnacked] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const devs = await devicesApi.list()
      setDevices(devs)

      const promises = devs.map(d =>
        alertsApi.list(d.id, {
          severity: filterSeverity as Severity || undefined,
          type: filterType as AlertType || undefined,
          unacked: onlyUnacked || undefined,
          limit: 200,
        }).then(alerts => alerts.map(a => ({ ...a, _deviceName: d.name }))).catch(() => [])
      )
      const nested = await Promise.all(promises)
      const flat = nested.flat().sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setAllAlerts(flat)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterSeverity, filterType, onlyUnacked])

  const handleAck = async (alertId: string) => {
    setAcking(alertId)
    try {
      await alertsApi.ack(alertId)
      push({ type: 'success', message: t('ackSuccess') })
      load()
    } catch { push({ type: 'error', message: t('error') }) }
    finally { setAcking(null) }
  }

  const filtered = allAlerts.filter(a =>
    !filterDevice || a.deviceId === filterDevice
  )

  const devName = (id: string) => devices.find(d => d.id === id)?.name ?? id.slice(0, 8)

  const typeColors: Record<string, string> = {
    SURFACE_CHANGED: 'bg-orange-500/15 text-orange-300',
    LOG_CORRELATION: 'bg-blue-500/15 text-blue-300',
    AUDIT_CRITICAL:  'bg-red-500/15 text-red-300',
    DEVICE_OFFLINE:  'bg-slate-500/15 t-text-secondary',
  }

  const unacked = filtered.filter(a => !a.acknowledgedAt).length
  const critical = filtered.filter(a => a.severity === 'CRITICAL').length

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={t('alerts')}
        sub={`${filtered.length} ${t('totalAlerts')} • ${unacked} ${t('unackedAlerts')}`}
        actions={
          <Button variant="outline" onClick={load} icon={<span>↺</span>}>{t('refresh')}</Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('totalAlerts'), value: filtered.length, color: 't-text-primary' },
          { label: t('unackedAlerts'), value: unacked, color: 'text-orange-400' },
          { label: t('CRITICAL'), value: critical, color: 'text-red-400' },
          { label: t('acknowledged'), value: filtered.length - unacked, color: 'text-green-400' },
        ].map(s => (
          <Card key={s.label}>
            <div className="px-4 py-3 flex items-center gap-3">
              <span className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</span>
              <span className="t-text-muted text-xs font-body">{s.label}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filterDevice} onChange={e => setFilterDevice(e.target.value)} className="w-48">
          <option value="">{t('all')} {t('devices')}</option>
          {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <Select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="w-36">
          <option value="">{t('severity')}: {t('all')}</option>
          {['CRITICAL','HIGH','MEDIUM','LOW','INFO'].map(s => (
            <option key={s} value={s}>{t(s as any)}</option>
          ))}
        </Select>
        <Select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-48">
          <option value="">{t('alertType')}: {t('all')}</option>
          {['SURFACE_CHANGED','LOG_CORRELATION','AUDIT_CRITICAL','DEVICE_OFFLINE'].map(s => (
            <option key={s} value={s}>{t(s as any)}</option>
          ))}
        </Select>
        <Toggle checked={onlyUnacked} onChange={setOnlyUnacked} label={t('unacknowledged')} />
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔔" message={t('noAlerts')} />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>{t('severity')}</Th>
                <Th>{t('alertType')}</Th>
                <Th>{t('devices')}</Th>
                <Th>{t('message')}</Th>
                <Th>{t('time')}</Th>
                <Th>{t('status')}</Th>
              </tr>
            </Thead>
            <Tbody>
              {filtered.map(alert => (
                <Tr key={alert.id} className={!alert.acknowledgedAt ? 'bg-orange-500/3' : ''}>
                  <Td><SeverityBadge severity={alert.severity} label={t(alert.severity)} /></Td>
                  <Td>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${typeColors[alert.type] ?? 'border t-border bg-transparent t-text-muted'}`}>
                      {t(alert.type as any)}
                    </span>
                  </Td>
                  <Td>
                    <button
                      onClick={() => navigate(`/devices/${alert.deviceId}`)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-mono transition-colors"
                    >
                      {devName(alert.deviceId)}
                    </button>
                  </Td>
                  <Td>
                    <div className="max-w-xs">
                      <p className="text-sm t-text-primary font-body">{alert.title}</p>
                      <p className="text-xs t-text-muted truncate">{alert.message}</p>
                    </div>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs t-text-muted">
                      {format(new Date(alert.createdAt), 'dd.MM.yyyy HH:mm')}
                    </span>
                  </Td>
                  <Td>
                    {alert.acknowledgedAt ? (
                      <div className="flex items-center gap-1 text-green-400 text-xs font-mono">
                        <span>✓</span>
                        <span>{format(new Date(alert.acknowledgedAt), 'HH:mm')}</span>
                      </div>
                    ) : (
                      <Button
                        size="sm" variant="outline"
                        onClick={() => handleAck(alert.id)}
                        loading={acking === alert.id}
                      >
                        {t('acknowledge')}
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
