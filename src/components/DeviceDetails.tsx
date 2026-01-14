import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, Wifi, Activity, AlertTriangle, Play, Download, 
  Edit, Trash2, RefreshCw, CheckCircle, Clock, Calendar 
} from 'lucide-react';
import { devicesApi, scansApi } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

interface Device {
  id: string;
  name: string;
  type: string;
  ip: string;
  manufacturer?: string;
  model?: string;
  firmware?: string;
  location?: string;
  status: 'online' | 'offline' | 'scanning';
  risk: 'low' | 'medium' | 'high' | 'critical';
  lastScan?: string;
  vulnerabilities?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditHistory {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed';
  vulnerabilitiesFound: number;
  riskScore: number;
}

export default function DeviceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [device, setDevice] = useState<Device | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDeviceDetails();
      fetchAuditHistory();
    }
  }, [id]);

  const fetchDeviceDetails = async () => {
    setIsLoading(true);
    try {
      const response = await devicesApi.getById(id!);
      setDevice(response.data);
    } catch (error) {
      console.error('Error fetching device:', error);
      showError('Error', 'Failed to load device details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditHistory = async () => {
    try {
      const response = await scansApi.getAll({ deviceId: id });
      setAuditHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching audit history:', error);
    }
  };

  const handleRunAudit = async () => {
    setIsRunningAudit(true);
    try {
      await scansApi.create({
        deviceId: id!,
        scanType: 'full',
      });
      
      showSuccess('Audit Started', `Security audit for ${device?.name} has been initiated`);
      fetchDeviceDetails();
      fetchAuditHistory();
    } catch (error) {
      console.error('Error starting audit:', error);
      showError('Audit Failed', 'Failed to start security audit');
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await devicesApi.delete(id!);
      
      showSuccess('Device Deleted', `${device?.name} has been removed successfully`);
      navigate('/devices');
    } catch (error) {
      console.error('Error deleting device:', error);
      showError('Delete Failed', 'Failed to delete device');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500';
    }
  };

  const getStatusIcon = () => {
    if (device?.status === 'scanning') {
      return <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />;
    }
    return device?.status === 'online' 
      ? <Wifi className="w-6 h-6 text-green-500" />
      : <Wifi className="w-6 h-6 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 mt-4">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Device not found</p>
          <button
            onClick={() => navigate('/devices')}
            className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono transition-all"
          >
            Back to Devices
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
            <h1 className="text-3xl font-bold text-white font-mono">{device.name}</h1>
            <p className="text-gray-400 mt-1">{device.type}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/devices/${id}/edit`)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-mono transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Connection</span>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className={`font-bold uppercase text-sm ${
                  device.status === 'online' ? 'text-green-500' : 
                  device.status === 'scanning' ? 'text-cyan-400' : 'text-gray-500'
                }`}>
                  {device.status}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Risk Level</span>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${getRiskColor(device.risk)}`}>
                {device.risk}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Vulnerabilities</span>
              <span className="text-red-400 font-bold">{device.vulnerabilities || 0}</span>
            </div>
          </div>
        </div>

        {/* Device Info Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Device Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">IP Address</span>
              <p className="text-white font-mono">{device.ip}</p>
            </div>
            {device.manufacturer && (
              <div>
                <span className="text-gray-400 text-sm">Manufacturer</span>
                <p className="text-white">{device.manufacturer}</p>
              </div>
            )}
            {device.firmware && (
              <div>
                <span className="text-gray-400 text-sm">Firmware Version</span>
                <p className="text-white font-mono">{device.firmware}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handleRunAudit}
              disabled={isRunningAudit || device.status === 'scanning'}
              className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRunningAudit || device.status === 'scanning' ? (
                <>
                  <Activity className="w-5 h-5 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Security Audit
                </>
              )}
            </button>
            <button
              onClick={() => navigate(`/devices/${id}/vulnerabilities`)}
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              View Vulnerabilities
            </button>
            <button
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Audit History */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Audit History</h3>
          <button
            onClick={fetchAuditHistory}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {auditHistory.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No audit history available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditHistory.map(audit => (
              <div
                key={audit.id}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {audit.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {audit.status === 'running' && (
                        <Activity className="w-5 h-5 text-cyan-400 animate-spin" />
                      )}
                      {audit.status === 'failed' && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`font-bold uppercase text-sm ${
                        audit.status === 'completed' ? 'text-green-500' :
                        audit.status === 'running' ? 'text-cyan-400' :
                        'text-red-500'
                      }`}>
                        {audit.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(audit.startedAt).toLocaleString()}
                      </div>
                      {audit.status === 'completed' && (
                        <>
                          <div>Vulnerabilities: <span className="text-red-400 font-bold">{audit.vulnerabilitiesFound}</span></div>
                          <div>Risk Score: <span className="text-orange-400 font-bold">{audit.riskScore}</span></div>
                        </>
                      )}
                    </div>
                  </div>
                  {audit.status === 'completed' && (
                    <button
                      onClick={() => navigate(`/scans/${audit.id}`)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-sm transition-all"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-bold text-white">{device.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-mono transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}