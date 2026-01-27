import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Building2, Plus, Edit, Trash2, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingDept, setEditingDept] = useState(null)

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
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-slate-400" />
                    <h1 className="text-2xl font-bold text-slate-900">จัดการแผนก</h1>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    เพิ่มแผนก
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {departments.length === 0 ? (
                    <div className="empty-state">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="empty-state-text">ไม่พบข้อมูลแผนก</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>ชื่อแผนก</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map((dept) => (
                                    <tr key={dept.id}>
                                        <td className="w-20">{dept.id}</td>
                                        <td className="font-medium text-slate-900">{dept.name}</td>
                                        <td className="w-32">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(dept)}
                                                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dept.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content p-6 max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingDept ? 'แก้ไขแผนก' : 'เพิ่มแผนกใหม่'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">ชื่อแผนก</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input"
                                    placeholder="เช่น IT, HR, Marketing"
                                    required
                                />
                            </div>

                            {error && <div className="alert alert-danger text-sm">{error}</div>}

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
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
