export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    download: 'Download',
    online: 'ONLINE',
    offline: 'OFFLINE',
    connected: 'CONNECTED',
    disconnected: 'DISCONNECTED',
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    devices: 'Devices',
    scans: 'Scans',
    vulnerabilities: 'Vulnerabilities',
    reports: 'Reports',
  },

  // Header
  header: {
    title: 'IoT Security Audit',
    subtitle: 'SYSTEM v1.0.0',
    websocketConnected: 'WEBSOCKET CONNECTED',
    websocketDisconnected: 'WEBSOCKET DISCONNECTED',
    apiConnected: 'API CONNECTED',
  },

  // Footer
  footer: {
    copyright: '© 2025 IoT Security Audit System. All rights reserved.',
    build: 'Build',
    apiStatus: 'API Status',
  },

  // Dashboard
  dashboard: {
    title: 'SECURITY COMMAND CENTER',
    subtitle: 'Real-time IoT device monitoring and threat analysis',
    loadingData: 'Loading dashboard data...',
    devicesOnline: 'Devices Online',
    totalVulnerabilities: 'Total Vulnerabilities',
    criticalIssues: 'Critical Issues',
    activeScans: 'Active Scans',
    vulnerabilityTrends: 'VULNERABILITY TRENDS',
    networkTraffic: 'NETWORK TRAFFIC ANALYSIS',
    riskDistribution: 'RISK DISTRIBUTION',
    complianceScore: 'COMPLIANCE SCORE',
    recentAlerts: 'RECENT CRITICAL ALERTS',
    activityFeed: 'ACTIVITY FEED',
    investigate: 'INVESTIGATE',
  },

  // Devices
  devices: {
    title: 'DEVICE INVENTORY',
    scanNetwork: 'SCAN NETWORK',
    scanning: 'SCANNING...',
    scanningProgress: 'SCANNING IN PROGRESS...',
    discoveringDevices: 'Discovering devices on network 192.168.1.0/24...',
    loadingDevices: 'Loading devices...',
    type: 'Type',
    manufacturer: 'Manufacturer',
    firmware: 'Firmware',
    vulnerabilities: 'vulns',
    startAudit: 'START AUDIT',
    ipAddress: 'IP Address',
    status: 'Status',
    deviceType: 'Device Type',
    firmwareVersion: 'Firmware Version',
    riskLevel: 'Risk Level',
    openPorts: 'Open Ports',
    detectedServices: 'Detected Services',
    vulnerabilitiesFound: 'Vulnerabilities Found',
    lastSecurityAudit: 'Last Security Audit',
    runFullAudit: 'RUN FULL SECURITY AUDIT',
  },

  // Scans
  scans: {
    title: 'ACTIVE SCAN RESULTS',
    timeline: 'SCAN TIMELINE',
    firmwareAnalysis: 'FIRMWARE ANALYSIS',
    networkCapture: 'NETWORK CAPTURE',
    discoveredVulnerabilities: 'DISCOVERED VULNERABILITIES',
    phases: {
      networkDiscovery: 'Network Discovery',
      portScanning: 'Port Scanning',
      serviceDetection: 'Service Detection',
      firmwareAnalysis: 'Firmware Analysis',
      networkTrafficAnalysis: 'Network Traffic Analysis',
      cveMatching: 'CVE Matching',
      reportGeneration: 'Report Generation',
    },
    devicesFound: 'devices found',
    openPorts: 'open ports',
    servicesIdentified: 'services identified',
    devicesAnalyzed: 'devices analyzed',
    dataCaptured: 'captured',
    waiting: 'Waiting...',
  },

  // Vulnerabilities
  vulnerabilities: {
    title: 'VULNERABILITY DATABASE',
    loadingData: 'Loading vulnerability data...',
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
    allVulnerabilities: 'ALL VULNERABILITIES',
    allSeverities: 'All Severities',
    allDevices: 'All Devices',
    device: 'Device',
    cvss: 'CVSS',
    discovered: 'Discovered',
    description: 'DESCRIPTION',
    impact: 'IMPACT',
    solution: 'SOLUTION',
    details: 'DETAILS',
    exportCve: 'EXPORT CVE',
    multipleDevices: 'Multiple devices',
    status: {
      open: 'OPEN',
      patched: 'PATCHED',
      mitigated: 'MITIGATED',
      unknown: 'UNKNOWN',
    },
  },

  // Reports
  reports: {
    title: 'SECURITY REPORTS',
    generateNew: 'GENERATE NEW REPORT',
    generating: 'GENERATING...',
    generatingReport: 'GENERATING REPORT...',
    analyzingDevices: '• Analyzing device security posture...',
    compilingData: '• Compiling vulnerability data...',
    generatingRecommendations: '• Generating recommendations...',
    creatingVisualizations: '• Creating visualizations...',
    technical: 'Technical Report',
    technicalDesc: 'Detailed technical analysis',
    technicalFull: 'Comprehensive technical report including vulnerability details, CVE mappings, and remediation steps.',
    executive: 'Executive Summary',
    executiveDesc: 'High-level overview',
    executiveFull: 'Executive-level summary with risk metrics, business impact, and strategic recommendations.',
    compliance: 'Compliance Report',
    complianceDesc: 'Standards & regulations',
    complianceFull: 'Compliance assessment against OWASP IoT, NIST, ISO 27001, and other security standards.',
    create: 'CREATE',
    generated: 'GENERATED REPORTS',
    loadingReports: 'Loading reports...',
    devices: 'devices',
    pdf: 'PDF',
    view: 'VIEW',
    status: {
      draft: 'DRAFT',
      final: 'FINAL',
    },
  },

  // Severity levels
  severity: {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    info: 'Info',
  },

  // Risk levels
  risk: {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
    info: 'INFO',
  },

  // Activity types
  activity: {
    scan: 'Scan',
    alert: 'Alert',
    update: 'Update',
    info: 'Info',
  },

  // Chart labels
  chart: {
    incoming: 'Incoming',
    outgoing: 'Outgoing',
    suspicious: 'Suspicious',
    score: 'Score',
  },
};