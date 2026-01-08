import { useState, useEffect } from 'react';
import { Shield, HardDrive, Activity, ChevronDown } from 'lucide-react';
import { vulnerabilitiesApi, devicesApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import type { Vulnerability } from '../types';

const Vulnerabilities = () => {
  const { t } = useTheme();
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const filteredVulnerabilities = vulnerabilities;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary font-mono flex items-center gap-3">
        <Shield className="w-8 h-8 accent-cyan" />
        {t.vulnerabilities.title}
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="accent-cyan font-mono">{t.vulnerabilities.loadingData}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Severity Overview */}
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

          {/* Filters */}
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
                    <option value="info">{t.severity.info}</option>
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

            {/* Vulnerability List */}
            <div className="space-y-4">
              {filteredVulnerabilities.map((vuln) => (
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
                          {t.risk[vuln.severity as keyof typeof t.risk]}
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
                            vuln.deviceVulns?.[0]?.status === 'open' ? 'accent-red' :
                            vuln.deviceVulns?.[0]?.status === 'patched' ? 'accent-green' :
                            'accent-yellow'
                          }`}>{t.vulnerabilities.status[vuln.deviceVulns?.[0]?.status || 'unknown']}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-tertiary font-mono">{t.vulnerabilities.discovered}:</span>
                          <span className="text-secondary font-mono">{vuln.discovered}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
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
                        <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-sm transition-all">
                          {t.vulnerabilities.details}
                        </button>
                        <button className="px-4 py-2 bg-tertiary hover:bg-secondary text-primary rounded font-mono text-sm transition-all border border-primary">
                          {t.vulnerabilities.exportCve}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vulnerabilities;