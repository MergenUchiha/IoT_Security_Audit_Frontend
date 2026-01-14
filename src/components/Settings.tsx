import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Bell, Shield, User, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

interface UserSettings {
  name: string;
  email: string;
  notifications: {
    email: boolean;
    push: boolean;
    critical: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
  preferences: {
    theme: 'dark' | 'light';
    language: 'en' | 'ru';
  };
}

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    notifications: {
      email: true,
      push: true,
      critical: true,
      high: true,
      medium: false,
      low: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30
    },
    preferences: {
      theme: 'dark',
      language: 'en'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences'>('profile');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${API_URL}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await axios.patch(`${API_URL}/api/settings`, settings, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await axios.post(`${API_URL}/api/users/change-password`, {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      alert('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white font-mono flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-cyan-500" />
          Settings
        </h1>
        <p className="text-gray-400 mt-2">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-mono flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono transition-all disabled:opacity-50"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Email Notifications</div>
                <div className="text-sm text-gray-400">Receive notifications via email</div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: e.target.checked }
                })}
                className="w-5 h-5 accent-cyan-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Push Notifications</div>
                <div className="text-sm text-gray-400">Receive browser push notifications</div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, push: e.target.checked }
                })}
                className="w-5 h-5 accent-cyan-500"
              />
            </div>
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h4 className="text-white font-semibold mb-3">Vulnerability Severity Alerts</h4>
              <div className="space-y-3">
                {(['critical', 'high', 'medium', 'low'] as const).map(severity => (
                  <div key={severity} className="flex items-center justify-between">
                    <span className={`text-sm capitalize ${
                      severity === 'critical' ? 'text-red-400' :
                      severity === 'high' ? 'text-orange-400' :
                      severity === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {severity} vulnerabilities
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.notifications[severity]}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, [severity]: e.target.checked }
                      })}
                      className="w-5 h-5 accent-cyan-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Two-Factor Authentication</div>
                <div className="text-sm text-gray-400">Add an extra layer of security</div>
              </div>
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, twoFactorAuth: e.target.checked }
                })}
                className="w-5 h-5 accent-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Application Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
              <select
                value={settings.preferences.theme}
                onChange={(e) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, theme: e.target.value as 'dark' | 'light' }
                })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <select
                value={settings.preferences.language}
                onChange={(e) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, language: e.target.value as 'en' | 'ru' }
                })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono font-bold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}