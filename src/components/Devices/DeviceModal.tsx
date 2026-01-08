import { XCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import type { Device } from '../../types';

interface DeviceModalProps {
  device: Device | null;
  onClose: () => void;
}

const DeviceModal = ({ device, onClose }: DeviceModalProps) => {
  const { t } = useTheme();

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

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" 
      onClick={onClose}
    >
      <div 
        className="bg-primary border-2 border-cyan-500 rounded-lg p-8 max-w-2xl w-full mx-4" 
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

          <button className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono font-bold transition-all">
            {t.devices.runFullAudit}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceModal;