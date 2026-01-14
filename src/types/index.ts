export type DeviceStatus = 'online' | 'offline' | 'warning';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type VulnerabilityStatus = 'open' | 'patched' | 'mitigated';
export type ScanStatus = 'completed' | 'running' | 'pending' | 'failed';
export type ActivityType = 'scan' | 'alert' | 'update' | 'info';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  criticalVulnerabilities: number;
  activeScans: number;
  riskTrend: Array<{ date: string; score: number }>;
  devicesByType: Array<{ type: string; count: number }>;
  recentActivity: Array<{
    id: string;
    type: 'scan' | 'vulnerability' | 'device';
    message: string;
    timestamp: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export interface Device {
  id: number;
  name: string;
  ip: string;
  type: string;
  status: DeviceStatus;
  risk: RiskLevel;
  vulnerabilities: number;
  lastScan: string;
  manufacturer: string;
  firmware: string;
  ports: number[];
  services: string[];
}

export interface DeviceVulnerability {
  id: string;
  deviceId: string;
  device: Device;
  vulnerabilityId: string;
  status: VulnerabilityStatus;
  detectedAt: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  cvss: number;
  deviceId?: number;
  device?: string;
  status?: VulnerabilityStatus;
  discovered: string;
  description: string;
  impact: string;
  solution: string;
  deviceVulns?: DeviceVulnerability[];
}

export interface ScanPhase {
  phase: string;
  progress: number;
  status: ScanStatus;
  time: string;
  details: string;
  phaseCode?: string;
}

export interface NetworkTraffic {
  time: string;
  incoming: number;
  outgoing: number;
  suspicious: number;
}

export interface VulnerabilityTrend {
  month: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface RiskData {
  name: string;
  value: number;
  color: string;
}

export interface ComplianceScore {
  subject: string;
  score: number;
  max: number;
}

export interface Activity {
  id: number;
  type: ActivityType;
  message: string;
  device: string;
  timestamp: string;
  severity: Severity;
}

export interface LiveMetrics {
  devicesOnline: number;
  totalVulnerabilities: number;
  criticalIssues: number;
  scanningNow: number;
}

export interface ScanResult {
  id: string;
  deviceId: number;
  deviceName: string;
  startTime: string;
  endTime?: string;
  status: ScanStatus;
  phases: ScanPhase[];
  vulnerabilitiesFound: number;
  findings: string[];
}

export interface Report {
  id: string;
  title: string;
  type: 'technical' | 'executive' | 'compliance';
  createdAt: string;
  devices: number;
  vulnerabilities: number;
  status: 'draft' | 'final';
}