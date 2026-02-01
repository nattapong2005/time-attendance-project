import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Clock, Calendar, Filter, Eye, X, MapPin, Camera, Trash, Edit, Save } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const AttendanceManagement = () => {
    const [attendance, setAttendance] = useState([])
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    // Modal State
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [modalMode, setModalMode] = useState('view') // 'view', 'create', 'edit'
    const [formData, setFormData] = useState({
        userId: '',
        date: '',
        checkIn: '',
        checkOut: '',
        status: 'PRESENT',
        isLate: false
    })

    useEffect(() => {
        fetchAttendance()
        fetchUsers()
    }, [selectedMonth, selectedYear])

    const fetchAttendance = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(
                `${API_URL}/attendance/monthly-report?month=${selectedMonth}&year=${selectedYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            console.log(response.data)
            setAttendance(response.data)
        } catch (err) {
            console.error('Error fetching attendance:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`)
            setUsers(response.data)
        } catch (err) {
            console.error('Error fetching users:', err)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatTime = (dateString, forInput = false) => {
        if (!dateString) return forInput ? '' : '-'
        if (forInput) {
            const date = new Date(dateString)
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
        }
        return new Date(dateString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    }

    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            // Optimistic update
            if (selectedRecord && selectedRecord.id === id) {
                setSelectedRecord(prev => ({ ...prev, status: newStatus }))
            }
            setAttendance(prev => prev.map(record =>
                record.id === id ? { ...record, status: newStatus } : record
            ))

            const token = localStorage.getItem('token')
            await axios.put(`${API_URL}/attendance/${id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            )
        } catch (err) {
            console.error('Error updating status:', err)
            fetchAttendance()
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('คุณต้องการลบข้อมูลการลงเวลานี้ใช่หรือไม่?')) return

        try {
            const token = localStorage.getItem('token')
            await axios.delete(`${API_URL}/attendance/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setAttendance(attendance.filter(r => r.id !== id))
            if (selectedRecord?.id === id) setSelectedRecord(null)
        } catch (err) {
            console.error('Error deleting record:', err)
            alert('ลบข้อมูลไม่สำเร็จ')
        }
    }



    const openEditModal = (record) => {
        // Format date for <input type="date"> (YYYY-MM-DD)
        const d = new Date(record.date)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

        setFormData({
            userId: record.userId,
            date: dateStr,
            checkIn: formatTime(record.checkIn, true),
            checkOut: formatTime(record.checkOut, true),
            status: record.status,
            isLate: record.isLate
        })
        setModalMode('edit')
        setSelectedRecord(record)
    }

    const openViewModal = (record) => {
        setModalMode('view')
        setSelectedRecord(record)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            const payload = {
                ...formData,
                date: new Date(formData.date).toISOString(), // Ensure date is proper ISO string for Prisma
                checkIn: formData.checkIn ? new Date(formData.checkIn).toISOString() : null,
                checkOut: formData.checkOut ? new Date(formData.checkOut).toISOString() : null
            }
            // Fix: Clean up payload to send correct date string for "date" field (YYYY-MM-DD only)
            // But backend parser uses new Date(date), so YYYY-MM-DD should work fine.
            // Ensure nulls are sent as null, not "null" or empty string if that was the case.

            // Actually, the error might be if formData.checkIn is empty string, new Date("") is Invalid Date.
            // The code above handles empty string: formData.checkIn ? ... : null. Empty string is falsy.
            // Let's ensure we are strict.

            await axios.put(`${API_URL}/attendance/${selectedRecord.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            })

            fetchAttendance()
            setSelectedRecord(null)
            alert('แก้ไขข้อมูลสำเร็จ')
        } catch (err) {
            console.error('Error saving record:', err)
            alert(err.response?.data?.error || 'บันทึกข้อมูลไม่สำเร็จ')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-slate-400" />
                    <h1 className="text-2xl font-bold text-slate-900">จัดการการลงเวลา</h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Add Button */}


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
                                    <th>จัดการ</th>
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
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openViewModal(record)}
                                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="ดูรายละเอียด"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(record)}
                                                    className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="แก้ไข"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(record.id)}
                                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="ลบ"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-slide-up my-8">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                            <h3 className="font-bold text-lg text-slate-800">
                                {modalMode === 'view' ? 'รายละเอียดการลงเวลา' : 'แก้ไขการลงเวลา'}
                            </h3>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* View Mode */}
                        {modalMode === 'view' && (
                            <>
                                <div className="p-6 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 text-xl font-bold">
                                                {selectedRecord.user?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">{selectedRecord.user?.name}</h4>
                                                <p className="text-slate-500 text-sm">รหัส: {selectedRecord.user?.studentId}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <select
                                                className="input py-2 text-sm"
                                                defaultValue={selectedRecord.status}
                                                onChange={(e) => handleUpdateStatus(selectedRecord.id, e.target.value)}
                                            >
                                                <option value="PRESENT">ปกติ (PRESENT)</option>
                                                <option value="ABSENT">ขาด (ABSENT)</option>
                                                <option value="LATE">มาสาย (LATE)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <hr className="border-slate-100" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-xl">
                                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">วันที่</p>
                                            <p className="font-medium text-slate-900">{formatDate(selectedRecord.date)}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl">
                                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">สถานะปัจจุบัน</p>
                                            <div className="flex items-center gap-2">
                                                {selectedRecord.status === 'ABSENT' ? (
                                                    <span className="badge badge-danger">ขาด</span>
                                                ) : selectedRecord.isLate ? (
                                                    <span className="badge badge-warning">มาสาย</span>
                                                ) : (
                                                    <span className="badge badge-success">ปกติ</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                            <p className="text-xs text-green-700 uppercase font-bold mb-1">เวลาเข้างาน</p>
                                            <p className="font-mono text-xl font-bold text-green-800">{formatTime(selectedRecord.checkIn)}</p>
                                        </div>
                                        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                            <p className="text-xs text-red-700 uppercase font-bold mb-1">เวลาออกงาน</p>
                                            <p className="font-mono text-xl font-bold text-red-800">{formatTime(selectedRecord.checkOut)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                            <Camera className="w-4 h-4" />
                                            รูปถ่ายยืนยันตัวตน
                                        </p>
                                        {selectedRecord.checkInPhoto ? (
                                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                                <div className="aspect-video w-full relative">
                                                    <img
                                                        src={`${API_URL.replace('/api', '')}${selectedRecord.checkInPhoto}`}
                                                        alt="Check-in Evidence"
                                                        className="absolute inset-0 w-full h-full object-contain"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-8 rounded-xl border-2 border-dashed border-slate-200 text-center text-slate-400 bg-slate-50">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Camera className="w-8 h-8 text-slate-300" />
                                                    <p className="text-sm">ไม่มีรูปถ่ายยืนยันตัวตน</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
                                    <button
                                        onClick={() => setSelectedRecord(null)}
                                        className="btn btn-secondary"
                                    >
                                        ปิดหน้าต่าง
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Edit Mode */}
                        {modalMode === 'edit' && (
                            <form onSubmit={handleSave}>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="label">ผู้ใช้งาน</label>
                                            <select
                                                className="input"
                                                required
                                                value={formData.userId}
                                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                                disabled
                                            >
                                                <option value="">เลือกพนักงาน</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name} ({u.studentId})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="label">วันที่</label>
                                            <input
                                                type="date"
                                                className="input"
                                                required
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                disabled
                                            />
                                        </div>

                                        <div>
                                            <label className="label">สถานะ</label>
                                            <select
                                                className="input"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="PRESENT">ปกติ (PRESENT)</option>
                                                <option value="ABSENT">ขาด (ABSENT)</option>
                                                <option value="LATE">มาสาย (LATE)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="label">เวลาเข้างาน</label>
                                            <input
                                                type="datetime-local"
                                                className="input"
                                                value={formData.checkIn}
                                                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="label">เวลาออกงาน</label>
                                            <input
                                                type="datetime-local"
                                                className="input"
                                                value={formData.checkOut}
                                                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                                            />
                                        </div>

                                        <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="isLate"
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                checked={formData.isLate}
                                                onChange={(e) => setFormData({ ...formData, isLate: e.target.checked })}
                                            />
                                            <label htmlFor="isLate" className="text-sm font-medium text-slate-700">บันทึกว่ามาสาย</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRecord(null)}
                                        className="btn btn-secondary"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        บันทึก
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AttendanceManagement
