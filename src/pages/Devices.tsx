import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { devicesApi } from '../api'
import { useLang, useNotifications } from '../stores'
import { PageHeader } from '../components/layout'
import {
  Card, CardBody, Button, Input, Select, Toggle,
  Modal, ConfirmModal, EmptyState, Spinner,
  Table, Thead, Th, Tbody, Tr, Td,
} from '../components/ui'
import type { Device, CreateDeviceDto, DeviceType, LogSourceType } from '../types'

const DEVICE_TYPES: DeviceType[] = ['ROUTER', 'CAMERA', 'IOT', 'SERVER', 'UNKNOWN']
const LOG_SOURCES: LogSourceType[] = ['SYSLOG', 'MQTT', 'HTTP']

function DeviceForm({
  initial, onSave, onCancel, loading
}: {
  initial?: Partial<Device>
  onSave: (dto: CreateDeviceDto & { isActive?: boolean }) => void
  onCancel: () => void
  loading: boolean
}) {
  const { t } = useLang()
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    ip: initial?.ip ?? '',
    hostname: initial?.hostname ?? '',
    type: (initial?.type ?? 'UNKNOWN') as DeviceType,
    logSourceType: (initial?.logSourceType ?? 'SYSLOG') as LogSourceType,
    isActive: initial?.isActive ?? true,
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-4">
      <Input label={t('name')} value={form.name} onChange={e => set('name', e.target.value)} placeholder="My Router" required />
      <div className="grid grid-cols-2 gap-3">
        <Input label={t('ip')} value={form.ip} onChange={e => set('ip', e.target.value)} placeholder="192.168.1.1" />
        <Input label={t('hostname')} value={form.hostname} onChange={e => set('hostname', e.target.value)} placeholder="router.local" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label={t('deviceType')} value={form.type} onChange={e => set('type', e.target.value)}>
          {DEVICE_TYPES.map(dt => <option key={dt} value={dt}>{t(dt)}</option>)}
        </Select>
        <Select label={t('logSource')} value={form.logSourceType} onChange={e => set('logSourceType', e.target.value)}>
          {LOG_SOURCES.map(ls => <option key={ls} value={ls}>{ls}</option>)}
        </Select>
      </div>
      {initial?.id && (
        <Toggle checked={form.isActive} onChange={v => set('isActive', v)} label={form.isActive ? t('active') : t('inactive')} />
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>{t('cancel')}</Button>
        <Button onClick={() => onSave(form)} loading={loading} disabled={!form.name}>
          {t('save')}
        </Button>
      </div>
    </div>
  )
}

export default function DevicesPage() {
  const { t } = useLang()
  const { push } = useNotifications()
  const navigate = useNavigate()

  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Device | null>(null)
  const [deleting, setDeleting] = useState<Device | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try { setDevices(await devicesApi.list()) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (dto: CreateDeviceDto) => {
    setSaving(true)
    try {
      await devicesApi.create(dto)
      push({ type: 'success', message: t('success') })
      setShowAdd(false)
      load()
    } catch { push({ type: 'error', message: t('error') }) }
    finally { setSaving(false) }
  }

  const handleUpdate = async (dto: CreateDeviceDto & { isActive?: boolean }) => {
    if (!editing) return
    setSaving(true)
    try {
      await devicesApi.update(editing.id, dto)
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
      await devicesApi.remove(deleting.id)
      push({ type: 'success', message: t('success') })
      setDeleting(null)
      load()
    } catch { push({ type: 'error', message: t('error') }) }
    finally { setSaving(false) }
  }

  const filtered = devices.filter(d =>
    !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.ip ?? '').includes(search) ||
    (d.hostname ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const typeIcons: Record<string, string> = {
    ROUTER: '⬡', CAMERA: '◎', IOT: '◉', SERVER: '▣', UNKNOWN: '○',
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={t('devices')}
        sub={`${devices.length} ${t('totalDevices')}`}
        actions={
          <>
            <Input
              placeholder={t('search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-48"
            />
            <Button onClick={() => setShowAdd(true)} icon={<span>+</span>}>
              {t('addDevice')}
            </Button>
          </>
        }
      />

      <Card>
        {loading ? (
          <CardBody className="flex justify-center py-16"><Spinner size="lg" /></CardBody>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📡" message={t('noDevices')} />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>{t('name')}</Th>
                <Th>{t('ip')} / {t('hostname')}</Th>
                <Th>{t('deviceType')}</Th>
                <Th>{t('logSource')}</Th>
                <Th>{t('status')}</Th>
                <Th>{t('createdAt')}</Th>
                <Th>{t('actions')}</Th>
              </tr>
            </Thead>
            <Tbody>
              {filtered.map(d => (
                <Tr key={d.id} onClick={() => navigate(`/devices/${d.id}`)}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-mono">{typeIcons[d.type]}</span>
                      <span className="font-medium t-text-primary">{d.name}</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="font-mono text-xs">
                      {d.ip && <div className="text-cyan-300">{d.ip}</div>}
                      {d.hostname && <div className="t-text-muted">{d.hostname}</div>}
                    </div>
                  </Td>
                  <Td>
                    <span className="text-xs font-mono t-text-muted">{t(d.type as any)}</span>
                  </Td>
                  <Td>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                      d.logSourceType === 'MQTT' ? 'bg-purple-500/20 text-purple-300' :
                      d.logSourceType === 'HTTP' ? 'bg-blue-500/20 text-blue-300' :
                      'border t-border bg-transparent t-text-muted'
                    }`}>{d.logSourceType}</span>
                  </Td>
                  <Td>
                    <span className={`flex items-center gap-1.5 text-xs font-mono ${d.isActive ? 'text-green-400' : 't-text-muted'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${d.isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                      {d.isActive ? t('active') : t('inactive')}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs font-mono t-text-muted">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(d)}>✎</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(d)}>✕</Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t('addDevice')}>
        <DeviceForm onSave={handleAdd} onCancel={() => setShowAdd(false)} loading={saving} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={t('editDevice')}>
        {editing && (
          <DeviceForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} loading={saving} />
        )}
      </Modal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        message={`${t('confirmDelete')}: "${deleting?.name}"?`}
        loading={saving}
      />
    </div>
  )
}
