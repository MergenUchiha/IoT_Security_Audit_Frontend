import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Activity, CheckCircle, XCircle, Clock, 
  AlertTriangle, FileText, Download, Share2 
} from 'lucide-react';
import { scansApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../components/NotificationCenter';

interface ScanPhase {
  phase: string;
  progress: number;
  status: 'completed' | 'running' | 'pending' | 'failed';
  time: string;
}

interface ScanResult {
  id: string;
  deviceId: string;
  device: {
    name: string;
    ip: string;
    type: string;
  };
  type: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number;
  phases: {
    phases: ScanPhase[];
  };
  findings: Array<{
    id: string;
    vulnerability: {
      id: string;
      title: string;
      severity: string;
      cvss: number;
    };
    details: string;
  }>;
}

export default function ScanResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTheme();
  const { showSuccess, showError } = useNotification();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchScanResults();
    }
  }, [id]);

  const fetchScanResults = async () => {
    try {
      const response = await scansApi.getById(id!);
      setScan(response.data);
    } catch (error) {
      console.error('Failed to fetch scan results:', error);
      showError('Error', 'Failed to load scan results');
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = () => {
    if (!scan) return;

    const exportData = {
      scanId: scan.id,
      device: scan.device,
      startTime: scan.startTime,
      endTime: scan.endTime,
      duration: scan.duration,
      status: scan.status,
      phases: scan.phases.phases,
      findings: scan.findings,
      summary: {
        totalPhases: scan.phases.phases.length,
        completedPhases: scan.phases.phases.filter(p => p.status === 'completed').length,
        vulnerabilitiesFound: scan.findings.length,
        critical: scan.findings.filter(f => f.vulnerability.severity === 'critical').length,
        high: scan.findings.filter(f => f.vulnerability.severity === 'high').length,
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `scan_${scan.id}_results.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showSuccess('Export Complete', 'Scan results exported successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'running':
        return <Activity className="w-6 h-6 text-cyan-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/10 border-green-500';
      case 'running':
        return 'text-cyan-500 bg-cyan-500/10 border-cyan-500';
      case 'failed':
        return 'text-red-500 bg-red-500/10 border-red-500';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
      case 'low':
        return 'text-green-500 bg-green-500/10 border-green-500';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-mono">Scan not found</p>
          <button
            onClick={() => navigate('/scans')}
            className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono transition"
          >
            Back to Scans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/devices')}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white font-mono flex items-center gap-3">
              {getStatusIcon(scan.status)}
              Scan Results
            </h1>
            <p className="text-gray-400 mt-1">
              {scan.device.name} ({scan.device.ip})
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportResults}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono transition flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Status</p>
          <p className={`text-2xl font-bold font-mono capitalize ${
            scan.status === 'completed' ? 'text-green-500' :
            scan.status === 'running' ? 'text-cyan-500' :
            scan.status === 'failed' ? 'text-red-500' :
            'text-gray-500'
          }`}>
            {scan.status}
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Duration</p>
          <p className="text-2xl font-bold text-white font-mono">
            {scan.duration ? `${scan.duration}s` : '-'}
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Vulnerabilities Found</p>
          <p className="text-2xl font-bold text-red-500 font-mono">
            {scan.findings.length}
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Phases Completed</p>
          <p className="text-2xl font-bold text-white font-mono">
            {scan.phases.phases.filter(p => p.status === 'completed').length}/{scan.phases.phases.length}
          </p>
        </div>
      </div>

      {/* Scan Phases */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 font-mono">Scan Phases</h3>
        <div className="space-y-3">
          {scan.phases.phases.map((phase, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {phase.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {phase.status === 'running' && <Activity className="w-5 h-5 text-cyan-500 animate-spin" />}
                  {phase.status === 'pending' && <Clock className="w-5 h-5 text-gray-500" />}
                  {phase.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                  <span className="text-white font-mono">{phase.phase}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${getPhaseStatusColor(phase.status)}`}>
                    {phase.status}
                  </span>
                  <span className="text-gray-400 font-mono text-sm">{phase.time}</span>
                  <span className="text-gray-400 font-mono text-sm">{phase.progress}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 ml-8">
                <div 
                  className={`h-full rounded-full transition-all ${
                    phase.status === 'completed' ? 'bg-green-500' :
                    phase.status === 'running' ? 'bg-cyan-500' :
                    phase.status === 'failed' ? 'bg-red-500' :
                    'bg-gray-600'
                  }`}
                  style={{ width: `${phase.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Findings */}
      {scan.findings.length > 0 && (
        <div className="bg-gray-800 border border-red-500/50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-bold text-white font-mono">
              Vulnerabilities Discovered ({scan.findings.length})
            </h3>
          </div>
          <div className="space-y-3">
            {scan.findings.map((finding) => (
              <div key={finding.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-cyan-400 font-mono text-sm font-bold">
                        {finding.vulnerability.id}
                      </span>
                      <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${getSeverityColor(finding.vulnerability.severity)}`}>
                        {finding.vulnerability.severity}
                      </span>
                      <span className="text-gray-400 font-mono text-sm">
                        CVSS: {finding.vulnerability.cvss}
                      </span>
                    </div>
                    <h4 className="text-white font-semibold mb-2">
                      {finding.vulnerability.title}
                    </h4>
                    <p className="text-gray-400 text-sm">{finding.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 font-mono">Timeline</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-gray-400 text-sm">Started</p>
              <p className="text-white font-mono">
                {new Date(scan.startTime).toLocaleString()}
              </p>
            </div>
          </div>
          {scan.endTime && (
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-white font-mono">
                  {new Date(scan.endTime).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}