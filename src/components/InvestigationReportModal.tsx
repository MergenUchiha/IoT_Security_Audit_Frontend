import { X, AlertTriangle, Shield, Download, Copy, Check, Calendar, Activity } from 'lucide-react';
import { useState } from 'react';
import type { Vulnerability } from '../types';

interface InvestigationReportModalProps {
  vulnerability: Vulnerability | null;
  onClose: () => void;
}

export const InvestigationReportModal = ({ vulnerability, onClose }: InvestigationReportModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!vulnerability) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-red-500/20 text-red-400 border-red-500',
          glow: 'shadow-red-500/50',
          accent: 'text-red-400',
          border: 'border-red-500/50',
        };
      case 'high':
        return {
          badge: 'bg-orange-500/20 text-orange-400 border-orange-500',
          glow: 'shadow-orange-500/50',
          accent: 'text-orange-400',
          border: 'border-orange-500/50',
        };
      case 'medium':
        return {
          badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
          glow: 'shadow-yellow-500/50',
          accent: 'text-yellow-400',
          border: 'border-yellow-500/50',
        };
      case 'low':
        return {
          badge: 'bg-green-500/20 text-green-400 border-green-500',
          glow: 'shadow-green-500/50',
          accent: 'text-green-400',
          border: 'border-green-500/50',
        };
      default:
        return {
          badge: 'bg-gray-500/20 text-gray-400 border-gray-500',
          glow: 'shadow-gray-500/50',
          accent: 'text-gray-400',
          border: 'border-gray-500/50',
        };
    }
  };

  const colors = getSeverityColor(vulnerability.severity);

  const generateReport = () => {
    const devices = vulnerability.deviceVulns?.map(dv => `- ${dv.device?.name || 'Unknown'}`).join('\n') || '- No devices linked';
    
    return `VULNERABILITY INVESTIGATION REPORT
${'='.repeat(50)}

CVE ID: ${vulnerability.id}
Title: ${vulnerability.title}
Severity: ${vulnerability.severity.toUpperCase()}
CVSS Score: ${vulnerability.cvss}

DESCRIPTION:
${vulnerability.description}

IMPACT:
${vulnerability.impact}

RECOMMENDED ACTION:
${vulnerability.solution}

AFFECTED DEVICES:
${devices}

DISCOVERED: ${vulnerability.discovered}
STATUS: ${vulnerability.status || vulnerability.deviceVulns?.[0]?.status || 'Unknown'}

${'='.repeat(50)}
Generated: ${new Date().toISOString()}`;
  };

  const handleCopyReport = () => {
    const report = generateReport();
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vulnerability.id}_investigation_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className={`bg-gray-900 border-2 ${colors.border} rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl ${colors.glow} animate-slideUp`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r from-gray-800 to-gray-900 border-b-2 ${colors.border} px-6 py-4`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ${colors.border} border-2`}>
                <Shield className={`w-8 h-8 ${colors.accent}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
                  VULNERABILITY INVESTIGATION REPORT
                </h2>
                <p className="text-gray-400 text-sm mt-1 font-mono">
                  Security Analysis & Threat Assessment
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* CVE Header */}
          <div className={`bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-2 ${colors.border} rounded-lg p-6 mb-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <AlertTriangle className={`w-12 h-12 ${colors.accent} animate-pulse`} />
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-3xl font-bold ${colors.accent} font-mono`}>
                      {vulnerability.id}
                    </span>
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase border-2 ${colors.badge}`}>
                      {vulnerability.severity}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{vulnerability.title}</h3>
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-sm mb-1">CVSS Score</div>
                <div className={`text-4xl font-bold ${colors.accent} font-mono`}>
                  {vulnerability.cvss}
                </div>
              </div>
            </div>
          </div>

          {/* Report Sections */}
          <div className="space-y-4">
            {/* Description */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 hover:border-cyan-500/50 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-cyan-500 rounded-full"></div>
                <h4 className="text-cyan-400 font-bold font-mono uppercase text-sm tracking-wider">
                  Description
                </h4>
              </div>
              <p className="text-gray-300 leading-relaxed pl-4">
                {vulnerability.description}
              </p>
            </div>

            {/* Impact */}
            <div className={`bg-red-500/5 border-2 ${colors.border} rounded-lg p-5 hover:shadow-lg hover:${colors.glow} transition-all`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-1 h-6 ${colors.accent} bg-current rounded-full`}></div>
                <h4 className={`${colors.accent} font-bold font-mono uppercase text-sm tracking-wider`}>
                  Impact Assessment
                </h4>
              </div>
              <p className={`${colors.accent} font-semibold pl-4`}>
                {vulnerability.impact}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="bg-green-500/5 border-2 border-green-500/50 rounded-lg p-5 hover:border-green-500 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h4 className="text-green-400 font-bold font-mono uppercase text-sm tracking-wider">
                  Recommended Action
                </h4>
              </div>
              <p className="text-green-300 font-semibold pl-4">
                {vulnerability.solution}
              </p>
            </div>

            {/* Affected Devices */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 hover:border-purple-500/50 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h4 className="text-purple-400 font-bold font-mono uppercase text-sm tracking-wider">
                  Affected Devices
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-4">
                {vulnerability.deviceVulns && vulnerability.deviceVulns.length > 0 ? (
                  vulnerability.deviceVulns.map((dv, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-mono text-sm border border-purple-500/50 hover:bg-purple-500/30 transition-all"
                    >
                      {dv.device?.name || 'Unknown Device'}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No devices linked</span>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-400 text-sm font-mono uppercase">Discovered</span>
                </div>
                <p className="text-white font-bold font-mono pl-6">
                  {new Date(vulnerability.discovered).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-400 text-sm font-mono uppercase">Status</span>
                </div>
                <p className={`font-bold font-mono pl-6 uppercase ${
                  (vulnerability.status || vulnerability.deviceVulns?.[0]?.status) === 'open' ? 'text-red-400' :
                  (vulnerability.status || vulnerability.deviceVulns?.[0]?.status) === 'patched' ? 'text-green-400' :
                  'text-yellow-400'
                }`}>
                  {vulnerability.status || vulnerability.deviceVulns?.[0]?.status || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Generated Timestamp */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs font-mono">
              Report Generated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`bg-gradient-to-r from-gray-800 to-gray-900 border-t-2 ${colors.border} px-6 py-4`}>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCopyReport}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-mono font-bold transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Report
                </>
              )}
            </button>
            
            <button
              onClick={handleDownloadReport}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono font-bold transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>

            <button
              onClick={onClose}
              className={`px-6 py-3 border-2 ${colors.border} ${colors.accent} bg-gray-800 hover:bg-gray-700 rounded-lg font-mono font-bold transition-all hover:scale-105 active:scale-95`}
            >
              Close Investigation
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};