import React, { useEffect, useState } from 'react'
import { rulesApi, devicesApi } from '../api'
import { useLang, useNotifications } from '../stores'
import { PageHeader } from '../components/layout'
import {
  Card, Button, Input, Select, Toggle, SeverityBadge, Modal, ConfirmModal,
  EmptyState, Spinner, Table, Thead, Th, Tbody, Tr, Td, CardBody,
} from '../components/ui'
import type { CorrelationRule, CreateRuleDto, Device, DeviceType, Severity } from '../types'
import { format } from 'date-fns'

const SEVERITIES: Severity[] = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const DEVICE_TYPES: DeviceType[] = ['ROUTER', 'CAMERA', 'IOT', 'SERVER', 'UNKNOWN']

function RuleForm({
  initial, devices, onSave, onCancel, loading
}: {
  initial?: Partial<CorrelationRule>
  devices: Device[]
  onSave: (dto: CreateRuleDto) => void
  onCancel: () => void
  loading: boolean
}) {
  const { t } = useLang()
  const [form, setForm] = useState<CreateRuleDto>({
    name: initial?.name ?? '',
    matchRegex: initial?.matchRegex ?? '',
    windowSec: initial?.windowSec ?? 60,
    threshold: initial?.threshold ?? 10,
    severity: initial?.severity ?? 'MEDIUM',
    deviceTypeFilter: initial?.deviceTypeFilter ?? undefined,
    deviceIdFilter: initial?.deviceIdFilter ?? undefined,
    enabled: initial?.enabled ?? true,
  })
  const [regexError, setRegexError] = useState('')

  const set = (k: keyof CreateRuleDto, v: unknown) => setForm(f => ({ ...f, [k]: v || undefined }))

  const validateAndSave = () => {
    try {
      new RegExp(form.matchRegex)
      setRegexError('')
      onSave(form)
    } catch (e: any) {
      setRegexError('Invalid regex: ' + e.message)
    }
  }

  return (
    <div className="space-y-4">
      <Input label={t('name')} value={form.name} onChange={e => set('name', e.target.value)} required />
      <Input
        label={t('matchRegex')}
        value={form.matchRegex}
        onChange={e => set('matchRegex', e.target.value)}
        placeholder="Failed password|invalid user"
        error={regexError}
        className="font-mono"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={`${t('windowSec')} (сек)`}
          type="number"
          value={form.windowSec}
          onChange={e => set('windowSec', Number(e.target.value))}
          min={1}
        />
        <Input
          label={t('threshold')}
          type="number"
          value={form.threshold}
          onChange={e => set('threshold', Number(e.target.value))}
          min={1}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label={t('severity')} value={form.severity} onChange={e => set('severity', e.target.value)}>
          {SEVERITIES.map(s => <option key={s} value={s}>{t(s)}</option>)}
        </Select>
        <Select label={t('deviceType')} value={form.deviceTypeFilter ?? ''} onChange={e => set('deviceTypeFilter', e.target.value)}>
          <option value="">{t('all')}</option>
          {DEVICE_TYPES.map(dt => <option key={dt} value={dt}>{t(dt)}</option>)}
        </Select>
      </div>
      <Select label={`${t('deviceFilter')} (ID)`} value={form.deviceIdFilter ?? ''} onChange={e => set('deviceIdFilter', e.target.value)}>
        <option value="">{t('all')}</option>
        {devices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.ip ?? d.hostname ?? '?'})</option>)}
      </Select>
      <Toggle checked={form.enabled ?? true} onChange={v => set('enabled', v)} label={t('enabled')} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>{t('cancel')}</Button>
        <Button onClick={validateAndSave} loading={loading} disabled={!form.name || !form.matchRegex}>
          {t('save')}
        </Button>
      </div>
    </div>
  )
}

