import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FileText, Check, X, Trash2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchLeaves()
    }, [])

    const fetchLeaves = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`${API_URL}/leaves`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setLeaves(response.data)
        } catch (err) {
            console.error('Error fetching leaves:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const updateLeaveStatus = async (leaveId, status) => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(`${API_URL}/leaves/${leaveId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            fetchLeaves()
        } catch (err) {
            console.error('Error updating leave:', err)
            alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
        }
    }

    const handleDelete = async (leaveId) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบคำขอนี้?')) return

        try {
            const token = localStorage.getItem('token')
            await axios.delete(`${API_URL}/leaves/${leaveId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchLeaves()
        } catch (err) {
            console.error('Error deleting leave:', err)
            alert('เกิดข้อผิดพลาดในการลบข้อมูล')
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getStatusBadge = (status) => {
        const styles = {
            APPROVED: 'badge-success',
            REJECTED: 'badge-danger',
            PENDING: 'badge-warning'
        }
        const labels = {
            APPROVED: 'อนุมัติ',
            REJECTED: 'ไม่อนุมัติ',
            PENDING: 'รอดำเนินการ'
        }
        return (
            <span className={`badge ${styles[status]}`}>
                {labels[status] || status}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-slate-400" />
                <h1 className="text-2xl font-bold text-slate-900">จัดการคำขอลา</h1>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="spinner"></div>
                    </div>
                ) : leaves.length === 0 ? (
                    <div className="empty-state">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="empty-state-text">ยังไม่มีคำขอลา</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ผู้ขอ</th>
                                    <th>ประเภท</th>
                                    <th>วันที่</th>
                                    <th>เหตุผล</th>
                                    <th>สถานะ</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map((leave) => (
                                    <tr key={leave.id}>
                                        <td className="font-medium text-slate-900">{leave.user?.name || '-'}</td>
                                        <td>
                                            {leave.type === 'SICK' ? 'ลาป่วย' : 'ลากิจ'}
                                        </td>
                                        <td>
                                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                        </td>
                                        <td className="max-w-xs truncate">{leave.reason}</td>
                                        <td>{getStatusBadge(leave.status)}</td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                {leave.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateLeaveStatus(leave.id, 'APPROVED')}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="อนุมัติ"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateLeaveStatus(leave.id, 'REJECTED')}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="ปฏิเสธ"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(leave.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="ลบ"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
        </div>
    )
}

export default LeaveManagement
