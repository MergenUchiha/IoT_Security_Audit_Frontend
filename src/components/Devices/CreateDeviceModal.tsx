import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { devicesApi } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

interface CreateDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceCreated?: () => void;
}

interface DeviceFormData {
  name: string;
  type: string;
  ip: string;
  manufacturer: string;
  firmware: string;
  ports: number[];
  services: string[];
}

const deviceTypes = [
  'Smart Camera',
  'Smart Lock',
  'Router',
  'Smart Thermostat',
  'Smart Speaker',
  'Smart Light',
  'Smart Plug',
  'Motion Sensor',
  'Door Sensor',
  'IoT Sensor',
  'IoT Hub',
  'Network',
  'Access Control',
  'Other'
];

export default function CreateDeviceModal({ isOpen, onClose, onDeviceCreated }: CreateDeviceModalProps) {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState<DeviceFormData>({
    name: '',
    type: '',
    ip: '',
    manufacturer: '',
    firmware: '',
    ports: [],
    services: [],
  });

  const [portsInput, setPortsInput] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DeviceFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DeviceFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Device name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Device type is required';
    }

    if (!formData.ip.trim()) {
      newErrors.ip = 'IP address is required';
    } else {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(formData.ip)) {
        newErrors.ip = 'Invalid IP address format';
      }
    }

    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Manufacturer is required';
    }

    if (!formData.firmware.trim()) {
      newErrors.firmware = 'Firmware version is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse ports and services
      const ports = portsInput
        .split(',')
        .map(p => parseInt(p.trim()))
        .filter(p => !isNaN(p));

      const services = servicesInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const deviceData = {
        ...formData,
        ports,
        services,
      };

      await devicesApi.create(deviceData);

      showSuccess('Device Created', `${formData.name} has been added successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        type: '',
        ip: '',
        manufacturer: '',
        firmware: '',
        ports: [],
        services: [],
      });
      setPortsInput('');
      setServicesInput('');
      setErrors({});
      
      if (onDeviceCreated) {
        onDeviceCreated();
      }
      onClose();
    } catch (error: any) {
      console.error('Error creating device:', error);
      showError(
        'Failed to Create Device',
        error.response?.data?.message || 'An error occurred while creating the device.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof DeviceFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        type: '',
        ip: '',
        manufacturer: '',
        firmware: '',
        ports: [],
        services: [],
      });
      setPortsInput('');
      setServicesInput('');
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white font-mono">Add New Device</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Device Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-900 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors`}
              placeholder="e.g., Living Room Camera"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Device Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-900 border ${errors.type ? 'border-red-500' : 'border-gray-700'} rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors`}
            >
              <option value="">Select device type</option>
              {deviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              IP Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ip"
              value={formData.ip}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-900 border ${errors.ip ? 'border-red-500' : 'border-gray-700'} rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors`}
              placeholder="192.168.1.100"
            />
            {errors.ip && <p className="text-red-500 text-sm mt-1">{errors.ip}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Manufacturer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-900 border ${errors.manufacturer ? 'border-red-500' : 'border-gray-700'} rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors`}
                placeholder="e.g., TP-Link"
              />
              {errors.manufacturer && <p className="text-red-500 text-sm mt-1">{errors.manufacturer}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Firmware Version <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firmware"
                value={formData.firmware}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-900 border ${errors.firmware ? 'border-red-500' : 'border-gray-700'} rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors`}
                placeholder="e.g., 1.2.3"
              />
              {errors.firmware && <p className="text-red-500 text-sm mt-1">{errors.firmware}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Open Ports
            </label>
            <input
              type="text"
              value={portsInput}
              onChange={(e) => setPortsInput(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="80, 443, 8080 (comma-separated)"
            />
            <p className="text-gray-500 text-xs mt-1">Enter port numbers separated by commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Services
            </label>
            <input
              type="text"
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="HTTP, HTTPS, API (comma-separated)"
            />
            <p className="text-gray-500 text-xs mt-1">Enter service names separated by commas</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono font-bold transition-all disabled:opacity-50"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-mono font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  CREATING...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  CREATE
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}