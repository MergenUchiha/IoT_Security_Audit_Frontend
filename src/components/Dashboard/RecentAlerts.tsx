import { useState, useEffect } from 'react';
import { AlertTriangle, Eye } from 'lucide-react';
import { vulnerabilitiesApi } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import type { Vulnerability } from '../../types';

const RecentAlerts = () => {
  const { t } = useTheme();
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        const response = await vulnerabilitiesApi.getAll();
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

  const handleInvestigate = (vuln: Vulnerability) => {
    console.log('Investigating vulnerability:', vuln.id);
    
    // Create detailed investigation report
    const report = `
VULNERABILITY INVESTIGATION REPORT
==================================

CVE ID: ${vuln.id}
Title: ${vuln.title}
Severity: ${vuln.severity.toUpperCase()}
CVSS Score: ${vuln.cvss}

DESCRIPTION:
${vuln.description}

IMPACT:
${vuln.impact}

RECOMMENDED ACTION:
${vuln.solution}

AFFECTED DEVICES:
${vuln.deviceVulns?.map(dv => `- ${dv.device?.name || 'Unknown'}`).join('\n') || 'No devices linked'}

DISCOVERED: ${vuln.discovered}
STATUS: ${vuln.status || vuln.deviceVulns?.[0]?.status || 'Unknown'}
    `.trim();

    alert(report);
  };

  if (loading) {
    return (
      <div className="bg-primary border border-primary rounded-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-mono flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 accent-red" />
          {t.dashboard.recentAlerts}
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="accent-cyan font-mono">{t.common.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary border border-primary rounded-lg p-6">
      <h3 className="text-lg font-bold text-primary mb-4 font-mono flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 accent-red" />
        {t.dashboard.recentAlerts}
      </h3>
      <div className="space-y-3">
        {vulnerabilities.map((vuln: any) => (
          <div 
            key={vuln.id} 
            className="bg-secondary border border-red-500/30 rounded p-4 hover:border-red-400 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="accent-red font-mono text-xs font-bold">{vuln.id}</span>
                  <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                    vuln.severity === 'critical' ? 'bg-red-500/20 accent-red border border-red-500' :
                    vuln.severity === 'high' ? 'bg-orange-500/20 accent-orange border border-orange-500' :
                    vuln.severity === 'medium' ? 'bg-yellow-500/20 accent-yellow border border-yellow-500' :
                    vuln.severity === 'low' ? 'bg-green-500/20 accent-green border border-green-500' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500'
                  }`}>
                    {t.risk[vuln.severity as keyof typeof t.risk]}
                  </span>
                  <span className="accent-cyan font-mono text-xs">{t.vulnerabilities.cvss}: {vuln.cvss}</span>
                </div>
                <p className="text-primary font-medium mt-2">{vuln.title}</p>
                <p className="text-tertiary text-sm mt-1 font-mono">
                  {t.vulnerabilities.device}: {vuln.deviceVulns?.[0]?.device?.name || 'Multiple devices'}
                </p>
              </div>
              <button 
                onClick={() => handleInvestigate(vuln)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-sm transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 opacity-0 group-hover:opacity-100"
              >
                <Eye className="w-4 h-4" />
                {t.dashboard.investigate}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlerts;