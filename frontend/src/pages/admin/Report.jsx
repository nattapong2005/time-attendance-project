import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const DashboardStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                <p className="text-gray-500 text-sm">นักศึกษาทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <p className="text-gray-500 text-sm">แผนกทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalDepartments || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <p className="text-gray-500 text-sm">สถานที่ฝึกงาน</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalLocations || 0}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <p className="text-gray-500 text-sm">เข้างานวันนี้</p>
                <p className="text-3xl font-bold text-gray-800">{stats.checkInsToday || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                <p className="text-gray-500 text-sm">ขาดงานวันนี้ (บันทึกแล้ว)</p>
                <p className="text-3xl font-bold text-gray-800">{stats.absentToday || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                <p className="text-gray-500 text-sm">คำขอลารออนุมัติ</p>
                <p className="text-3xl font-bold text-gray-800">{stats.pendingLeaves || 0}</p>
            </div>
        </div>
    )
}

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">รายงานและสถิติ</h2>

            <DashboardStats stats={stats} />

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold text-gray-800">สรุปการลงเวลาประจำเดือน</h3>
                    <div className="flex gap-2">
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="px-3 py-2 border rounded-lg outline-none focus:border-indigo-500"
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="px-3 py-2 border rounded-lg outline-none focus:border-indigo-500"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500">มาปกติ</p>
                        <p className="text-2xl font-bold text-green-600">{summary.PRESENT || 0}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-500">มาสาย</p>
                        <p className="text-2xl font-bold text-yellow-600">{summary.LATE || 0}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-500">ขาดงาน</p>
                        <p className="text-2xl font-bold text-red-600">{summary.ABSENT || 0}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500">ลา</p>
                        <p className="text-2xl font-bold text-blue-600">{summary.LEAVE || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Report
