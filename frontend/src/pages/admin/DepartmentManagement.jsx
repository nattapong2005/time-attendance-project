import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingDept, setEditingDept] = useState(null)

    // Form State
    const [name, setName] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`${API_URL}/departments`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setDepartments(response.data)
        } catch (err) {
            console.error('Error fetching departments:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!name.trim()) {
            setError('กรุณากรอกชื่อแผนก')
            return
        }

        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            if (editingDept) {
                await axios.put(`${API_URL}/departments/${editingDept.id}`, { name }, { headers })
            } else {
                await axios.post(`${API_URL}/departments`, { name }, { headers })
            }

            setShowModal(false)
            setName('')
            setEditingDept(null)
            fetchDepartments()
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        }
    }

    const openCreateModal = () => {
        setEditingDept(null)
        setName('')
        setShowModal(true)
    }

    const openEditModal = (dept) => {
        setEditingDept(dept)
        setName(dept.name)
        setShowModal(true)
    }

    const handleDelete = async (deptId) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบแผนกนี้?')) return

        try {
            const token = localStorage.getItem('token')
            await axios.delete(`${API_URL}/departments/${deptId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchDepartments()
        } catch (err) {
            console.error('Error deleting department:', err)
            alert('ไม่สามารถลบได้ (อาจมีผู้ใช้สังกัดแผนกนี้อยู่)')
        }
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">จัดการแผนก</h2>
                <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <span>+</span>
                    <span>เพิ่มแผนก</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {departments.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">ไม่พบข้อมูลแผนก</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ชื่อแผนก</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {departments.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-700 w-20">{dept.id}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{dept.name}</td>
                                        <td className="px-4 py-3 space-x-2 w-40">
                                            <button
                                                onClick={() => openEditModal(dept)}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dept.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {editingDept ? 'แก้ไขแผนก' : 'เพิ่มแผนกใหม่'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อแผนก</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                    placeholder="เช่น IT, HR, Marketing"
                                    required
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    {editingDept ? 'บันทึก' : 'เพิ่ม'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DepartmentManagement
