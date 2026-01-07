import { useState, useEffect } from 'react';
import { Shield, HardDrive, Activity, ChevronDown } from 'lucide-react';
import { vulnerabilitiesApi, devicesApi } from '../services/api';
import type { Vulnerability } from '../types';

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });

  // Fetch vulnerabilities and devices
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

  // Apply filters
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
      <h1 className="text-3xl font-bold text-white font-mono flex items-center gap-3">
        <Shield className="w-8 h-8 text-cyan-400" />
        VULNERABILITY DATABASE
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400 font-mono">Loading vulnerability data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Severity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm font-mono mb-1">CRITICAL</p>
          <p className="text-3xl font-bold text-white font-mono">{stats.critical}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 border border-orange-500/50 rounded-lg p-4">
          <p className="text-orange-400 text-sm font-mono mb-1">HIGH</p>
          <p className="text-3xl font-bold text-white font-mono">{stats.high}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-yellow-400 text-sm font-mono mb-1">MEDIUM</p>
          <p className="text-3xl font-bold text-white font-mono">{stats.medium}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-400 text-sm font-mono mb-1">LOW</p>
          <p className="text-3xl font-bold text-white font-mono">{stats.low}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white font-mono">ALL VULNERABILITIES</h3>
          <div className="flex gap-2">
            <div className="relative">
              <select 
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="appearance-none bg-gray-800 border border-cyan-500/30 text-white px-4 py-2 pr-10 rounded font-mono text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select 
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="appearance-none bg-gray-800 border border-cyan-500/30 text-white px-4 py-2 pr-10 rounded font-mono text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Devices</option>
                {devices.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Vulnerability List */}
        <div className="space-y-4">
          {filteredVulnerabilities.map((vuln) => (
            <div 
              key={vuln.id} 
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-all cursor-pointer"
              onClick={() => setSelectedVuln(selectedVuln?.id === vuln.id ? null : vuln)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-cyan-400 font-mono text-lg font-bold">{vuln.id}</span>
                    <span className={`px-3 py-1 rounded font-mono text-xs font-bold ${
                      vuln.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                      vuln.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500' :
                      vuln.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500' :
                      'bg-green-500/20 text-green-400 border border-green-500'
                    }`}>
                      {vuln.severity.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2 text-white font-mono text-sm">
                      <span className="text-gray-400">CVSS:</span>
                      <span className={`font-bold ${
                        vuln.cvss >= 9 ? 'text-red-400' :
                        vuln.cvss >= 7 ? 'text-orange-400' :
                        vuln.cvss >= 4 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>{vuln.cvss}</span>
                    </div>
                  </div>
                  <h4 className="text-white text-lg font-medium mb-2">{vuln.title}</h4>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 font-mono">Device:</span>
                      <span className="text-cyan-400 font-mono">
                        {vuln.deviceVulns?.[0]?.device?.name || 'Multiple devices'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 font-mono">Status:</span>
                      <span className={`font-mono ${
                        vuln.deviceVulns?.[0]?.status === 'open' ? 'text-red-400' :
                        vuln.deviceVulns?.[0]?.status === 'patched' ? 'text-green-400' :
                        'text-yellow-400'
                      }`}>{(vuln.deviceVulns?.[0]?.status || 'unknown').toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-mono">Discovered:</span>
                      <span className="text-gray-300 font-mono">{vuln.discovered}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedVuln?.id === vuln.id && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm font-mono mb-1">DESCRIPTION</p>
                    <p className="text-white text-sm">{vuln.description}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-mono mb-1">IMPACT</p>
                    <p className="text-red-400 text-sm">{vuln.impact}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-mono mb-1">SOLUTION</p>
                    <p className="text-green-400 text-sm">{vuln.solution}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-sm transition-all">
                      DETAILS
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono text-sm transition-all border border-cyan-500/30">
                      EXPORT CVE
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