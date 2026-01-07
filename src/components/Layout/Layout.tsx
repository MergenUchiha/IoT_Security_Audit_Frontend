import { Outlet, NavLink } from 'react-router-dom';
import { Shield, Network, Activity, AlertTriangle, FileText, Terminal } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const Layout = () => {
  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: Terminal },
    { path: '/devices', label: 'Devices', icon: Network },
    { path: '/scans', label: 'Scans', icon: Activity },
    { path: '/vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-cyber-darker">
      {/* Header */}
      <header className="bg-gray-900 border-b border-cyan-500/30 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-50"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">IoT Security Audit</h1>
                <p className="text-xs text-cyan-400">SYSTEM v1.0.0</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">ONLINE</span>
              </div>
              <div className="w-px h-6 bg-cyan-500/30"></div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-cyan-500/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-6 py-4 transition-all relative group ${
                      isActive
                        ? 'text-cyan-400 bg-cyan-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-5 h-5" />
                      <span className="font-bold text-sm">{item.label}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-cyan-500/30 mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <p>© 2025 IoT Security Audit System. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Build: 1.0.0-alpha</span>
              <span>•</span>
              <span>API Status: Connected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;