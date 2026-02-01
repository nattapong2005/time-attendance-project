import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { User, Calendar, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0 })
  const [monthlyStats, setMonthlyStats] = useState([])
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

      // Calculate monthly statistics
      calculateMonthlyStats(response.data)
    } catch (err) {
      console.error('Error fetching attendance:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateMonthlyStats = (data) => {
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    const last6Months = []
    const currentDate = new Date()

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      last6Months.push({
        key: monthKey,
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        present: 0,
        late: 0,
        absent: 0
      })
    }

    // Count attendance by month
    data.forEach(record => {
      const recordDate = new Date(record.date)
      const recordKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`

      const monthData = last6Months.find(m => m.key === recordKey)
      if (monthData) {
        if (record.status === 'ABSENT') {
          monthData.absent++
        } else if (record.isLate) {
          monthData.late++
        } else {
          monthData.present++
        }
      }
    })

    setMonthlyStats(last6Months)
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
      return <span className="badge badge-danger">ขาด</span>
    }
    if (record.isLate) {
      return <span className="badge badge-warning">มาสาย</span>
    }
    return <span className="badge badge-success">ปกติ</span>
  }

  const statCards = [
    { label: 'มาปกติ', value: stats.present, color: 'text-slate-900', icon: TrendingUp, bgColor: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'มาสาย', value: stats.late, color: 'text-amber-600', icon: Clock, bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
    { label: 'ขาด', value: stats.absent, color: 'text-red-600', icon: AlertCircle, bgColor: 'bg-red-50', iconColor: 'text-red-600' },
  ]

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">ข้อมูลผู้ใช้</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">ชื่อ</p>
            <p className="text-sm font-medium text-slate-900">{user?.name || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">บทบาท</p>
            <p className="text-sm font-medium text-slate-900">{user?.role || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">ID</p>
            <p className="text-sm font-medium text-slate-900">{user?.id || '-'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">วัน</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Monthly Attendance Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900">สถิติการเข้างานรายเดือน (6 เดือนล่าสุด)</h3>
        </div>
        <div className="h-80">
          <Bar
            data={{
              labels: monthlyStats.map(m => `${m.month} ${m.year}`),
              datasets: [
                {
                  label: 'มาปกติ',
                  data: monthlyStats.map(m => m.present),
                  backgroundColor: 'rgba(34, 197, 94, 0.8)',
                  borderColor: 'rgb(34, 197, 94)',
                  borderWidth: 2,
                  borderRadius: 6,
                },
                {
                  label: 'มาสาย',
                  data: monthlyStats.map(m => m.late),
                  backgroundColor: 'rgba(245, 158, 11, 0.8)',
                  borderColor: 'rgb(245, 158, 11)',
                  borderWidth: 2,
                  borderRadius: 6,
                },
                {
                  label: 'ขาดงาน',
                  data: monthlyStats.map(m => m.absent),
                  backgroundColor: 'rgba(239, 68, 68, 0.8)',
                  borderColor: 'rgb(239, 68, 68)',
                  borderWidth: 2,
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    padding: 15,
                    font: {
                      size: 12,
                      family: 'Inter, system-ui, sans-serif',
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                  },
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  titleFont: {
                    size: 14,
                  },
                  bodyFont: {
                    size: 13,
                  },
                  callbacks: {
                    label: function (context) {
                      return `${context.dataset.label}: ${context.parsed.y} วัน`
                    }
                  }
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    font: {
                      size: 11,
                    },
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    font: {
                      size: 11,
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900">ประวัติการลงเวลา</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : attendanceHistory.length === 0 ? (
          <div className="empty-state">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="empty-state-text">ยังไม่มีประวัติการลงเวลา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>เข้างาน</th>
                  <th>ออกงาน</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.slice(0, 10).map((record) => (
                  <tr key={record.id}>
                    <td className="font-medium text-slate-900">{formatDate(record.date)}</td>
                    <td className="font-mono">{formatTime(record.checkIn)}</td>
                    <td className="font-mono">{formatTime(record.checkOut)}</td>
                    <td>{getStatusBadge(record)}</td>
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
