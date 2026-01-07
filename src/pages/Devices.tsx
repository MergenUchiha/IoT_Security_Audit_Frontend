import { useState, useEffect } from 'react';
import { Network, Search } from 'lucide-react';
import DeviceCard from '../components/Devices/DeviceCard';
import DeviceModal from '../components/Devices/DeviceModal';
import { devicesApi } from '../services/api';
import type { Device } from '../types';

const Devices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch devices from API
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await devicesApi.getAll();
        setDevices(response.data);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const handleScanNetwork = () => {
    setScanning(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          return 0;
        }
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white font-mono flex items-center gap-3">
          <Network className="w-8 h-8 text-cyan-400" />
          DEVICE INVENTORY
        </h1>
        <button 
          onClick={handleScanNetwork}
          disabled={scanning}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-5 h-5" />
          {scanning ? 'SCANNING...' : 'SCAN NETWORK'}
        </button>
      </div>

      {scanning && (
        <div className="bg-gray-900 border border-cyan-500 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-cyan-400 font-mono font-bold">SCANNING IN PROGRESS...</span>
            <span className="text-white font-mono">{scanProgress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-green-500 h-full transition-all duration-100 relative"
              style={{ width: `${scanProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-400 text-sm font-mono mt-2">
            Discovering devices on network 192.168.1.0/24...
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400 font-mono">Loading devices...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
          <DeviceCard 
            key={device.id} 
            device={device} 
            onClick={setSelectedDevice}
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