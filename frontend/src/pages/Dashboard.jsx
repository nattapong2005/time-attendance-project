import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchAttendanceHistory()
  }, [])

  const fetchAttendanceHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/attendance/my-history`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setAttendanceHistory(response.data)

      const present = response.data.filter(r => r.status === 'PRESENT' && !r.isLate).length
      const late = response.data.filter(r => r.isLate).length
      const absent = response.data.filter(r => r.status === 'ABSENT').length

      setStats({ present, late, absent })
    } catch (err) {
      console.error('Error fetching attendance:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusBadge = (record) => {
    if (record.status === 'ABSENT') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">ขาด</span>
    }
    if (record.isLate) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">มาสาย</span>
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">ปกติ</span>
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลผู้ใช้</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">ชื่อ</p>
            <p className="font-semibold text-gray-800">{user?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">บทบาท</p>
            <p className="font-semibold text-gray-800">{user?.role || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ID</p>
            <p className="font-semibold text-gray-800">{user?.id || '-'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">มาปกติ</p>
          <p className="text-3xl font-bold text-green-600">{stats.present}</p>
          <p className="text-xs text-gray-400">วัน</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">มาสาย</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
          <p className="text-xs text-gray-400">วัน</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">ขาด</p>
          <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-xs text-gray-400">วัน</p>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">ประวัติการลงเวลา</h3>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500">กำลังโหลด...</p>
          </div>
        ) : attendanceHistory.length === 0 ? (
          <p className="text-center py-8 text-gray-500">ยังไม่มีประวัติการลงเวลา</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">วันที่</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">เข้างาน</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ออกงาน</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceHistory.slice(0, 10).map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(record.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatTime(record.checkIn)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatTime(record.checkOut)}</td>
                    <td className="px-4 py-3">{getStatusBadge(record)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
