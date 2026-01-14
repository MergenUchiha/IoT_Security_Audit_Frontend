import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Filter, Calendar, RefreshCw, Trash2 } from 'lucide-react';
import { reportsApi } from '../services/api';
import { useNotification } from '../components/NotificationCenter';

interface Report {
  id: string;
  title: string;
  type: 'audit' | 'vulnerability' | 'compliance' | 'summary';
  deviceName?: string;
  deviceId?: string;
  createdAt: string;
  fileSize: string;
  status: 'completed' | 'generating' | 'failed';
  format: 'pdf' | 'csv' | 'json';
}

export default function Reports() {
  const { showSuccess, showError, showInfo } = useNotification();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, selectedType, selectedFormat, dateRange]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await reportsApi.getAll();
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showError('Error', 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (selectedType !== 'all') {
      filtered = filtered.filter(r => r.type === selectedType);
    }

    if (selectedFormat !== 'all') {
      filtered = filtered.filter(r => r.format === selectedFormat);
    }

    if (dateRange.from) {
      filtered = filtered.filter(r => new Date(r.createdAt) >= new Date(dateRange.from));
    }

    if (dateRange.to) {
      filtered = filtered.filter(r => new Date(r.createdAt) <= new Date(dateRange.to));
    }

    setFilteredReports(filtered);
  };

  const handleDownloadReport = async (reportId: string, title: string, format: string) => {
    try {
      showInfo('Downloading', 'Preparing your report...');
      
      const response = await reportsApi.downloadPdf(reportId);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccess('Download Complete', 'Report has been downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      showError('Download Failed', 'Failed to download report');
    }
  };

  const handleViewReport = (reportId: string) => {
    window.open(`/reports/${reportId}`, '_blank');
  };

  const handleDeleteReport = async (reportId: string, title: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"?`);
    
    if (!confirmDelete) return;

    try {
      showInfo('Deleting', 'Removing report...');
      
      setReports(prev => prev.filter(r => r.id !== reportId));
      
      showSuccess('Deleted', 'Report has been removed successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      showError('Delete Failed', 'Failed to delete report');
    }
  };

  const handleGenerateReport = async (type: string) => {
    try {
      showInfo('Generating Report', 'Please wait while we generate your report...');
      
      const response = await reportsApi.generate(type);

      if (response.data) {
        showSuccess('Report Generated', 'Your report is ready!');
        fetchReports();
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showError('Generation Failed', 'Failed to generate report');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audit': return 'text-cyan-400 bg-cyan-500/10';
      case 'vulnerability': return 'text-red-400 bg-red-500/10';
      case 'compliance': return 'text-green-400 bg-green-500/10';
      case 'summary': return 'text-purple-400 bg-purple-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'generating': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-mono flex items-center gap-3">
            <FileText className="w-8 h-8 text-cyan-500" />
            Reports
          </h1>
          <p className="text-gray-400 mt-2">View and download security reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchReports}
            disabled={isLoading}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="relative group">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-mono transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              Generate Report
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleGenerateReport('audit')}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-t-lg transition-colors"
              >
                Audit Report
              </button>
              <button
                onClick={() => handleGenerateReport('vulnerability')}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
              >
                Vulnerability Report
              </button>
              <button
                onClick={() => handleGenerateReport('compliance')}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
              >
                Compliance Report
              </button>
              <button
                onClick={() => handleGenerateReport('summary')}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-b-lg transition-colors"
              >
                Summary Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="audit">Audit</option>
              <option value="vulnerability">Vulnerability</option>
              <option value="compliance">Compliance</option>
              <option value="summary">Summary</option>
            </select>
          </div>

          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="all">All Formats</option>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {(dateRange.from || dateRange.to) && (
            <button
              onClick={() => setDateRange({ from: '', to: '' })}
              className="text-cyan-400 hover:text-cyan-300 text-sm underline"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 mt-4">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No reports found</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div
              key={report.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-500 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getTypeColor(report.type)}`}>
                      {report.type}
                    </span>
                    <span className={`text-xs font-bold uppercase ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className="text-gray-400 text-xs uppercase">{report.format}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{report.title}</h3>
                  {report.deviceName && (
                    <p className="text-gray-400 text-sm mb-2">Device: {report.deviceName}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Created: {new Date(report.createdAt).toLocaleString()}</span>
                    <span>Size: {report.fileSize}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {report.status === 'completed' && (
                    <>
                      <button
                        onClick={() => handleDownloadReport(report.id, report.title, report.format)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-sm transition-all flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleViewReport(report.id)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-cyan-400 rounded font-mono text-sm transition-all border border-cyan-400 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id, report.title)}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded font-mono text-sm transition-all border border-red-400/50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {report.status === 'generating' && (
                    <div className="px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded font-mono text-sm flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </div>
                  )}
                  {report.status === 'failed' && (
                    <div className="px-4 py-2 bg-red-600/20 text-red-400 rounded font-mono text-sm">
                      Failed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}