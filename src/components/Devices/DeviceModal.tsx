import { XCircle } from 'lucide-react';
import type { Device } from '../../types';

interface DeviceModalProps {
  device: Device | null;
  onClose: () => void;
}

const DeviceModal = ({ device, onClose }: DeviceModalProps) => {
  if (!device) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" 
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-8 max-w-2xl w-full mx-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-mono">{device.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm font-mono mb-1">IP Address</p>
              <p className="text-white font-mono">{device.ip}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-mono mb-1">Status</p>
              <p className="text-green-400 font-mono">{device.status.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-mono mb-1">Device Type</p>
              <p className="text-white font-mono">{device.type}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-mono mb-1">Manufacturer</p>
              <p className="text-white font-mono">{device.manufacturer}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-mono mb-1">Firmware Version</p>
              <p className="text-cyan-400 font-mono">{device.firmware}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-mono mb-1">Risk Level</p>
              <p className={`font-mono font-bold ${getRiskColor(device.risk)}`}>
                {device.risk.toUpperCase()}
              </p>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-sm font-mono mb-2">Open Ports</p>
            <div className="flex flex-wrap gap-2">
              {device.ports.map(port => (
                <span 
                  key={port} 
                  className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded font-mono text-sm border border-cyan-500"
                >
                  {port}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-sm font-mono mb-2">Detected Services</p>
            <div className="flex flex-wrap gap-2">
              {device.services.map(service => (
                <span 
                  key={service} 
                  className="px-3 py-1 bg-gray-800 text-white rounded font-mono text-sm border border-gray-700"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm font-mono mb-1">Vulnerabilities Found</p>
            <p className="text-red-400 font-mono font-bold text-2xl">{device.vulnerabilities}</p>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm font-mono mb-1">Last Security Audit</p>
            <p className="text-white font-mono">{device.lastScan}</p>
          </div>

          <button className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono font-bold transition-all">
            RUN FULL SECURITY AUDIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceModal;