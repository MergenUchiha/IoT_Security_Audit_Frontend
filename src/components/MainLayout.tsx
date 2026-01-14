import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Server, AlertTriangle, FileText, Settings as SettingsIcon,
  Menu, X, Shield, Plus
} from 'lucide-react';
import UserProfileButton from '../components/UserProfileButton';
import NotificationCenter from '../components/NotificationCenter';
import SearchBar from '../components/SearchBar';
import CreateDeviceModal from './Devices/CreateDeviceModal';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/devices', icon: Server, label: 'Devices' },
    { path: '/vulnerabilities', icon: AlertTriangle, label: 'Vulnerabilities' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' }
  ];

  const handleDeviceCreated = () => {
    navigate('/devices');
  };

  return (
    <div className="min-h-screen bg-cyber-darker flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col fixed h-full z-40`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-500 flex-shrink-0" />
            {isSidebarOpen && (
              <div>
                <h1 className="text-white font-bold font-mono text-lg">IoT Security</h1>
                <p className="text-cyan-400 text-xs font-mono">Audit System</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-mono">{item.label}</span>}
              </NavLink>
            );
          })}

          {/* Quick Actions */}
          {isSidebarOpen && (
            <div className="pt-4 mt-4 border-t border-gray-800">
              <p className="text-gray-500 text-xs font-bold uppercase mb-2 px-4">Quick Actions</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-cyan-400 hover:bg-gray-800 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="font-mono">Add Device</span>
              </button>
            </div>
          )}
        </nav>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            {isSidebarOpen ? (
              <>
                <X className="w-5 h-5" />
                <span className="font-mono">Collapse</span>
              </>
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        } transition-all duration-300`}
      >
        {/* Top Bar */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <SearchBar />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <UserProfileButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-cyber-darker">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-500" />
              <span className="font-mono">IoT Security Audit System v1.0.0</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">About</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Create Device Modal */}
      <CreateDeviceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDeviceCreated={handleDeviceCreated}
      />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}