import React, { useState, useEffect } from 'react'
import axios from 'axios'

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

            const [usersRes, attendanceRes] = await Promise.all([
                axios.get(`${API_URL}/users`, { headers }),
                axios.get(`${API_URL}/attendance/monthly-report?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`, { headers })
            ])

            const today = new Date().toDateString()
            const todayAttendance = attendanceRes.data.filter(a =>
                new Date(a.date).toDateString() === today
            )

            setStats({
                totalUsers: usersRes.data.length,
                todayPresent: todayAttendance.length,
                pendingLeaves: 0,
                totalLocations: 0
            })

            setRecentAttendance(attendanceRes.data.slice(0, 10))
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500">ผู้ใช้ทั้งหมด</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                    <p className="text-sm text-gray-500">มาทำงานวันนี้</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.todayPresent}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-500">คำขอลารออนุมัติ</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.pendingLeaves}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                    <p className="text-sm text-gray-500">สถานที่ฝึกงาน</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalLocations}</p>
                </div>
            </div>

            {/* Recent Attendance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">การลงเวลาล่าสุด</h3>
                {recentAttendance.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">ไม่มีข้อมูล</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ชื่อ</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">วันที่</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">เข้างาน</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ออกงาน</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentAttendance.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-700">{record.user?.name || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(record.date)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{formatTime(record.checkIn)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{formatTime(record.checkOut)}</td>
                                        <td className="px-4 py-3">
                                            {record.isLate ? (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">มาสาย</span>
                                            ) : record.status === 'ABSENT' ? (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">ขาด</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">ปกติ</span>
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
