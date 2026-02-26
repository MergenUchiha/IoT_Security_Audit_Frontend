import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PageLayout } from './components/layout'
import DashboardPage from './pages/Dashboard'
import DevicesPage from './pages/Devices'
import DeviceDetailPage from './pages/DeviceDetail'
import AlertsPage from './pages/Alerts'
import RulesPage from './pages/Rules'

export default function App() {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/:id" element={<DeviceDetailPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/rules" element={<RulesPage />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  )
}
