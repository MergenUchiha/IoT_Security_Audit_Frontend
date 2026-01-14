import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Scans from './pages/Scans';
import ScanResults from './pages/ScanResults';
import Vulnerabilities from './pages/Vulnerabilities';
import Reports from './pages/Reports';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter future={{ 
          v7_startTransition: true,
          v7_relativeSplatPath: true 
        }}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="devices" element={<Devices />} />
              <Route path="scans" element={<Scans />} />
              <Route path="scans/:id" element={<ScanResults />} />
              <Route path="vulnerabilities" element={<Vulnerabilities />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;