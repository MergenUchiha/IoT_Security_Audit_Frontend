import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { vulnerabilitiesApi } from '../../services/api';

const RecentAlerts = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        const response = await vulnerabilitiesApi.getAll();
        // Filter critical and high severity, take first 3
        const criticalAlerts = response.data
          .filter((v: any) => v.severity === 'critical' || v.severity === 'high')
          .slice(0, 3);
        setVulnerabilities(criticalAlerts);
      } catch (error) {
        console.error('Failed to fetch vulnerabilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVulnerabilities();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 font-mono flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          RECENT CRITICAL ALERTS
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-cyan-400 font-mono">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4 font-mono flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        RECENT CRITICAL ALERTS
      </h3>
      <div className="space-y-3">
        {vulnerabilities.map((vuln: any) => (
          <div 
            key={vuln.id} 
            className="bg-gray-800 border border-red-500/30 rounded p-4 hover:border-red-400 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-red-400 font-mono text-xs font-bold">{vuln.id}</span>
                  <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                    vuln.severity === 'critical' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {vuln.severity.toUpperCase()}
                  </span>
                  <span className="text-cyan-400 font-mono text-xs">CVSS: {vuln.cvss}</span>
                </div>
                <p className="text-white font-medium mt-2">{vuln.title}</p>
                <p className="text-gray-400 text-sm mt-1 font-mono">Device: {vuln.device}</p>
              </div>
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-sm transition-all">
                INVESTIGATE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlerts;