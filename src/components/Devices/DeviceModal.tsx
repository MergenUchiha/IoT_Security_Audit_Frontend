import { XCircle, Activity } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { scansApi } from '../../services/api';
import type { Device } from '../../types';

interface DeviceModalProps {
  device: Device | null;
  onClose: () => void;
}

const DeviceModal = ({ device, onClose }: DeviceModalProps) => {
  const { t } = useTheme();
  const [isScanning, setIsScanning] = useState(false);

  if (!device) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'accent-red';
      case 'high':
        return 'accent-orange';
      case 'medium':
        return 'accent-yellow';
      default:
        return 'accent-green';
    }
  };

  const handleStartAudit = async () => {
    try {
      setIsScanning(true);
      await scansApi.create({
        deviceId: device.id.toString(),
        scanType: 'full',
      });
      
      // Success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg font-mono z-[9999] animate-pulse';
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
        setIsScanning(false);
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Failed to start audit:', error);
      alert('Failed to start audit. Please try again.');
      setIsScanning(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-primary border-2 border-cyan-500 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary font-mono">{device.name}</h2>
          <button onClick={onClose} className="text-tertiary hover:text-primary transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-tertiary text-sm font-mono mb-1">{t.devices.ipAddress}</p>
              <p className="text-primary font-mono">{device.ip}</p>
            </div>
            <div>
              <p className="text-tertiary text-sm font-mono mb-1">{t.devices.status}</p>
              <p className="text-green-400 font-mono">{device.status.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-tertiary text-sm font-mono mb-1">{t.devices.deviceType}</p>
              <p className="text-primary font-mono">{device.type}</p>
            </div>
            <div>
              <p className="text-tertiary text-sm font-mono mb-1">{t.devices.manufacturer}</p>
              <p className="text-primary font-mono">{device.manufacturer}</p>
            </div>
            <div>
              <p className="text-tertiary text-sm font-mono mb-1">{t.devices.firmwareVersion}</p>
              <p className="accent-cyan font-mono">{device.firmware}</p>
            </div>
            <div>
              <p className="text-tertiary text-sm font-mono mb-1">{t.devices.riskLevel}</p>
              <p className={`font-mono font-bold ${getRiskColor(device.risk)}`}>
                {t.risk[device.risk]}
              </p>
            </div>
          </div>

          <div>
            <p className="text-tertiary text-sm font-mono mb-2">{t.devices.openPorts}</p>
            <div className="flex flex-wrap gap-2">
              {device.ports.map(port => (
                <span 
                  key={port} 
                  className="px-3 py-1 bg-cyan-500/20 accent-cyan rounded font-mono text-sm border border-cyan-500"
                >
                  {port}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-tertiary text-sm font-mono mb-2">{t.devices.detectedServices}</p>
            <div className="flex flex-wrap gap-2">
              {device.services.map(service => (
                <span 
                  key={service} 
                  className="px-3 py-1 bg-tertiary text-primary rounded font-mono text-sm border border-secondary"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-secondary">
            <p className="text-tertiary text-sm font-mono mb-1">{t.devices.vulnerabilitiesFound}</p>
            <p className="accent-red font-mono font-bold text-2xl">{device.vulnerabilities}</p>
          </div>

          <div className="pt-4 border-t border-secondary">
            <p className="text-tertiary text-sm font-mono mb-1">{t.devices.lastSecurityAudit}</p>
            <p className="text-primary font-mono">{device.lastScan}</p>
          </div>

          <button 
            onClick={handleStartAudit}
            disabled={isScanning}
            className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                STARTING...
              </>
            ) : (
              t.devices.runFullAudit
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceModal;