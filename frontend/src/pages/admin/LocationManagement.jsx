import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const LocationManagement = () => {
    const [locations, setLocations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingLoc, setEditingLoc] = useState(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        address: ''
    })
    const [error, setError] = useState('')

    useEffect(() => {
        fetchLocations()
    }, [])

    const fetchLocations = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`${API_URL}/locations`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setLocations(response.data)
        } catch (err) {
            console.error('Error fetching locations:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.name.trim()) {
            setError('กรุณากรอกชื่อสถานที่')
            return
        }

        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            if (editingLoc) {
                await axios.put(`${API_URL}/locations/${editingLoc.id}`, formData, { headers })
            } else {
                await axios.post(`${API_URL}/locations`, formData, { headers })
            }

            setShowModal(false)
            setFormData({ name: '', address: '' })
            setEditingLoc(null)
            fetchLocations()
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        }
    }

    const openCreateModal = () => {
        setEditingLoc(null)
        setFormData({ name: '', address: '' })
        setShowModal(true)
    }

    const openEditModal = (loc) => {
        setEditingLoc(loc)
        setFormData({ name: loc.name, address: loc.address || '' })
        setShowModal(true)
    }

    const handleDelete = async (locId) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบสถานที่นี้?')) return

        try {
            const token = localStorage.getItem('token')
            await axios.delete(`${API_URL}/locations/${locId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchLocations()
        } catch (err) {
            console.error('Error deleting location:', err)
            alert('ไม่สามารถลบได้ (อาจมีผู้ใช้สังกัดสถานที่นี้อยู่)')
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
                <h2 className="text-2xl font-bold text-gray-800">จัดการสถานที่ฝึกงาน</h2>
                <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <span>+</span>
                    <span>เพิ่มสถานที่</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {locations.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">ไม่พบข้อมูลสถานที่</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ชื่อสถานที่</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ที่อยู่</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {locations.map((loc) => (
                                    <tr key={loc.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-700 w-20">{loc.id}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{loc.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{loc.address || '-'}</td>
                                        <td className="px-4 py-3 space-x-2 w-40">
                                            <button
                                                onClick={() => openEditModal(loc)}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                onClick={() => handleDelete(loc.id)}
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
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {editingLoc ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสถานที่</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                    placeholder="เช่น บริษัท ABC จำกัด, อาคาร..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none resize-none"
                                    placeholder="รายละเอียดที่อยู่..."
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
                                    {editingLoc ? 'บันทึก' : 'เพิ่ม'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LocationManagement
