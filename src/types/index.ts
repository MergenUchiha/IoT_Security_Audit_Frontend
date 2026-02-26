export type DeviceType = 'ROUTER' | 'CAMERA' | 'IOT' | 'SERVER' | 'UNKNOWN'
export type LogSourceType = 'SYSLOG' | 'MQTT' | 'HTTP'
export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
export type AuditStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'
export type AlertType = 'SURFACE_CHANGED' | 'LOG_CORRELATION' | 'AUDIT_CRITICAL' | 'DEVICE_OFFLINE'
export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Device {
  id: string
  name: string
  ip: string | null
  hostname: string | null
  type: DeviceType
  logSourceType: LogSourceType
  logSourceMeta: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LogEntry {
  id: string
  deviceId: string
  ts: string
  level: LogLevel
  source: LogSourceType
  app: string | null
  host: string | null
  message: string
  raw: Record<string, unknown> | null
  filePath: string | null
  fileOffset: number | null
  createdAt: string
}

export interface AuditFinding {
  id: string
  auditRunId: string
  title: string
  severity: Severity
  kind: string
  port: number | null
  protocol: string | null
  service: string | null
  cve: string | null
  description: string | null
  evidence: Record<string, unknown> | null
  remediation: string | null
  createdAt: string
}

export interface AuditRun {
  id: string
  deviceId: string
  status: AuditStatus
  startedAt: string | null
  finishedAt: string | null
  config: Record<string, unknown> | null
  summary: AuditSummary | null
  createdAt: string
  findings?: AuditFinding[]
  device?: Device
}

export interface AuditSummary {
  toolErrors: Array<{ tool: string; error: string }>
  findings: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  surfaceChanged: boolean
}

export interface Alert {
  id: string
  deviceId: string
  type: AlertType
  severity: Severity
  title: string
  message: string
  data: Record<string, unknown> | null
  auditRunId: string | null
  logEntryId: string | null
  createdAt: string
  acknowledgedAt: string | null
}

export interface CorrelationRule {
  id: string
  name: string
  enabled: boolean
  matchRegex: string
  windowSec: number
  threshold: number
  severity: Severity
  deviceTypeFilter: DeviceType | null
  deviceIdFilter: string | null
  createdAt: string
  updatedAt: string
}

export interface DeviceSummary {
  device: {
    id: string
    name: string
    ip: string | null
    hostname: string | null
    type: DeviceType
    isActive: boolean
  }
  alerts: {
    total: number
    unacked: number
  }
  lastAudit: {
    id: string
    status: AuditStatus
    createdAt: string
    finishedAt: string | null
    summary: AuditSummary | null
  } | null
  lastLog: {
    id: string
    ts: string
    level: LogLevel
    source: LogSourceType
  } | null
  lastSeen: string | null
}

export interface CreateDeviceDto {
  name: string
  ip?: string
  hostname?: string
  type?: DeviceType
  logSourceType?: LogSourceType
  logSourceMeta?: Record<string, unknown>
}

export interface UpdateDeviceDto extends Partial<CreateDeviceDto> {
  isActive?: boolean
}

export interface RunAuditDto {
  nmap?: boolean
  nuclei?: boolean
  nucleiTargetUrl?: string
  nucleiArgs?: string
}

export interface CreateRuleDto {
  name: string
  matchRegex: string
  windowSec?: number
  threshold?: number
  severity?: Severity
  deviceTypeFilter?: DeviceType
  deviceIdFilter?: string
  enabled?: boolean
}
