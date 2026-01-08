export const tk = {
  // Common
  common: {
    loading: 'Ýüklenýär...',
    error: 'Ýalňyşlyk',
    success: 'Üstünlik',
    cancel: 'Ýatyr',
    save: 'Sakla',
    delete: 'Poz',
    edit: 'Redaktirle',
    view: 'Görkez',
    create: 'Döret',
    search: 'Gözle',
    filter: 'Süzgüç',
    export: 'Eksport',
    download: 'Göçürip al',
    online: 'ONLAÝN',
    offline: 'OFLAÝN',
    connected: 'BIRIKDIRILDI',
    disconnected: 'AÝRYLDY',
  },

  // Navigation
  nav: {
    dashboard: 'Dolandyryş paneli',
    devices: 'Enjamlar',
    scans: 'Skanirlemek',
    vulnerabilities: 'Gowşaklyklar',
    reports: 'Hasabatlar',
  },

  // Header
  header: {
    title: 'IoT Howpsuzlyk Barlagy',
    subtitle: 'ULGAM v1.0.0',
    websocketConnected: 'WEBSOCKET BIRIKDIRILDI',
    websocketDisconnected: 'WEBSOCKET AÝRYLDY',
    apiConnected: 'API BIRIKDIRILDI',
  },

  // Footer
  footer: {
    copyright: '© 2025 IoT Howpsuzlyk Barlag Ulgamy. Ähli hukuklar goralan.',
    build: 'Wersiýa',
    apiStatus: 'API Ýagdaýy',
  },

  // Dashboard
  dashboard: {
    title: 'HOWPSUZLYK DOLANDYRYŞ MERKEZI',
    subtitle: 'IoT enjamlaryň gözegçiligi we howp derňewi hakyky wagtda',
    loadingData: 'Dolandyryş paneli maglumatlary ýüklenýär...',
    devicesOnline: 'Onlaýn enjamlar',
    totalVulnerabilities: 'Jemi gowşaklyklar',
    criticalIssues: 'Kritiki meseleler',
    activeScans: 'Işjeň skanirlemeler',
    vulnerabilityTrends: 'GOWŞAKLYKLARYŇ TENDENSIÝALARY',
    networkTraffic: 'TOR TRAFFIGINIŇ DERŇEWI',
    riskDistribution: 'TÖWEKGELÇILIKLERIŇ PAÝLANYŞY',
    complianceScore: 'LAÝYKLYGYŇ BAHASY',
    recentAlerts: 'SOŇKY KRITIKI DUÝDURYŞLAR',
    activityFeed: 'IŞJEŇLIK LENTASY',
    investigate: 'DERŇE',
  },

  // Devices
  devices: {
    title: 'ENJAMLAR INWENTARY',
    scanNetwork: 'TORY SKANIRLE',
    scanning: 'SKANIRLEME...',
    scanningProgress: 'SKANIRLEME DOWAM EDÝÄR...',
    discoveringDevices: '192.168.1.0/24 torynda enjamlar tapylýar...',
    loadingDevices: 'Enjamlar ýüklenýär...',
    type: 'Görnüşi',
    manufacturer: 'Öndüriji',
    firmware: 'Firmware',
    vulnerabilities: 'gowş.',
    startAudit: 'BARLAGY BAŞLA',
    ipAddress: 'IP salgysy',
    status: 'Ýagdaý',
    deviceType: 'Enjam görnüşi',
    firmwareVersion: 'Firmware wersiýasy',
    riskLevel: 'Töwekgelçilik derejesi',
    openPorts: 'Açyk portlar',
    detectedServices: 'Tapylan hyzmatlar',
    vulnerabilitiesFound: 'Tapylan gowşaklyklar',
    lastSecurityAudit: 'Soňky howpsuzlyk barlagy',
    runFullAudit: 'DOLY BARLAG GEÇIR',
  },

  // Scans
  scans: {
    title: 'IŞJEŇ SKANIRLEME NETIJELERI',
    timeline: 'SKANIRLEME WAGTY',
    firmwareAnalysis: 'FIRMWARE DERŇEWI',
    networkCapture: 'TOR TRAFFIGINI TUTMAK',
    discoveredVulnerabilities: 'TAPYLAN GOWŞAKLYKLAR',
    phases: {
      networkDiscovery: 'Tory açmak',
      portScanning: 'Port skanirlemesi',
      serviceDetection: 'Hyzmatlary kesgitlemek',
      firmwareAnalysis: 'Firmware derňewi',
      networkTrafficAnalysis: 'Tor traffigini derňemek',
      cveMatching: 'CVE gabat getirme',
      reportGeneration: 'Hasabat döretme',
    },
    devicesFound: 'enjam tapyldy',
    openPorts: 'açyk port',
    servicesIdentified: 'hyzmat kesgitlendi',
    devicesAnalyzed: 'enjam derňeldi',
    dataCaptured: 'tutuldy',
    waiting: 'Garaşylýar...',
  },

  // Vulnerabilities
  vulnerabilities: {
    title: 'GOWŞAKLYKLAR BAZASY',
    loadingData: 'Gowşaklyk maglumatlary ýüklenýär...',
    critical: 'KRITIKI',
    high: 'ÝOKARY',
    medium: 'ORTA',
    low: 'PES',
    allVulnerabilities: 'ÄHLI GOWŞAKLYKLAR',
    allSeverities: 'Ähli derejeleri',
    allDevices: 'Ähli enjamlar',
    device: 'Enjam',
    cvss: 'CVSS',
    discovered: 'Tapyldy',
    description: 'DÜŞÜNDIRIŞ',
    impact: 'TÄSIRI',
    solution: 'ÇÖZGÜT',
    details: 'JIKME-JIKLIKLER',
    exportCve: 'CVE EKSPORT',
    multipleDevices: 'Birnäçe enjam',
    status: {
      open: 'AÇYK',
      patched: 'DÜZEDILDI',
      mitigated: 'ÝEŇILLEŞDIRILDI',
      unknown: 'NÄBELLI',
    },
  },

  // Reports
  reports: {
    title: 'HOWPSUZLYK HASABATLARY',
    generateNew: 'TÄZE HASABAT DÖRET',
    generating: 'DÖREDILÝÄR...',
    generatingReport: 'HASABAT DÖREDILÝÄR...',
    analyzingDevices: '• Enjamlaryň howpsuzlyk ýagdaýy derňelýär...',
    compilingData: '• Gowşaklyk maglumatlary düzülýär...',
    generatingRecommendations: '• Maslahatlar döredilýär...',
    creatingVisualizations: '• Wizualizasiýalar döredilýär...',
    technical: 'Tehniki hasabat',
    technicalDesc: 'Jikme-jik tehniki derňew',
    technicalFull: 'Gowşaklygyň jikme-jiklikleri, CVE gabat gelişleri we düzediş ädimleri bilen giňişleýin tehniki hasabat.',
    executive: 'Ýolbaşçylar üçin gysgaça',
    executiveDesc: 'Ýokary derejeli syn',
    executiveFull: 'Töwekgelçilik ölçegleri, biznes täsiri we strategik maslahatlar bilen ýolbaşçylyk derejesiniň gysgaça.',
    compliance: 'Laýyklyk hasabaty',
    complianceDesc: 'Standartlar we düzgünler',
    complianceFull: 'OWASP IoT, NIST, ISO 27001 we beýleki howpsuzlyk standartlaryna laýyklygy bahalandyrmak.',
    create: 'DÖRET',
    generated: 'DÖREDILEN HASABATLAR',
    loadingReports: 'Hasabatlar ýüklenýär...',
    devices: 'enjam',
    pdf: 'PDF',
    view: 'GÖRKEZ',
    status: {
      draft: 'GARALAMA',
      final: 'SOŇKY',
    },
  },

  // Severity levels
  severity: {
    critical: 'Kritiki',
    high: 'Ýokary',
    medium: 'Orta',
    low: 'Pes',
    info: 'Maglumat',
  },

  // Risk levels
  risk: {
    critical: 'KRITIKI',
    high: 'ÝOKARY',
    medium: 'ORTA',
    low: 'PES',
    info: 'MAGLUMAT',
  },

  // Activity types
  activity: {
    scan: 'Skanirleme',
    alert: 'Duýduryş',
    update: 'Täzeleme',
    info: 'Maglumat',
  },

  // Chart labels
  chart: {
    incoming: 'Girýän',
    outgoing: 'Çykýan',
    suspicious: 'Şübheli',
    score: 'Baha',
  },
};