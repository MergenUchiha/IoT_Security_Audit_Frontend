import axios from 'axios'
import type {
  Device, LogEntry, AuditRun, Alert, CorrelationRule,
  DeviceSummary, CreateDeviceDto, UpdateDeviceDto,
  RunAuditDto, CreateRuleDto,
} from '../types'

const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Devices ────────────────────────────────────────────────────────────────
export const devicesApi = {
  list: () => http.get<Device[]>('/devices').then(r => r.data),
  get: (id: string) => http.get<Device>(`/devices/${id}`).then(r => r.data),
  create: (dto: CreateDeviceDto) => http.post<Device>('/devices', dto).then(r => r.data),
  update: (id: string, dto: UpdateDeviceDto) => http.patch<Device>(`/devices/${id}`, dto).then(r => r.data),
  remove: (id: string) => http.delete(`/devices/${id}`).then(r => r.data),
}

// ─── Logs ────────────────────────────────────────────────────────────────────
export const logsApi = {
  list: (deviceId: string, params?: { limit?: number; level?: string; from?: string; to?: string }) =>
    http.get<LogEntry[]>(`/devices/${deviceId}/logs`, { params }).then(r => r.data),

  ingest: (deviceId: string, dto: {
    message: string
    level?: string
    source?: string
    app?: string
    host?: string
    ts?: string
    raw?: Record<string, unknown>
  }) => http.post(`/ingest/${deviceId}/logs`, dto).then(r => r.data),
}

// ─── Audit ───────────────────────────────────────────────────────────────────
export const auditApi = {
  run: (deviceId: string, dto: RunAuditDto) =>
    http.post<{ auditRun: AuditRun; summary: unknown }>(`/devices/${deviceId}/audits/run`, dto).then(r => r.data),
  list: (deviceId: string) =>
    http.get<AuditRun[]>(`/devices/${deviceId}/audits`).then(r => r.data),
  get: (auditRunId: string) =>
    http.get<AuditRun>(`/audits/${auditRunId}`).then(r => r.data),
}

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const alertsApi = {
  list: (deviceId: string, params?: { type?: string; severity?: string; unacked?: boolean; limit?: number }) =>
    http.get<Alert[]>(`/devices/${deviceId}/alerts`, { params }).then(r => r.data),
  ack: (alertId: string, note?: string) =>
    http.patch<Alert>(`/alerts/${alertId}/ack`, { note }).then(r => r.data),
}

// ─── Rules ───────────────────────────────────────────────────────────────────
export const rulesApi = {
  list: () => http.get<CorrelationRule[]>('/rules').then(r => r.data),
  get: (id: string) => http.get<CorrelationRule>(`/rules/${id}`).then(r => r.data),
  create: (dto: CreateRuleDto) => http.post<CorrelationRule>('/rules', dto).then(r => r.data),
  update: (id: string, dto: Partial<CreateRuleDto>) =>
    http.patch<CorrelationRule>(`/rules/${id}`, dto).then(r => r.data),
  remove: (id: string) => http.delete(`/rules/${id}`).then(r => r.data),
}

// ─── Summary ─────────────────────────────────────────────────────────────────
export const summaryApi = {
  get: (deviceId: string) => http.get<DeviceSummary>(`/devices/${deviceId}/summary`).then(r => r.data),
}

// ─── SSE Stream ──────────────────────────────────────────────────────────────
export const createLogStream = (deviceId: string, onLog: (log: LogEntry) => void) => {
  const es = new EventSource(`/api/devices/${deviceId}/logs/stream`)
  es.addEventListener('log', (e) => {
    try { onLog(JSON.parse(e.data)) } catch { /* skip */ }
  })
  return () => es.close()
}

export default http
