import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import api from '../../services/api';

interface CreateDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceCreated?: () => void;
}

interface DeviceFormData {
  name: string;
  type: string;
  ipAddress: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  location: string;
  description: string;
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
  'Other'
];

export default function CreateDeviceModal({ isOpen, onClose, onDeviceCreated }: CreateDeviceModalProps) {
  const [formData, setFormData] = useState<DeviceFormData>({
    name: '',
    type: '',
    ipAddress: '',
    manufacturer: '',
    model: '',
    firmwareVersion: '',
    location: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<DeviceFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<DeviceFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Device name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Device type is required';
    }

    if (!formData.ipAddress.trim()) {
      newErrors.ipAddress = 'IP address is required';
    } else {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(formData.ipAddress)) {
        newErrors.ipAddress = 'Invalid IP address format';
      }
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
      const response = await api.createDevice(formData);

      if (response) {
        alert('Device created successfully!');
        setFormData({
          name: '',
          type: '',
          ipAddress: '',
          manufacturer: '',
          model: '',
          firmwareVersion: '',
          location: '',
          description: ''
        });
        setErrors({});
        if (onDeviceCreated) {
          onDeviceCreated();
        }
        onClose();
      }
    } catch (error: any) {
      console.error('Error creating device:', error);
      alert(error.response?.data?.message || 'Failed to create device. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        ipAddress: '',
        manufacturer: '',
        model: '',
        firmwareVersion: '',
        location: '',
        description: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
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
              name="ipAddress"
              value={formData.ipAddress}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-900 border ${errors.ipAddress ? 'border-red-500' : 'border-gray-700'} rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors`}
              placeholder="192.168.1.100"
            />
            {errors.ipAddress && <p className="text-red-500 text-sm mt-1">{errors.ipAddress}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="e.g., TP-Link"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="e.g., C200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Firmware Version
              </label>
              <input
                type="text"
                name="firmwareVersion"
                value={formData.firmwareVersion}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="e.g., 1.2.3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="e.g., Living Room"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              placeholder="Additional notes about this device..."
            />
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