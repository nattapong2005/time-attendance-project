import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

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
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          สวัสดี, {user?.name || 'ผู้ใช้'}!
        </h2>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Attendance Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">ลงเวลาประจำวัน</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">เวลาเข้างาน</p>
            <p className="text-2xl font-bold text-green-600">
              {formatTime(todayAttendance?.checkIn)}
            </p>
            {todayAttendance?.isLate && (
              <span className="text-xs text-red-500">มาสาย</span>
            )}
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">เวลาออกงาน</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatTime(todayAttendance?.checkOut)}
            </p>
          </div>
        </div>

        {message && (
          <p className={`text-center mb-4 ${message.includes('สำเร็จ') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCheckIn}
            disabled={isLoading || todayAttendance?.checkIn}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'กำลังบันทึก...' : 'ลงเวลาเข้างาน'}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={isLoading || !todayAttendance?.checkIn || todayAttendance?.checkOut}
            className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'กำลังบันทึก...' : 'ลงเวลาออกงาน'}
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/scan-qr-code" className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">📱</div>
          <h4 className="font-semibold text-gray-800">Scan QR Code</h4>
          <p className="text-sm text-gray-500">สแกนเพื่อลงเวลา</p>
        </Link>
        <Link to="/leave-request" className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">📝</div>
          <h4 className="font-semibold text-gray-800">ขอลา</h4>
          <p className="text-sm text-gray-500">ลาป่วย / ลากิจ</p>
        </Link>
        <Link to="/dashboard" className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">📊</div>
          <h4 className="font-semibold text-gray-800">Dashboard</h4>
          <p className="text-sm text-gray-500">ดูประวัติการลงเวลา</p>
        </Link>
      </div>
    </div>
  )
}

export default Home
