import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { User, Mail, Lock, Save } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const UserProfile = () => {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setFormData(prev => ({
        ...prev,
        name: parsed.name || '',
        email: parsed.email || ''
      }))
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setMessage({ type: '', text: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' })
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        name: formData.name,
        email: formData.email
      }

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword
        payload.newPassword = formData.newPassword
      }

      await axios.put(`${API_URL}/users/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const updatedUser = { ...user, name: formData.name, email: formData.email }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)

      setMessage({ type: 'success', text: 'บันทึกข้อมูลสำเร็จ!' })
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'ไม่สามารถบันทึกข้อมูลได้' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">โปรไฟล์ผู้ใช้</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-700 mx-auto mb-4">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="inline-block mt-3 badge badge-info">{user?.role}</span>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">แก้ไขข้อมูล</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  <User className="w-4 h-4 inline mr-1" />
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Mail className="w-4 h-4 inline mr-1" />
                  อีเมล
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-700">เปลี่ยนรหัสผ่าน (ถ้าต้องการ)</h3>
              </div>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">รหัสผ่านปัจจุบัน</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="input"
                    placeholder="กรอกเฉพาะกรณีต้องการเปลี่ยนรหัสผ่าน"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">รหัสผ่านใหม่</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ยืนยันรหัสผ่านใหม่</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
