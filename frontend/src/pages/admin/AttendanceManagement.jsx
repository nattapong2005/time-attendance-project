import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const AttendanceManagement = () => {
    const [attendance, setAttendance] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    useEffect(() => {
        fetchAttendance()
    }, [selectedMonth, selectedYear])

    const fetchAttendance = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(
                `${API_URL}/attendance/monthly-report?month=${selectedMonth}&year=${selectedYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setAttendance(response.data)
        } catch (err) {
            console.error('Error fetching attendance:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short'
        })
    }

    const formatTime = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    }

    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">จัดการการลงเวลา</h2>

                {/* Filters */}
                <div className="flex gap-3">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index + 1}>{month}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                    >
                        {[2024, 2025, 2026, 2027].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : attendance.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-4xl mb-4">📅</p>
                        <p>ไม่มีข้อมูลการลงเวลาในเดือนนี้</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ชื่อ</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">รหัสนักศึกษา</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">วันที่</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">เข้างาน</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ออกงาน</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {attendance.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{record.user?.name || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{record.user?.studentId || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(record.date)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{formatTime(record.checkIn)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{formatTime(record.checkOut)}</td>
                                        <td className="px-4 py-3">
                                            {record.status === 'ABSENT' ? (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">ขาด</span>
                                            ) : record.isLate ? (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">มาสาย</span>
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

export default AttendanceManagement
