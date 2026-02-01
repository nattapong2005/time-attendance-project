import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, Plus, Edit, Trash2, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const UserManagement = () => {
    const [users, setUsers] = useState([])
    const [departments, setDepartments] = useState([])
    const [sakas, setSakas] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT',
        studentId: '',
        departmentId: '',
        sakaId: ''
    })
    const [error, setError] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            const [usersRes, deptsRes, sakasRes] = await Promise.all([
                axios.get(`${API_URL}/users`, { headers }),
                axios.get(`${API_URL}/departments`, { headers }),
                axios.get(`${API_URL}/sakas`, { headers })
            ])

            setUsers(usersRes.data)
            setDepartments(deptsRes.data)
            setSakas(sakasRes.data)
        } catch (err) {
            console.error('Error fetching data:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            const payload = {
                ...formData,
                departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
                sakaId: formData.sakaId ? parseInt(formData.sakaId) : null
            }

            if (editingUser) {
                if (!payload.password) delete payload.password
                await axios.put(`${API_URL}/users/${editingUser.id}`, payload, { headers })
            } else {
                await axios.post(`${API_URL}/users`, payload, { headers })
            }

            setShowModal(false)
            fetchData()
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        }
    }

    const openCreateModal = () => {
        setEditingUser(null)
        setFormData({
            name: '', email: '', password: '', role: 'STUDENT',
            studentId: '', departmentId: '', sakaId: ''
        })
        setShowModal(true)
    }

    const openEditModal = (user) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            studentId: user.studentId || '',
            departmentId: user.departmentId || '',
            sakaId: user.sakaId || ''
        })
        setShowModal(true)
    }

    const handleDelete = async (userId) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return

        try {
            const token = localStorage.getItem('token')
            await axios.delete(`${API_URL}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
            fetchData()
        } catch (err) {
            console.error('Error deleting user:', err)
        }
    }

    const getRoleBadge = (role) => {
        const styles = {
            ADMIN: 'badge-danger',
            TEACHER: 'badge-info',
            STUDENT: 'badge-success'
        }
        return <span className={`badge ${styles[role]}`}>{role}</span>
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
                    <Users className="w-6 h-6 text-slate-400" />
                    <h1 className="text-2xl font-bold text-slate-900">จัดการผู้ใช้</h1>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    เพิ่มผู้ใช้
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ชื่อ</th>
                                <th>อีเมล</th>
                                <th>รหัสนักศึกษา</th>
                                <th>แผนก</th>
                                <th>บทบาท</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="font-medium text-slate-900">{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.studentId || '-'}</td>
                                    <td>{user.department?.name || '-'}</td>
                                    <td>{getRoleBadge(user.role)}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">ชื่อ-นามสกุล</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">บทบาท</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="STUDENT">นักศึกษา</option>
                                        <option value="TEACHER">อาจารย์</option>
                                        <option value="ADMIN">ผู้ดูแลระบบ</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">อีเมล</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    รหัสผ่าน {editingUser && <span className="text-slate-400 font-normal">(เว้นว่างหากไม่ต้องการเปลี่ยน)</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input"
                                    {...(!editingUser && { required: true })}
                                />
                            </div>

                            {formData.role === 'STUDENT' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">รหัสนักศึกษา</label>
                                        <input
                                            type="text"
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleChange}
                                            className="input"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="form-group">
                                            <label className="form-label">แผนก</label>
                                            <select
                                                name="departmentId"
                                                value={formData.departmentId}
                                                onChange={handleChange}
                                                className="input"
                                            >
                                                <option value="">เลือกแผนก</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>
                        
                                        <div className="form-group">
                                            <label className="form-label">สาขา</label>
                                            <select
                                                name="sakaId"
                                                value={formData.sakaId}
                                                onChange={handleChange}
                                                className="input"
                                            >
                                                <option value="">เลือกสาขา</option>
                                                {sakas.map(saka => (
                                                    <option key={saka.id} value={saka.id}>{saka.saka_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

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
                                    {editingUser ? 'บันทึก' : 'สร้างผู้ใช้'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserManagement
