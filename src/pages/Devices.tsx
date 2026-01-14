import { useState, useEffect } from 'react';
import { Network, Search, Activity } from 'lucide-react';
import DeviceCard from '../components/Devices/DeviceCard';
import DeviceModal from '../components/Devices/DeviceModal';
import { devicesApi, scansApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Device } from '../types';

const Devices = () => {
  const { t } = useTheme();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [auditingDeviceId, setAuditingDeviceId] = useState<number | null>(null);
  const [scanningMessage, setScanningMessage] = useState('');
  const { on, off } = useWebSocket();

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Listen for scan updates via WebSocket
  useEffect(() => {
    const handleScanProgress = (data: any) => {
      console.log('Scan progress update:', data);
      if (data.deviceId && parseInt(data.deviceId) === auditingDeviceId) {
        setScanningMessage(`Scanning: ${data.status} (${data.progress}%)`);
      }
    };

    const handleScanCompleted = (data: any) => {
      console.log('Scan completed:', data);
      if (data.deviceId && parseInt(data.deviceId) === auditingDeviceId) {
        setAuditingDeviceId(null);
        setScanningMessage('');
        alert(`Scan completed for device ${data.deviceId}`);
      }
    };

    on('scanProgress', handleScanProgress);
    on('scanCompleted', handleScanCompleted);

    return () => {
      off('scanProgress', handleScanProgress);
      off('scanCompleted', handleScanCompleted);
    };
  }, [auditingDeviceId, on, off]);

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
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleStartAudit = async (device: Device) => {
    try {
      setAuditingDeviceId(device.id);
      setScanningMessage(`Starting audit for ${device.name}...`);
      
      console.log('Starting audit for device:', device.id);
      const response = await scansApi.create({
        deviceId: device.id.toString(),
        scanType: 'full',
      });
      
      console.log('Audit started:', response.data);
      setScanningMessage(`Audit in progress for ${device.name}...`);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg font-mono z-50 animate-pulse';
      notification.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <div>
            <div class="font-bold">Audit Started</div>
            <div class="text-sm">Scanning ${device.name}...</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 5000);
      
    } catch (error) {
      console.error('Failed to start audit:', error);
      setAuditingDeviceId(null);
      setScanningMessage('');
      alert('Failed to start audit. Please try again.');
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

      {/* Active Scan Indicator */}
      {auditingDeviceId && (
        <div className="bg-cyan-900/30 border border-cyan-500 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 accent-cyan animate-pulse" />
            <div className="flex-1">
              <p className="accent-cyan font-mono font-bold">Active Audit in Progress</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard 
              key={device.id} 
              device={device} 
              onClick={setSelectedDevice}
              onStartAudit={handleStartAudit}
              isAuditing={auditingDeviceId === device.id}
            />
          ))}
        </div>
      )}

      <DeviceModal 
        device={selectedDevice} 
        onClose={() => setSelectedDevice(null)} 
      />
    </div>
  );
};

export default Devices;