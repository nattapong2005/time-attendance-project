import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, Clock, FileText, MapPin, TrendingUp, Calendar } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        todayPresent: 0,
        pendingLeaves: 0,
        totalLocations: 0
    })
    const [recentAttendance, setRecentAttendance] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            const [statsRes, attendanceRes] = await Promise.all([
                axios.get(`${API_URL}/reports/dashboard`, { headers }),
                axios.get(`${API_URL}/attendance/monthly-report?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`, { headers })
            ])

            setStats({
                totalUsers: statsRes.data.totalUsers,
                todayPresent: statsRes.data.checkInsToday,
                pendingLeaves: statsRes.data.pendingLeaves,
                totalLocations: statsRes.data.totalLocations
            })

            // Sort by latest first
            const sortedAttendance = attendanceRes.data.sort((a, b) => 
                new Date(b.checkIn || b.date) - new Date(a.checkIn || a.date)
            )

            setRecentAttendance(sortedAttendance.slice(0, 10))
        } catch (err) {
            console.error('Error fetching dashboard:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatTime = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    }

    const statCards = [
        { label: 'ผู้ใช้ทั้งหมด', value: stats.totalUsers, icon: Users, color: 'text-slate-900', bgColor: 'bg-slate-100' },
        { label: 'มาทำงานวันนี้', value: stats.todayPresent, icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-50' },
        { label: 'คำขอลารออนุมัติ', value: stats.pendingLeaves, icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-50' },
        { label: 'สถานที่ฝึกงาน', value: stats.totalLocations, icon: MapPin, color: 'text-blue-600', bgColor: 'bg-blue-50' },
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Recent Attendance */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <h2 className="text-lg font-semibold text-slate-900">การลงเวลาล่าสุด</h2>
                </div>

                {recentAttendance.length === 0 ? (
                    <div className="empty-state">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="empty-state-text">ไม่มีข้อมูล</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ชื่อ</th>
                                    <th>วันที่</th>
                                    <th>เข้างาน</th>
                                    <th>ออกงาน</th>
                                    <th>สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAttendance.map((record) => (
                                    <tr key={record.id}>
                                        <td className="font-medium text-slate-900">{record.user?.name || '-'}</td>
                                        <td>{formatDate(record.date)}</td>
                                        <td className="font-mono">{formatTime(record.checkIn)}</td>
                                        <td className="font-mono">{formatTime(record.checkOut)}</td>
                                        <td>
                                            {record.isLate ? (
                                                <span className="badge badge-warning">มาสาย</span>
                                            ) : record.status === 'ABSENT' ? (
                                                <span className="badge badge-danger">ขาด</span>
                                            ) : (
                                                <span className="badge badge-success">ปกติ</span>
                                            )}
                                        </td>
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

export default AdminDashboard
