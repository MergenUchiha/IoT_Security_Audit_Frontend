import { Outlet, NavLink } from 'react-router-dom';
import { Shield, Network, Activity, AlertTriangle, FileText, Terminal, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Locale, localeNames } from '../../i18n';
import { useState } from 'react';

interface NavItem {
  path: string;
  labelKey: keyof typeof import('../../i18n/locales/en').en.nav;
  icon: React.ElementType;
}

const Layout = () => {
  const { theme, toggleTheme, locale, setLocale, t } = useTheme();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const navItems: NavItem[] = [
    { path: '/', labelKey: 'dashboard', icon: Terminal },
    { path: '/devices', labelKey: 'devices', icon: Network },
    { path: '/scans', labelKey: 'scans', icon: Activity },
    { path: '/vulnerabilities', labelKey: 'vulnerabilities', icon: AlertTriangle },
    { path: '/reports', labelKey: 'reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-darker">
      {/* Header */}
      <header className="bg-primary border-b border-primary sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 accent-cyan" />
                <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-50"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">{t.header.title}</h1>
                <p className="text-xs accent-cyan">{t.header.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">{t.common.online}</span>
              </div>
              
              <div className="w-px h-6 border-primary"></div>
              
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded transition-all text-tertiary hover:text-primary"
                  style={{ backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.8)' }}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-bold">{localeNames[locale]}</span>
                </button>
                
                {showLangMenu && (
                  <div 
                    className="absolute right-0 mt-2 py-2 w-40 rounded-lg shadow-xl border border-primary"
                    style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
                  >
                    {(Object.keys(localeNames) as Locale[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLocale(lang);
                          setShowLangMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          locale === lang 
                            ? 'accent-cyan font-bold' 
                            : 'text-tertiary hover:text-primary'
                        }`}
                        style={{ 
                          backgroundColor: locale === lang 
                            ? (theme === 'dark' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.15)') 
                            : 'transparent' 
                        }}
                      >
                        {localeNames[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded transition-all text-tertiary hover:text-primary"
                style={{ backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.8)' }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              
              <div className="w-px h-6 border-primary"></div>
              
              <button className="text-tertiary hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-primary border-b border-primary">
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
                        ? 'accent-cyan'
                        : 'text-tertiary hover:text-primary'
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive 
                      ? (theme === 'dark' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.15)')
                      : 'transparent'
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-5 h-5" />
                      <span className="font-bold text-sm">{t.nav[item.labelKey]}</span>
                      {isActive && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-0.5" 
                          style={{ backgroundColor: 'var(--accent-cyan)' }}
                        ></div>
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
      <footer className="bg-primary border-t border-primary mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-tertiary">
            <p>{t.footer.copyright}</p>
            <div className="flex items-center gap-4">
              <span>{t.footer.build}: 1.0.0-alpha</span>
              <span>•</span>
              <span>{t.footer.apiStatus}: {t.common.connected}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;