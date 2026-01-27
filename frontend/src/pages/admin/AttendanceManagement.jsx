import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Clock, Calendar, Filter } from 'lucide-react'

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
                <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-slate-400" />
                    <h1 className="text-2xl font-bold text-slate-900">จัดการการลงเวลา</h1>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="input w-auto"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index + 1}>{month}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="input w-auto"
                    >
                        {[2024, 2025, 2026, 2027].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="spinner"></div>
                    </div>
                ) : attendance.length === 0 ? (
                    <div className="empty-state">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="empty-state-text">ไม่มีข้อมูลการลงเวลาในเดือนนี้</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ชื่อ</th>
                                    <th>รหัสนักศึกษา</th>
                                    <th>วันที่</th>
                                    <th>เข้างาน</th>
                                    <th>ออกงาน</th>
                                    <th>สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((record) => (
                                    <tr key={record.id}>
                                        <td className="font-medium text-slate-900">{record.user?.name || '-'}</td>
                                        <td>{record.user?.studentId || '-'}</td>
                                        <td>{formatDate(record.date)}</td>
                                        <td className="font-mono">{formatTime(record.checkIn)}</td>
                                        <td className="font-mono">{formatTime(record.checkOut)}</td>
                                        <td>
                                            {record.status === 'ABSENT' ? (
                                                <span className="badge badge-danger">ขาด</span>
                                            ) : record.isLate ? (
                                                <span className="badge badge-warning">มาสาย</span>
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

export default AttendanceManagement
