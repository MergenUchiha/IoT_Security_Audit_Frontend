import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, FileCheck, Shield } from 'lucide-react';
import { reportsApi } from '../services/api';

interface Report {
  id: string;
  title: string;
  type: 'technical' | 'executive' | 'compliance';
  createdAt: string;
  devices: number;
  vulnerabilities: number;
  status: 'draft' | 'final';
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await reportsApi.getAll();
        setReports(response.data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleGenerateReport = async (type: 'technical' | 'executive' | 'compliance') => {
    setGenerating(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await reportsApi.generate(type);
      clearInterval(interval);
      setProgress(100);
      
      // Add new report to list
      setReports([response.data, ...reports]);
      
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Failed to generate report:', error);
      clearInterval(interval);
      setGenerating(false);
      setProgress(0);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500';
      case 'executive':
        return 'bg-purple-500/20 text-purple-400 border-purple-500';
      case 'compliance':
        return 'bg-green-500/20 text-green-400 border-green-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white font-mono flex items-center gap-3">
          <FileText className="w-8 h-8 text-cyan-400" />
          SECURITY REPORTS
        </h1>
        <button
          onClick={() => handleGenerateReport('technical')}
          disabled={generating}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileCheck className="w-5 h-5" />
          {generating ? 'GENERATING...' : 'GENERATE NEW REPORT'}
        </button>
      </div>

      {/* Generation Progress */}
      {generating && (
        <div className="bg-gray-900 border border-cyan-500 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-cyan-400 font-mono font-bold">GENERATING REPORT...</span>
            <span className="text-white font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-green-500 h-full transition-all duration-100 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <div className="mt-3 space-y-1 text-sm font-mono text-gray-400">
            <p>• Analyzing device security posture...</p>
            <p>• Compiling vulnerability data...</p>
            <p>• Generating recommendations...</p>
            <p>• Creating visualizations...</p>
          </div>
        </div>
      )}

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-bold font-mono">Technical Report</h3>
              <p className="text-gray-400 text-sm">Detailed technical analysis</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Comprehensive technical report including vulnerability details, CVE mappings, and remediation steps.
          </p>
          <button 
            onClick={() => handleGenerateReport('technical')}
            disabled={generating}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono font-bold transition-all disabled:opacity-50"
          >
            CREATE
          </button>
        </div>

        <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <FileCheck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-bold font-mono">Executive Summary</h3>
              <p className="text-gray-400 text-sm">High-level overview</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Executive-level summary with risk metrics, business impact, and strategic recommendations.
          </p>
          <button 
            onClick={() => handleGenerateReport('executive')}
            disabled={generating}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-mono font-bold transition-all disabled:opacity-50"
          >
            CREATE
          </button>
        </div>

        <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6 hover:border-green-400 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-bold font-mono">Compliance Report</h3>
              <p className="text-gray-400 text-sm">Standards & regulations</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Compliance assessment against OWASP IoT, NIST, ISO 27001, and other security standards.
          </p>
          <button 
            onClick={() => handleGenerateReport('compliance')}
            disabled={generating}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-mono font-bold transition-all disabled:opacity-50"
          >
            CREATE
          </button>
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 font-mono">GENERATED REPORTS</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-cyan-400 font-mono">Loading reports...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-cyan-400 font-mono text-sm font-bold">{report.id}</span>
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold border ${getTypeColor(report.type)}`}>
                        {report.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        report.status === 'final'
                          ? 'bg-green-500/20 text-green-400 border border-green-500'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                      }`}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-white font-medium mb-2">{report.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                      <span>•</span>
                      <span>{report.devices} devices</span>
                      <span>•</span>
                      <span>{report.vulnerabilities} vulnerabilities</span>
                    </div>
                  </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-sm transition-all flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono text-sm transition-all border border-cyan-500/30">
                    VIEW
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default Reports;