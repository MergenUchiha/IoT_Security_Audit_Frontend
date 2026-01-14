import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Shield, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface UserProfileButtonProps {
  user?: UserData;
}

export default function UserProfileButton({ user }: UserProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const defaultUser: UserData = {
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@iotsecurity.com',
    role: user?.role || 'Administrator'
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500 rounded-lg transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold font-mono">
          {defaultUser.avatar ? (
            <img src={defaultUser.avatar} alt={defaultUser.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(defaultUser.name)
          )}
        </div>
        <div className="text-left hidden md:block">
          <div className="text-sm font-semibold text-white">{defaultUser.name}</div>
          <div className="text-xs text-gray-400">{defaultUser.role}</div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold font-mono text-lg">
                {defaultUser.avatar ? (
                  <img src={defaultUser.avatar} alt={defaultUser.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(defaultUser.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{defaultUser.name}</div>
                <div className="text-xs text-gray-400 truncate">{defaultUser.email}</div>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={handleProfile}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-3"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            
            <button
              onClick={handleSettings}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-3"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/activity');
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-3"
            >
              <Activity className="w-4 h-4" />
              <span>Activity Log</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/security');
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-3"
            >
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </button>
          </div>

          <div className="border-t border-gray-700 py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}