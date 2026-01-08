import { Eye, Cpu, Lock, Network, HardDrive, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import type { Device } from '../../types';

interface DeviceCardProps {
  device: Device;
  onClick: (device: Device) => void;
}

const DeviceCard = ({ device, onClick }: DeviceCardProps) => {
  const { t } = useTheme();

  const getIcon = (type: string) => {
    switch (type) {
      case 'Camera':
        return <Eye className="w-5 h-5 text-purple-400" />;
      case 'IoT Sensor':
        return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'Access Control':
        return <Lock className="w-5 h-5 text-orange-400" />;
      case 'Network':
        return <Network className="w-5 h-5 text-green-400" />;
      default:
        return <HardDrive className="w-5 h-5 accent-cyan" />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'Camera':
        return 'bg-purple-500/20';
      case 'IoT Sensor':
        return 'bg-blue-500/20';
      case 'Access Control':
        return 'bg-orange-500/20';
      case 'Network':
        return 'bg-green-500/20';
      default:
        return 'bg-cyan-500/20';
    }
  };

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
      className="bg-primary border border-primary rounded-lg p-6 card cursor-pointer"
      onClick={() => onClick(device)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getIconBgColor(device.type)}`}>
            {getIcon(device.type)}
          </div>
          <div>
            <h3 className="text-primary font-bold font-mono">{device.name}</h3>
            <p className="text-tertiary text-sm font-mono">{device.ip}</p>
          </div>
        </div>
        <div 
          className={`w-3 h-3 rounded-full ${
            device.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}
        ></div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-tertiary font-mono">{t.devices.type}:</span>
          <span className="text-primary font-mono">{device.type}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-tertiary font-mono">{t.devices.manufacturer}:</span>
          <span className="text-primary font-mono">{device.manufacturer}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-tertiary font-mono">{t.devices.firmware}:</span>
          <span className="accent-cyan font-mono">{device.firmware}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-secondary">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${getRiskColor(device.risk)}`} />
          <span className={`text-sm font-mono font-bold ${getRiskColor(device.risk)}`}>
            {t.risk[device.risk]}
          </span>
        </div>
        <span className="text-tertiary text-sm font-mono">{device.vulnerabilities} {t.devices.vulnerabilities}</span>
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono font-bold transition-all">
        {t.devices.startAudit}
      </button>
    </div>
  );
};

export default DeviceCard;