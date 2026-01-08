export const ru = {
  // Common
  common: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успех',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    view: 'Просмотр',
    create: 'Создать',
    search: 'Поиск',
    filter: 'Фильтр',
    export: 'Экспорт',
    download: 'Скачать',
    online: 'В СЕТИ',
    offline: 'НЕ В СЕТИ',
    connected: 'ПОДКЛЮЧЕНО',
    disconnected: 'ОТКЛЮЧЕНО',
  },

  // Navigation
  nav: {
    dashboard: 'Панель управления',
    devices: 'Устройства',
    scans: 'Сканирование',
    vulnerabilities: 'Уязвимости',
    reports: 'Отчеты',
  },

  // Header
  header: {
    title: 'Аудит безопасности IoT',
    subtitle: 'СИСТЕМА v1.0.0',
    websocketConnected: 'WEBSOCKET ПОДКЛЮЧЕН',
    websocketDisconnected: 'WEBSOCKET ОТКЛЮЧЕН',
    apiConnected: 'API ПОДКЛЮЧЕН',
  },

  // Footer
  footer: {
    copyright: '© 2025 Система аудита безопасности IoT. Все права защищены.',
    build: 'Сборка',
    apiStatus: 'Статус API',
  },

  // Dashboard
  dashboard: {
    title: 'ЦЕНТР УПРАВЛЕНИЯ БЕЗОПАСНОСТЬЮ',
    subtitle: 'Мониторинг IoT устройств и анализ угроз в реальном времени',
    loadingData: 'Загрузка данных панели управления...',
    devicesOnline: 'Устройств в сети',
    totalVulnerabilities: 'Всего уязвимостей',
    criticalIssues: 'Критические проблемы',
    activeScans: 'Активные сканирования',
    vulnerabilityTrends: 'ТРЕНДЫ УЯЗВИМОСТЕЙ',
    networkTraffic: 'АНАЛИЗ СЕТЕВОГО ТРАФИКА',
    riskDistribution: 'РАСПРЕДЕЛЕНИЕ РИСКОВ',
    complianceScore: 'ОЦЕНКА СООТВЕТСТВИЯ',
    recentAlerts: 'ПОСЛЕДНИЕ КРИТИЧЕСКИЕ ОПОВЕЩЕНИЯ',
    activityFeed: 'ЛЕНТА АКТИВНОСТИ',
    investigate: 'РАССЛЕДОВАТЬ',
  },

  // Devices
  devices: {
    title: 'ИНВЕНТАРЬ УСТРОЙСТВ',
    scanNetwork: 'СКАНИРОВАТЬ СЕТЬ',
    scanning: 'СКАНИРОВАНИЕ...',
    scanningProgress: 'ВЫПОЛНЯЕТСЯ СКАНИРОВАНИЕ...',
    discoveringDevices: 'Обнаружение устройств в сети 192.168.1.0/24...',
    loadingDevices: 'Загрузка устройств...',
    type: 'Тип',
    manufacturer: 'Производитель',
    firmware: 'Прошивка',
    vulnerabilities: 'уязв.',
    startAudit: 'НАЧАТЬ АУДИТ',
    ipAddress: 'IP адрес',
    status: 'Статус',
    deviceType: 'Тип устройства',
    firmwareVersion: 'Версия прошивки',
    riskLevel: 'Уровень риска',
    openPorts: 'Открытые порты',
    detectedServices: 'Обнаруженные сервисы',
    vulnerabilitiesFound: 'Найдено уязвимостей',
    lastSecurityAudit: 'Последний аудит безопасности',
    runFullAudit: 'ВЫПОЛНИТЬ ПОЛНЫЙ АУДИТ',
  },

  // Scans
  scans: {
    title: 'РЕЗУЛЬТАТЫ АКТИВНОГО СКАНИРОВАНИЯ',
    timeline: 'ВРЕМЕННАЯ ШКАЛА СКАНИРОВАНИЯ',
    firmwareAnalysis: 'АНАЛИЗ ПРОШИВКИ',
    networkCapture: 'ЗАХВАТ СЕТЕВОГО ТРАФИКА',
    discoveredVulnerabilities: 'ОБНАРУЖЕННЫЕ УЯЗВИМОСТИ',
    phases: {
      networkDiscovery: 'Обнаружение сети',
      portScanning: 'Сканирование портов',
      serviceDetection: 'Определение сервисов',
      firmwareAnalysis: 'Анализ прошивки',
      networkTrafficAnalysis: 'Анализ сетевого трафика',
      cveMatching: 'Сопоставление CVE',
      reportGeneration: 'Генерация отчета',
    },
    devicesFound: 'устройств найдено',
    openPorts: 'открытых портов',
    servicesIdentified: 'сервисов идентифицировано',
    devicesAnalyzed: 'устройств проанализировано',
    dataCaptured: 'захвачено',
    waiting: 'Ожидание...',
  },

  // Vulnerabilities
  vulnerabilities: {
    title: 'БАЗА ДАННЫХ УЯЗВИМОСТЕЙ',
    loadingData: 'Загрузка данных об уязвимостях...',
    critical: 'КРИТИЧЕСКИЕ',
    high: 'ВЫСОКИЕ',
    medium: 'СРЕДНИЕ',
    low: 'НИЗКИЕ',
    allVulnerabilities: 'ВСЕ УЯЗВИМОСТИ',
    allSeverities: 'Все уровни',
    allDevices: 'Все устройства',
    device: 'Устройство',
    cvss: 'CVSS',
    discovered: 'Обнаружено',
    description: 'ОПИСАНИЕ',
    impact: 'ВЛИЯНИЕ',
    solution: 'РЕШЕНИЕ',
    details: 'ДЕТАЛИ',
    exportCve: 'ЭКСПОРТ CVE',
    multipleDevices: 'Несколько устройств',
    status: {
      open: 'ОТКРЫТА',
      patched: 'ИСПРАВЛЕНА',
      mitigated: 'СМЯГЧЕНА',
      unknown: 'НЕИЗВЕСТНО',
    },
  },

  // Reports
  reports: {
    title: 'ОТЧЕТЫ ПО БЕЗОПАСНОСТИ',
    generateNew: 'СОЗДАТЬ НОВЫЙ ОТЧЕТ',
    generating: 'ГЕНЕРАЦИЯ...',
    generatingReport: 'ГЕНЕРАЦИЯ ОТЧЕТА...',
    analyzingDevices: '• Анализ состояния безопасности устройств...',
    compilingData: '• Компиляция данных об уязвимостях...',
    generatingRecommendations: '• Генерация рекомендаций...',
    creatingVisualizations: '• Создание визуализаций...',
    technical: 'Технический отчет',
    technicalDesc: 'Детальный технический анализ',
    technicalFull: 'Комплексный технический отчет, включая детали уязвимостей, сопоставления CVE и шаги по исправлению.',
    executive: 'Резюме для руководства',
    executiveDesc: 'Обзор высокого уровня',
    executiveFull: 'Резюме уровня руководства с метриками рисков, влиянием на бизнес и стратегическими рекомендациями.',
    compliance: 'Отчет о соответствии',
    complianceDesc: 'Стандарты и регламенты',
    complianceFull: 'Оценка соответствия OWASP IoT, NIST, ISO 27001 и другим стандартам безопасности.',
    create: 'СОЗДАТЬ',
    generated: 'СОЗДАННЫЕ ОТЧЕТЫ',
    loadingReports: 'Загрузка отчетов...',
    devices: 'устройств',
    pdf: 'PDF',
    view: 'ПРОСМОТР',
    status: {
      draft: 'ЧЕРНОВИК',
      final: 'ФИНАЛЬНЫЙ',
    },
  },

  // Severity levels
  severity: {
    critical: 'Критическая',
    high: 'Высокая',
    medium: 'Средняя',
    low: 'Низкая',
    info: 'Информация',
  },

  // Risk levels
  risk: {
    critical: 'КРИТИЧЕСКИЙ',
    high: 'ВЫСОКИЙ',
    medium: 'СРЕДНИЙ',
    low: 'НИЗКИЙ',
    info: 'ИНФО',
  },

  // Activity types
  activity: {
    scan: 'Сканирование',
    alert: 'Оповещение',
    update: 'Обновление',
    info: 'Информация',
  },

  // Chart labels
  chart: {
    incoming: 'Входящий',
    outgoing: 'Исходящий',
    suspicious: 'Подозрительный',
    score: 'Оценка',
  },
};