import React, { useState, useEffect } from 'react'
import axios from 'axios'

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
            APPROVED: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700',
            PENDING: 'bg-yellow-100 text-yellow-700'
        }
        const labels = {
            APPROVED: 'อนุมัติ',
            REJECTED: 'ไม่อนุมัติ',
            PENDING: 'รอดำเนินการ'
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status] || status}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">จัดการคำขอลา</h2>

            <div className="bg-white rounded-xl shadow-sm p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : leaves.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-4xl mb-4">📝</p>
                        <p>ยังไม่มีคำขอลา</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ผู้ขอ</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ประเภท</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">วันที่</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">เหตุผล</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">สถานะ</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {leaves.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{leave.user?.name || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {leave.type === 'SICK' ? 'ลาป่วย' : 'ลากิจ'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{leave.reason}</td>
                                        <td className="px-4 py-3">{getStatusBadge(leave.status)}</td>
                                        <td className="px-4 py-3 space-x-2">
                                            {leave.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => updateLeaveStatus(leave.id, 'APPROVED')}
                                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                    >
                                                        อนุมัติ
                                                    </button>
                                                    <button
                                                        onClick={() => updateLeaveStatus(leave.id, 'REJECTED')}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        ไม่อนุมัติ
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(leave.id)}
                                                className="text-gray-400 hover:text-red-600 text-sm"
                                                title="ลบคำขอ"
                                            >
                                                🗑️
                                            </button>
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
