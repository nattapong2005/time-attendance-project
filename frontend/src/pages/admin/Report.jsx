import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Users, Building2, MapPin, TrendingUp, AlertTriangle, Clock, Calendar } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const Report = () => {
    const [stats, setStats] = useState({})
    const [summary, setSummary] = useState({})
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

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
        </div>
    )
}

export default Report
