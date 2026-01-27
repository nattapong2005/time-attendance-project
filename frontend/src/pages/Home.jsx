import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { QrCode, FileText, LayoutDashboard, Clock } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const Home = () => {
  const [user, setUser] = useState(null)
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    checkTodayAttendance()
  }, [])

  const checkTodayAttendance = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/attendance/my-history`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const today = new Date().toDateString()
      const todayRecord = response.data.find(record =>
        new Date(record.date).toDateString() === today
      )

      setTodayAttendance(todayRecord || null)
    } catch (err) {
      console.error('Error checking attendance:', err)
    }
  }

  const handleCheckIn = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/attendance/check-in`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setTodayAttendance(response.data)
      setMessage('ลงเวลาเข้างานสำเร็จ!')
    } catch (err) {
      setMessage(err.response?.data?.error || 'ไม่สามารถลงเวลาได้')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/attendance/check-out`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setTodayAttendance(response.data)
      setMessage('ลงเวลาออกงานสำเร็จ!')
    } catch (err) {
      setMessage(err.response?.data?.error || 'ไม่สามารถลงเวลาได้')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return '--:--'
    return new Date(dateString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  const today = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const quickActions = [
    { to: '/scan-qr-code', icon: QrCode, title: 'Scan QR', desc: 'สแกนลงเวลา', color: 'text-blue-600' },
    { to: '/leave-request', icon: FileText, title: 'ขอลา', desc: 'ลาป่วย / ลากิจ', color: 'text-amber-600' },
    { to: '/dashboard', icon: LayoutDashboard, title: 'Dashboard', desc: 'ดูประวัติ', color: 'text-green-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">{today}</p>
            <h1 className="text-2xl font-bold text-slate-900">
              สวัสดี, {user?.name}
            </h1>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-medium text-slate-700">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>

      {/* Attendance Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">ลงเวลาประจำวัน</h2>
          </div>
          {todayAttendance?.isLate && (
            <span className="badge badge-warning">มาสาย</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-5 text-center">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">เข้างาน</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {formatTime(todayAttendance?.checkIn)}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 text-center">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">ออกงาน</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {formatTime(todayAttendance?.checkOut)}
            </p>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm text-center ${message.includes('สำเร็จ')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
            }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCheckIn}
            disabled={isLoading || todayAttendance?.checkIn}
            className="py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? 'กำลังบันทึก...' : 'ลงเวลาเข้างาน'}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={isLoading || !todayAttendance?.checkIn || todayAttendance?.checkOut}
            className="py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? 'กำลังบันทึก...' : 'ลงเวลาออกงาน'}
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-slate-50 flex items-center justify-center ${action.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-900">{action.title}</p>
              <p className="text-xs text-slate-500">{action.desc}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Home
