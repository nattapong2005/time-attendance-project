import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const UserManagement = () => {
    const [users, setUsers] = useState([])
    const [departments, setDepartments] = useState([])
    const [locations, setLocations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT',
        studentId: '',
        departmentId: '',
        locationId: ''
    })
    const [error, setError] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            const [usersRes, deptsRes, locsRes] = await Promise.all([
                axios.get(`${API_URL}/users`, { headers }),
                axios.get(`${API_URL}/departments`, { headers }),
                axios.get(`${API_URL}/locations`, { headers })
            ])

            setUsers(usersRes.data)
            setDepartments(deptsRes.data)
            setLocations(locsRes.data)
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

            // Prepare payload
            const payload = {
                ...formData,
                departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
                locationId: formData.locationId ? parseInt(formData.locationId) : null
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
            studentId: '', departmentId: '', locationId: ''
        })
        setShowModal(true)
    }

    const openEditModal = (user) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Should be empty for edit
            role: user.role,
            studentId: user.studentId || '',
            departmentId: user.departmentId || '',
            locationId: user.locationId || ''
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
            ADMIN: 'bg-red-100 text-red-700',
            TEACHER: 'bg-blue-100 text-blue-700',
            STUDENT: 'bg-green-100 text-green-700'
        }
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>{role}</span>
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
                <h2 className="text-2xl font-bold text-gray-800">จัดการผู้ใช้</h2>
                <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <span>+</span>
                    <span>เพิ่มผู้ใช้</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ชื่อ</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">อีเมล</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">รหัสนักศึกษา</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">แผนก</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">บทบาท</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{user.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{user.studentId || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{user.department?.name || '-'}</td>
                                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                                    <td className="px-4 py-3 space-x-2">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                        >
                                            แก้ไข
                                        </button>
                                        {user.role !== 'ADMIN' && (
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                ลบ
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                    >
                                        <option value="STUDENT">นักศึกษา</option>
                                        <option value="TEACHER">อาจารย์</option>
                                        <option value="ADMIN">ผู้ดูแลระบบ</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    รหัสผ่าน {editingUser && '(เว้นว่างหากไม่ต้องการเปลี่ยน)'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                    {...(!editingUser && { required: true })}
                                />
                            </div>

                            {formData.role === 'STUDENT' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา</label>
                                        <input
                                            type="text"
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">แผนก</label>
                                            <select
                                                name="departmentId"
                                                value={formData.departmentId}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                            >
                                                <option value="">เลือกแผนก</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่ฝึกงาน</label>
                                            <select
                                                name="locationId"
                                                value={formData.locationId}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                            >
                                                <option value="">เลือกสถานที่</option>
                                                {locations.map(loc => (
                                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
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
