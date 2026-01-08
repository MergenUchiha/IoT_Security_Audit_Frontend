import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, FileCheck, Shield } from 'lucide-react';
import { reportsApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

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
  const { t } = useTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

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
        return 'bg-cyan-500/20 accent-cyan border-cyan-500';
      case 'executive':
        return 'bg-purple-500/20 text-purple-400 border-purple-500';
      case 'compliance':
        return 'bg-green-500/20 accent-green border-green-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary font-mono flex items-center gap-3">
          <FileText className="w-8 h-8 accent-cyan" />
          {t.reports.title}
        </h1>
        <button
          onClick={() => handleGenerateReport('technical')}
          disabled={generating}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileCheck className="w-5 h-5" />
          {generating ? t.reports.generating : t.reports.generateNew}
        </button>
      </div>

      {/* Generation Progress */}
      {generating && (
        <div className="bg-primary border border-cyan-500 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="accent-cyan font-mono font-bold">{t.reports.generatingReport}</span>
            <span className="text-primary font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-tertiary rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-green-500 h-full transition-all duration-100 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <div className="mt-3 space-y-1 text-sm font-mono text-tertiary">
            <p>{t.reports.analyzingDevices}</p>
            <p>{t.reports.compilingData}</p>
            <p>{t.reports.generatingRecommendations}</p>
            <p>{t.reports.creatingVisualizations}</p>
          </div>
        </div>
      )}

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary border border-primary rounded-lg p-6 hover:border-cyan-400 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <FileText className="w-6 h-6 accent-cyan" />
            </div>
            <div>
              <h3 className="text-primary font-bold font-mono">{t.reports.technical}</h3>
              <p className="text-tertiary text-sm">{t.reports.technicalDesc}</p>
            </div>
          </div>
          <p className="text-tertiary text-sm mb-4">
            {t.reports.technicalFull}
          </p>
          <button 
            onClick={() => handleGenerateReport('technical')}
            disabled={generating}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono font-bold transition-all disabled:opacity-50"
          >
            {t.reports.create}
          </button>
        </div>

        <div className="bg-primary border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <FileCheck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-primary font-bold font-mono">{t.reports.executive}</h3>
              <p className="text-tertiary text-sm">{t.reports.executiveDesc}</p>
            </div>
          </div>
          <p className="text-tertiary text-sm mb-4">
            {t.reports.executiveFull}
          </p>
          <button 
            onClick={() => handleGenerateReport('executive')}
            disabled={generating}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-mono font-bold transition-all disabled:opacity-50"
          >
            {t.reports.create}
          </button>
        </div>

        <div className="bg-primary border border-green-500/30 rounded-lg p-6 hover:border-green-400 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Shield className="w-6 h-6 accent-green" />
            </div>
            <div>
              <h3 className="text-primary font-bold font-mono">{t.reports.compliance}</h3>
              <p className="text-tertiary text-sm">{t.reports.complianceDesc}</p>
            </div>
          </div>
          <p className="text-tertiary text-sm mb-4">
            {t.reports.complianceFull}
          </p>
          <button 
            onClick={() => handleGenerateReport('compliance')}
            disabled={generating}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-mono font-bold transition-all disabled:opacity-50"
          >
            {t.reports.create}
          </button>
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="bg-primary border border-primary rounded-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-mono">{t.reports.generated}</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="accent-cyan font-mono">{t.reports.loadingReports}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-secondary border border-secondary rounded-lg p-4 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="accent-cyan font-mono text-sm font-bold">{report.id}</span>
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold border ${getTypeColor(report.type)}`}>
                        {report.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        report.status === 'final'
                          ? 'bg-green-500/20 accent-green border border-green-500'
                          : 'bg-yellow-500/20 accent-yellow border border-yellow-500'
                      }`}>
                        {t.reports.status[report.status]}
                      </span>
                    </div>
                    <h4 className="text-primary font-medium mb-2">{report.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-tertiary font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                      <span>•</span>
                      <span>{report.devices} {t.reports.devices}</span>
                      <span>•</span>
                      <span>{report.vulnerabilities} vulnerabilities</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-sm transition-all flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      {t.reports.pdf}
                    </button>
                    <button className="px-4 py-2 bg-tertiary hover:bg-secondary text-primary rounded font-mono text-sm transition-all border border-primary">
                      {t.reports.view}
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