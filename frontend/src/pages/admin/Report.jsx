import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Users, Building2, MapPin, TrendingUp, AlertTriangle, Clock, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react'
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

const Report = () => {
    const [stats, setStats] = useState({})
    const [summary, setSummary] = useState({})
    const [monthlyTrends, setMonthlyTrends] = useState([])
    const [studentStats, setStudentStats] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState('')
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
        fetchMonthlyTrends()
    }, [])

    useEffect(() => {
        fetchStudentStats()
    }, [page, search])

    useEffect(() => {
        fetchSummary()
    }, [month, year])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const statsRes = await axios.get(`${API_URL}/reports/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStats(statsRes.data)
            setIsLoading(false)
        } catch (err) {
            console.error('Error fetching dashboard stats:', err)
            setIsLoading(false)
        }
    }

    const fetchMonthlyTrends = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get(`${API_URL}/reports/monthly-trends`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMonthlyTrends(res.data)
        } catch (err) {
            console.error('Error fetching monthly trends:', err)
        }
    }

    const fetchStudentStats = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get(`${API_URL}/reports/student-stats?page=${page}&limit=10&search=${search}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStudentStats(res.data.students)
            setTotalPages(res.data.pagination.totalPages)
        } catch (err) {
            console.error('Error fetching student stats:', err)
        }
    }

    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get(`${API_URL}/reports/attendance-summary?month=${month}&year=${year}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSummary(res.data)
        } catch (err) {
            console.error('Error fetching summary:', err)
        }
    }

    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]

    const statCards = [
        { label: 'นักศึกษาทั้งหมด', value: stats.totalUsers || 0, icon: Users, bgColor: 'bg-slate-100', color: 'text-slate-900' },
        { label: 'แผนกทั้งหมด', value: stats.totalDepartments || 0, icon: Building2, bgColor: 'bg-blue-50', color: 'text-blue-600' },
        { label: 'สถานที่ฝึกงาน', value: stats.totalLocations || 0, icon: MapPin, bgColor: 'bg-purple-50', color: 'text-purple-600' },
        { label: 'เข้างานวันนี้', value: stats.checkInsToday || 0, icon: TrendingUp, bgColor: 'bg-green-50', color: 'text-green-600' },
        { label: 'ขาดงานวันนี้', value: stats.absentToday || 0, icon: AlertTriangle, bgColor: 'bg-red-50', color: 'text-red-600' },
        { label: 'คำขอลารออนุมัติ', value: stats.pendingLeaves || 0, icon: Clock, bgColor: 'bg-amber-50', color: 'text-amber-600' },
    ]

    const summaryCards = [
        { label: 'มาปกติ', value: summary.PRESENT || 0, bgColor: 'bg-slate-50', color: 'text-slate-900' },
        { label: 'มาสาย', value: summary.LATE || 0, bgColor: 'bg-amber-50', color: 'text-amber-600' },
        { label: 'ขาดงาน', value: summary.ABSENT || 0, bgColor: 'bg-red-50', color: 'text-red-600' },
        { label: 'ลา', value: summary.LEAVE || 0, bgColor: 'bg-blue-50', color: 'text-blue-600' },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-slate-400" />
                <h1 className="text-2xl font-bold text-slate-900">รายงานและสถิติ</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{stat.label}</p>
                                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Monthly Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-semibold text-slate-900">สรุปการลงเวลาประจำเดือน</h2>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="input w-auto"
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="input w-auto"
                        >
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {summaryCards.map((card) => (
                        <div key={card.label} className={`${card.bgColor} rounded-xl p-4 text-center`}>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{card.label}</p>
                            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Trends Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900">สถิติการเข้างานนักศึกษาทั้งหมด (6 เดือนล่าสุด)</h3>
                </div>
                <div className="h-80">
                    <Bar
                        data={{
                            labels: monthlyTrends.map(m => {
                                const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
                                return `${monthNames[m.month - 1]} ${m.year}`
                            }),
                            datasets: [
                                {
                                    label: 'มาปกติ',
                                    data: monthlyTrends.map(m => m.present),
                                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                                    borderColor: 'rgb(34, 197, 94)',
                                    borderWidth: 2,
                                    borderRadius: 6,
                                },
                                {
                                    label: 'มาสาย',
                                    data: monthlyTrends.map(m => m.late),
                                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                                    borderColor: 'rgb(245, 158, 11)',
                                    borderWidth: 2,
                                    borderRadius: 6,
                                },
                                {
                                    label: 'ขาดงาน',
                                    data: monthlyTrends.map(m => m.absent),
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
                                            return `${context.dataset.label}: ${context.parsed.y} ครั้ง`
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

            {/* Student Stats Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-400" />
                        <h3 className="text-lg font-semibold text-slate-900">สถิติการเข้างานรายบุคคล</h3>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อ หรือ อีเมล..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setPage(1)
                            }}
                            className="input pl-9 py-2 text-sm w-full sm:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ชื่อ-นามสกุล</th>
                                <th>แผนก</th>
                                <th className="text-center">มาปกติ</th>
                                <th className="text-center">มาสาย</th>
                                <th className="text-center">ขาดงาน</th>
                                <th className="text-center">ลา</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentStats.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-500">
                                        ไม่พบข้อมูลนักศึกษา
                                    </td>
                                </tr>
                            ) : (
                                studentStats.map((student) => (
                                    <tr key={student.id}>
                                        <td>
                                            <div>
                                                <div className="font-medium text-slate-900">{student.name}</div>
                                                <div className="text-xs text-slate-500">{student.email}</div>
                                            </div>
                                        </td>
                                        <td>{student.department?.name || '-'}</td>
                                        <td className="text-center">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-green-50 text-green-700 font-medium text-xs">
                                                {student.stats.PRESENT}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-medium text-xs">
                                                {student.stats.LATE}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-red-50 text-red-700 font-medium text-xs">
                                                {student.stats.ABSENT}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-medium text-xs">
                                                {student.stats.LEAVE}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        หน้า {page} จาก {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Report
