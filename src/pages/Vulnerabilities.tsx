import { useState, useEffect } from 'react';
import { Shield, HardDrive, Activity, ChevronDown, FileDown, Eye, XCircle, AlertTriangle } from 'lucide-react';
import { vulnerabilitiesApi, devicesApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import type { Vulnerability } from '../types';

// Компонент модального окна деталей уязвимости
interface VulnerabilityModalProps {
  vulnerability: Vulnerability | null;
  onClose: () => void;
}

const VulnerabilityModal = ({ vulnerability, onClose }: VulnerabilityModalProps) => {
  const { t } = useTheme();
  const { showSuccess } = useNotification();
  
  if (!vulnerability) return null;

  const handleExport = () => {
    const cveData = {
      id: vulnerability.id,
      title: vulnerability.title,
      severity: vulnerability.severity,
      cvss: vulnerability.cvss,
      description: vulnerability.description,
      impact: vulnerability.impact,
      solution: vulnerability.solution,
      discovered: vulnerability.discovered,
      devices: vulnerability.deviceVulns?.map(dv => dv.device?.name).filter(Boolean) || [],
    };

    const dataStr = JSON.stringify(cveData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${vulnerability.id}_export.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSuccess('Export Complete', `${vulnerability.id} exported successfully`);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-primary border-2 border-red-500 rounded-lg p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className={`w-8 h-8 ${
                vulnerability.severity === 'critical' ? 'accent-red' :
                vulnerability.severity === 'high' ? 'accent-orange' :
                vulnerability.severity === 'medium' ? 'accent-yellow' :
                'accent-green'
              }`} />
              <h2 className="text-2xl font-bold text-primary font-mono">{vulnerability.id}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded font-mono text-xs font-bold ${
                vulnerability.severity === 'critical' ? 'bg-red-500/20 accent-red border border-red-500' :
                vulnerability.severity === 'high' ? 'bg-orange-500/20 accent-orange border border-orange-500' :
                vulnerability.severity === 'medium' ? 'bg-yellow-500/20 accent-yellow border border-yellow-500' :
                'bg-green-500/20 accent-green border border-green-500'
              }`}>
                {t.risk[vulnerability.severity as keyof typeof t.risk]}
              </span>
              <span className="text-primary font-mono text-sm">
                {t.vulnerabilities.cvss}: <span className="accent-cyan font-bold">{vulnerability.cvss}</span>
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-tertiary hover:text-primary transition-colors ml-4"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-primary mb-6">{vulnerability.title}</h3>

        {/* Content */}
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-secondary border border-secondary rounded-lg p-4">
            <h4 className="text-tertiary text-sm font-mono mb-2 uppercase tracking-wider">
              {t.vulnerabilities.description}
            </h4>
            <p className="text-primary leading-relaxed">{vulnerability.description}</p>
          </div>

          {/* Impact */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="accent-red text-sm font-mono mb-2 uppercase tracking-wider">
              {t.vulnerabilities.impact}
            </h4>
            <p className="text-primary leading-relaxed">{vulnerability.impact}</p>
          </div>

          {/* Solution */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="accent-green text-sm font-mono mb-2 uppercase tracking-wider">
              {t.vulnerabilities.solution}
            </h4>
            <p className="text-primary leading-relaxed">{vulnerability.solution}</p>
          </div>

          {/* Device Info */}
          <div className="bg-secondary border border-secondary rounded-lg p-4">
            <h4 className="text-tertiary text-sm font-mono mb-2 uppercase tracking-wider">
              Affected Devices
            </h4>
            <div className="flex flex-wrap gap-2">
              {vulnerability.deviceVulns && vulnerability.deviceVulns.length > 0 ? (
                vulnerability.deviceVulns.map((dv, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-cyan-500/20 accent-cyan rounded font-mono text-sm border border-cyan-500"
                  >
                    {dv.device?.name || 'Unknown Device'}
                  </span>
                ))
              ) : (
                <span className="text-tertiary text-sm">No devices linked</span>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-tertiary text-sm font-mono mb-1">{t.vulnerabilities.discovered}</p>
              <p className="text-primary font-mono">{vulnerability.discovered}</p>
            </div>
            <div>
              <p className="text-tertiary text-sm font-mono mb-1">Status</p>
              <p className={`font-mono font-bold ${
                vulnerability.status === 'open' ? 'accent-red' :
                vulnerability.status === 'patched' ? 'accent-green' :
                'accent-yellow'
              }`}>
                {vulnerability.status?.toUpperCase() || 'UNKNOWN'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-secondary">
          <button
            onClick={handleExport}
            className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono font-bold transition-all flex items-center justify-center gap-2"
          >
            <FileDown className="w-5 h-5" />
            {t.vulnerabilities.exportCve}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-tertiary hover:bg-secondary text-primary rounded-lg font-mono font-bold transition-all border border-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Основной компонент
const Vulnerabilities = () => {
  const { t } = useTheme();
  const { showError } = useNotification();
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [detailModalVuln, setDetailModalVuln] = useState<Vulnerability | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vulnResponse, devicesResponse, statsResponse] = await Promise.all([
          vulnerabilitiesApi.getAll(),
          devicesApi.getAll(),
          vulnerabilitiesApi.getStats(),
        ]);
        
        setVulnerabilities(vulnResponse.data);
        setDevices(devicesResponse.data);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        showError('Error', 'Failed to load vulnerabilities data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  useEffect(() => {
    const fetchFiltered = async () => {
      try {
        const params: any = {};
        if (filterSeverity !== 'all') params.severity = filterSeverity;
        if (filterDevice !== 'all') params.device = filterDevice;
        
        const response = await vulnerabilitiesApi.getAll(params);
        setVulnerabilities(response.data);
      } catch (error) {
        console.error('Failed to fetch filtered vulnerabilities:', error);
      }
    };

    if (!loading) {
      fetchFiltered();
    }
  }, [filterSeverity, filterDevice, loading]);

  const getVulnStatus = (vuln: Vulnerability): string => {
    if (vuln.deviceVulns && vuln.deviceVulns.length > 0) {
      return vuln.deviceVulns[0].status || 'unknown';
    }
    return vuln.status || 'unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="accent-cyan font-mono">{t.vulnerabilities.loadingData}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary font-mono flex items-center gap-3">
        <Shield className="w-8 h-8 accent-cyan" />
        {t.vulnerabilities.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 border border-red-500/50 rounded-lg p-4">
          <p className="accent-red text-sm font-mono mb-1">{t.vulnerabilities.critical}</p>
          <p className="text-3xl font-bold text-primary font-mono">{stats.critical}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 border border-orange-500/50 rounded-lg p-4">
          <p className="accent-orange text-sm font-mono mb-1">{t.vulnerabilities.high}</p>
          <p className="text-3xl font-bold text-primary font-mono">{stats.high}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border border-yellow-500/50 rounded-lg p-4">
          <p className="accent-yellow text-sm font-mono mb-1">{t.vulnerabilities.medium}</p>
          <p className="text-3xl font-bold text-primary font-mono">{stats.medium}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/50 rounded-lg p-4">
          <p className="accent-green text-sm font-mono mb-1">{t.vulnerabilities.low}</p>
          <p className="text-3xl font-bold text-primary font-mono">{stats.low}</p>
        </div>
      </div>

      <div className="bg-primary border border-primary rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-primary font-mono">{t.vulnerabilities.allVulnerabilities}</h3>
          <div className="flex gap-2">
            <div className="relative">
              <select 
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="appearance-none bg-tertiary border border-primary text-primary px-4 py-2 pr-10 rounded font-mono text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">{t.vulnerabilities.allSeverities}</option>
                <option value="critical">{t.severity.critical}</option>
                <option value="high">{t.severity.high}</option>
                <option value="medium">{t.severity.medium}</option>
                <option value="low">{t.severity.low}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
            </div>
            <div className="relative">
              <select 
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="appearance-none bg-tertiary border border-primary text-primary px-4 py-2 pr-10 rounded font-mono text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">{t.vulnerabilities.allDevices}</option>
                {devices.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {vulnerabilities.map((vuln) => {
            const status = getVulnStatus(vuln);
            
            return (
              <div 
                key={vuln.id} 
                className="bg-secondary border border-secondary rounded-lg p-6 hover:border-cyan-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedVuln(selectedVuln?.id === vuln.id ? null : vuln)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="accent-cyan font-mono text-lg font-bold">{vuln.id}</span>
                      <span className={`px-3 py-1 rounded font-mono text-xs font-bold ${
                        vuln.severity === 'critical' ? 'bg-red-500/20 accent-red border border-red-500' :
                        vuln.severity === 'high' ? 'bg-orange-500/20 accent-orange border border-orange-500' :
                        vuln.severity === 'medium' ? 'bg-yellow-500/20 accent-yellow border border-yellow-500' :
                        vuln.severity === 'low' ? 'bg-green-500/20 accent-green border border-green-500' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500'
                      }`}>
                        {t.risk[vuln.severity as keyof typeof t.risk] || vuln.severity.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2 text-primary font-mono text-sm">
                        <span className="text-tertiary">{t.vulnerabilities.cvss}:</span>
                        <span className={`font-bold ${
                          vuln.cvss >= 9 ? 'accent-red' :
                          vuln.cvss >= 7 ? 'accent-orange' :
                          vuln.cvss >= 4 ? 'accent-yellow' :
                          'accent-green'
                        }`}>{vuln.cvss}</span>
                      </div>
                    </div>
                    <h4 className="text-primary text-lg font-medium mb-2">{vuln.title}</h4>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-tertiary" />
                        <span className="text-tertiary font-mono">{t.vulnerabilities.device}:</span>
                        <span className="accent-cyan font-mono">
                          {vuln.deviceVulns?.[0]?.device?.name || t.vulnerabilities.multipleDevices}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-tertiary" />
                        <span className="text-tertiary font-mono">{t.devices.status}:</span>
                        <span className={`font-mono ${
                          status === 'open' ? 'accent-red' :
                          status === 'patched' ? 'accent-green' :
                          'accent-yellow'
                        }`}>
                          {t.vulnerabilities.status[status as keyof typeof t.vulnerabilities.status] || status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-tertiary font-mono">{t.vulnerabilities.discovered}:</span>
                        <span className="text-secondary font-mono">{vuln.discovered}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedVuln?.id === vuln.id && (
                  <div className="mt-4 pt-4 border-t border-secondary space-y-4">
                    <div>
                      <p className="text-tertiary text-sm font-mono mb-1">{t.vulnerabilities.description}</p>
                      <p className="text-primary text-sm">{vuln.description}</p>
                    </div>
                    <div>
                      <p className="text-tertiary text-sm font-mono mb-1">{t.vulnerabilities.impact}</p>
                      <p className="accent-red text-sm">{vuln.impact}</p>
                    </div>
                    <div>
                      <p className="text-tertiary text-sm font-mono mb-1">{t.vulnerabilities.solution}</p>
                      <p className="accent-green text-sm">{vuln.solution}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailModalVuln(vuln);
                        }}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-sm transition-all flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {t.vulnerabilities.details}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <VulnerabilityModal 
        vulnerability={detailModalVuln}
        onClose={() => setDetailModalVuln(null)}
      />
    </div>
  );
};

export default Vulnerabilities;