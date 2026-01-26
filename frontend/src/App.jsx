import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import UserLayout from './components/layouts/UserLayout'
import AdminLayout from './components/layouts/AdminLayout'

// Public Pages
import Indexs from './pages/Indexs'
import Login from './pages/Login'
import Register from './pages/Register'

// User Pages
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ScanQRCode from './pages/ScanQRCode'
import LeaveRequest from './pages/LeaveRequest'
import About from './pages/About'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import AttendanceManagement from './pages/admin/AttendanceManagement'
import LeaveManagement from './pages/admin/LeaveManagement'
import DepartmentManagement from './pages/admin/DepartmentManagement'
import LocationManagement from './pages/admin/LocationManagement'
import Report from './pages/admin/Report'




// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Indexs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Routes with UserLayout */}
      <Route element={<UserLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan-qr-code" element={<ScanQRCode />} />
        <Route path="/leave-request" element={<LeaveRequest />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* Admin Routes with AdminLayout */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="attendance" element={<AttendanceManagement />} />
        <Route path="leaves" element={<LeaveManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="locations" element={<LocationManagement />} />
        <Route path="reports" element={<Report />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
