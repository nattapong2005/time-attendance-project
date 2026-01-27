import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { MapPin, Plus, Edit, Trash2, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const LocationManagement = () => {
    const [locations, setLocations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingLoc, setEditingLoc] = useState(null)

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
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-slate-400" />
                    <h1 className="text-2xl font-bold text-slate-900">จัดการสถานที่ฝึกงาน</h1>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    เพิ่มสถานที่
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {locations.length === 0 ? (
                    <div className="empty-state">
                        <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="empty-state-text">ไม่พบข้อมูลสถานที่</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>ชื่อสถานที่</th>
                                    <th>ที่อยู่</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.map((loc) => (
                                    <tr key={loc.id}>
                                        <td className="w-20">{loc.id}</td>
                                        <td className="font-medium text-slate-900">{loc.name}</td>
                                        <td className="max-w-xs truncate">{loc.address || '-'}</td>
                                        <td className="w-32">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(loc)}
                                                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(loc.id)}
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
                    <div className="modal-content p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingLoc ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">ชื่อสถานที่</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="เช่น บริษัท ABC จำกัด"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">ที่อยู่</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="input resize-none"
                                    placeholder="รายละเอียดที่อยู่..."
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
