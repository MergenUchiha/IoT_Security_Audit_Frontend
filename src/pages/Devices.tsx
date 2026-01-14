import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Search, Activity, Eye } from 'lucide-react';
import DeviceCard from '../components/Devices/DeviceCard';
import DeviceModal from '../components/Devices/DeviceModal';
import { devicesApi, scansApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Device } from '../types';

const Devices = () => {
  const { t } = useTheme();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [auditingDevices, setAuditingDevices] = useState<Set<number>>(new Set());
  const [scanningMessage, setScanningMessage] = useState('');
  const { on, off } = useWebSocket();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await devicesApi.getAll();
      const transformedDevices = response.data.map((device: any) => ({
        id: device.id,
        name: device.name,
        ip: device.ip,
        type: device.type,
        status: device.status,
        risk: device.risk,
        vulnerabilities: device.vulnerabilities || device._count?.deviceVulns || 0,
        lastScan: device.lastScan 
          ? new Date(device.lastScan).toLocaleString()
          : 'Never',
        manufacturer: device.manufacturer,
        firmware: device.firmware,
        ports: device.ports || [],
        services: device.services || [],
      }));
      setDevices(transformedDevices);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      showError('Error', 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  // Listen for scan updates via WebSocket
  useEffect(() => {
    const handleScanCompleted = (data: any) => {
      console.log('✅ Scan completed:', data);
      const deviceId = parseInt(data.deviceId);
      
      if (auditingDevices.has(deviceId)) {
        setAuditingDevices(prev => {
          const newSet = new Set(prev);
          newSet.delete(deviceId);
          return newSet;
        });
        
        showSuccess(
          'Scan Completed',
          `${data.deviceName || 'Device'} scan finished. ${data.vulnerabilitiesFound || 0} vulnerabilities found.`
        );
        
        // Show view results button
        setTimeout(() => {
          const viewResults = confirm(`View scan results for ${data.deviceName}?`);
          if (viewResults) {
            navigate(`/scans/${data.scanId}`);
          }
        }, 1000);
        
        fetchDevices();
      }
    };

    const handleScanUpdate = (data: any) => {
      console.log('🔄 Scan update:', data);
      const deviceId = parseInt(data.deviceId);
      
      if (auditingDevices.has(deviceId) && data.phases?.phases) {
        const phases = data.phases.phases;
        const completedPhases = phases.filter((p: any) => p.status === 'completed').length;
        const totalPhases = phases.length;
        setScanningMessage(`${completedPhases}/${totalPhases} phases completed`);
      }
    };

    on('scanCompleted', handleScanCompleted);
    on('scanUpdate', handleScanUpdate);

    return () => {
      off('scanCompleted', handleScanCompleted);
      off('scanUpdate', handleScanUpdate);
    };
  }, [auditingDevices, on, off, navigate, showSuccess]);

  const handleScanNetwork = () => {
    setScanning(true);
    setScanProgress(0);
    
    const messages = [
      'Initializing network scan...',
      'Discovering devices on network...',
      'Analyzing network topology...',
      'Identifying active hosts...',
      'Enumerating services...',
      'Completing scan...',
    ];
    
    let messageIndex = 0;
    
    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        setScanningMessage(messages[messageIndex]);
        messageIndex++;
      }
    }, 800);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          clearInterval(messageInterval);
          setTimeout(() => {
            setScanning(false);
            setScanningMessage('');
            showInfo('Scan Complete', 'Network scan completed successfully');
            fetchDevices();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleStartAudit = async (device: Device) => {
    try {
      setAuditingDevices(prev => new Set(prev).add(device.id));
      
      showInfo('Starting Audit', `Initiating security scan for ${device.name}...`);
      
      console.log('🔍 Starting audit for device:', device.id);
      const response = await scansApi.create({
        deviceId: device.id.toString(),
        scanType: 'full',
      });
      
      console.log('✅ Audit started:', response.data);
      
      showSuccess(
        'Audit Started',
        `Scanning ${device.name}. This may take a few minutes...`
      );
      
    } catch (error: any) {
      console.error('❌ Failed to start audit:', error);
      setAuditingDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(device.id);
        return newSet;
      });
      showError(
        'Audit Failed',
        error.response?.data?.message || 'Failed to start audit. Please try again.'
      );
    }
  };

  const handleViewScanResults = async (device: Device) => {
    try {
      // Find the most recent scan for this device
      const response = await scansApi.getAll({ deviceId: device.id.toString() });
      const scans = response.data;
      
      if (scans && scans.length > 0) {
        const latestScan = scans[0];
        navigate(`/scans/${latestScan.id}`);
      } else {
        showInfo('No Results', 'No scan results available for this device yet.');
      }
    } catch (error) {
      console.error('Failed to fetch scans:', error);
      showError('Error', 'Failed to load scan results');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary font-mono flex items-center gap-3">
          <Network className="w-8 h-8 accent-cyan" />
          {t.devices.title}
        </h1>
        <button 
          onClick={handleScanNetwork}
          disabled={scanning}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
        >
          <Search className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? t.devices.scanning : t.devices.scanNetwork}
        </button>
      </div>

      {/* Active Scans Indicator */}
      {auditingDevices.size > 0 && (
        <div className="bg-cyan-900/30 border border-cyan-500 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 accent-cyan animate-pulse" />
            <div className="flex-1">
              <p className="accent-cyan font-mono font-bold">
                {auditingDevices.size} Active Audit{auditingDevices.size > 1 ? 's' : ''} in Progress
              </p>
              <p className="text-tertiary text-sm font-mono">{scanningMessage}</p>
            </div>
          </div>
        </div>
      )}

      {scanning && (
        <div className="bg-primary border border-cyan-500 rounded-lg p-6 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <span className="accent-cyan font-mono font-bold">{t.devices.scanningProgress}</span>
            <span className="text-primary font-mono">{scanProgress}%</span>
          </div>
          <div className="w-full bg-tertiary rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-green-500 h-full transition-all duration-100 relative"
              style={{ width: `${scanProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-tertiary text-sm font-mono mt-2">
            {scanningMessage || t.devices.discoveringDevices}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="accent-cyan font-mono">{t.devices.loadingDevices}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div key={device.id} className="relative">
                <DeviceCard 
                  device={device} 
                  onClick={setSelectedDevice}
                  onStartAudit={handleStartAudit}
                  isAuditing={auditingDevices.has(device.id)}
                />
                {device.lastScan !== 'Never' && (
                  <button
                    onClick={() => handleViewScanResults(device)}
                    className="absolute top-2 right-2 p-2 bg-gray-800/90 hover:bg-gray-700 border border-cyan-500 rounded-lg transition-all z-10"
                    title="View scan results"
                  >
                    <Eye className="w-4 h-4 text-cyan-400" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {devices.length === 0 && (
            <div className="text-center py-20">
              <Network className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-mono">No devices found. Click "Scan Network" to discover devices.</p>
            </div>
          )}
        </>
      )}

      <DeviceModal 
        device={selectedDevice} 
        onClose={() => setSelectedDevice(null)} 
      />
    </div>
  );
};

export default Devices;