export default function RulesPage() {
  const { t } = useLang()
  const { push } = useNotifications()
  const [rules, setRules] = useState<CorrelationRule[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<CorrelationRule | null>(null)
  const [deleting, setDeleting] = useState<CorrelationRule | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [r, d] = await Promise.all([rulesApi.list(), devicesApi.list()])
      setRules(r)
      setDevices(d)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (dto: CreateRuleDto) => {
    setSaving(true)
    try {
      await rulesApi.create(dto)
      push({ type: 'success', message: t('success') })
      setShowAdd(false)
      load()
    } catch { push({ type: 'error', message: t('error') }) }
    finally { setSaving(false) }
  }

  const handleUpdate = async (dto: CreateRuleDto) => {
    if (!editing) return
    setSaving(true)
    try {
      await rulesApi.update(editing.id, dto)
      push({ type: 'success', message: t('success') })
      setEditing(null)
      load()
    } catch { push({ type: 'error', message: t('error') }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSaving(true)
    try {
      await rulesApi.remove(deleting.id)
      push({ type: 'success', message: t('success') })
      setDeleting(null)
      load()
    } catch { push({ type: 'error', message: t('error') }) }
    finally { setSaving(false) }
  }

  const handleToggle = async (rule: CorrelationRule) => {
    try {
      await rulesApi.update(rule.id, { enabled: !rule.enabled })
      load()
    } catch { push({ type: 'error', message: t('error') }) }
  }

  const devName = (id: string) => devices.find(d => d.id === id)?.name

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={t('rules')}
        sub={`${rules.length} ${t('rules')} • ${rules.filter(r => r.enabled).length} ${t('enabled')}`}
        actions={
          <Button onClick={() => setShowAdd(true)} icon={<span>+</span>}>{t('addRule')}</Button>
        }
      />

      {/* Info card */}
      <Card>
        <CardBody className="flex items-start gap-4">
          <span className="text-2xl">⌬</span>
          <div>
            <p className="t-text-primary font-body font-medium text-sm">
              {t('rules')}
            </p>
            <p className="t-text-muted text-xs font-body mt-1">
              Правила корреляции позволяют автоматически создавать алерты, когда регулярное выражение совпадает
              с сообщением лога определённое количество раз в заданный временной интервал.
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        {loading ? (
          <CardBody className="flex justify-center py-16"><Spinner size="lg" /></CardBody>
        ) : rules.length === 0 ? (
          <EmptyState icon="⌬" message={t('noRules')} />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>{t('enabled')}</Th>
                <Th>{t('name')}</Th>
                <Th>{t('matchRegex')}</Th>
                <Th>{t('windowSec')} / {t('threshold')}</Th>
                <Th>{t('severity')}</Th>
                <Th>{t('deviceFilter')}</Th>
                <Th>{t('createdAt')}</Th>
                <Th>{t('actions')}</Th>
              </tr>
            </Thead>
            <Tbody>
              {rules.map(r => (
                <Tr key={r.id}>
                  <Td>
                    <Toggle checked={r.enabled} onChange={() => handleToggle(r)} />
                  </Td>
                  <Td>
                    <span className="font-body font-medium t-text-primary">{r.name}</span>
                  </Td>
                  <Td>
                    <code className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded max-w-[200px] truncate block">
                      {r.matchRegex}
                    </code>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs t-text-secondary">
                      {r.windowSec}s / ×{r.threshold}
                    </span>
                  </Td>
                  <Td><SeverityBadge severity={r.severity} label={t(r.severity)} /></Td>
                  <Td>
                    <span className="text-xs font-mono t-text-muted">
                      {r.deviceIdFilter ? devName(r.deviceIdFilter) ?? r.deviceIdFilter.slice(0, 8) :
                       r.deviceTypeFilter ? t(r.deviceTypeFilter) :
                       t('all')}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs t-text-muted">
                      {format(new Date(r.createdAt), 'dd.MM.yyyy')}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>✎</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(r)}>✕</Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t('addRule')}>
        <RuleForm devices={devices} onSave={handleAdd} onCancel={() => setShowAdd(false)} loading={saving} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={t('editRule')}>
        {editing && (
          <RuleForm initial={editing} devices={devices} onSave={handleUpdate} onCancel={() => setEditing(null)} loading={saving} />
        )}
      </Modal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        message={`${t('confirmDeleteRule')}: "${deleting?.name}"?`}
        loading={saving}
      />
    </div>
  )
}
