import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { User, Mail, Lock, IdCard, UserPlus, Loader, Building2, BookOpen } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    departmentId: '',
    sakaId: '',
    role: 'STUDENT'
  })
  const [departments, setDepartments] = useState([])
  const [sakas, setSakas] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMasterData()
  }, [])

  const fetchMasterData = async () => {
    try {
      const [deptRes, sakaRes] = await Promise.all([
        axios.get(`${API_URL}/public/departments`),
        axios.get(`${API_URL}/public/sakas`)
      ])
      setDepartments(deptRes.data)
      setSakas(sakaRes.data)
    } catch (err) {
      console.error('Error fetching master data:', err)
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

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentId: formData.studentId,
        departmentId: formData.departmentId,
        sakaId: formData.sakaId,
        role: formData.role
      }

      await axios.post(`${API_URL}/register`, payload)

      // Auto login after register
      const loginRes = await axios.post(`${API_URL}/login`, {
        email: formData.email,
        password: formData.password
      })

      localStorage.setItem('token', loginRes.data.token)
      localStorage.setItem('user', JSON.stringify(loginRes.data.user))

      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">สมัครสมาชิก</h1>
            <p className="text-sm text-slate-500 mt-1">สร้างบัญชีเพื่อเริ่มใช้งาน</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="สมชาย ใจดี"
                className="input"
                required
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
                placeholder="example@email.com"
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <IdCard className="w-4 h-4 inline mr-1" />
                รหัสนักศึกษา
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="6xxxxxxxxx"
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  คณะ / แผนก
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">เลือกคณะ...</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  สาขา
                </label>
                <select
                  name="sakaId"
                  value={formData.sakaId}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">เลือกสาขา...</option>
                  {sakas.map(saka => (
                    <option key={saka.id} value={saka.id}>{saka.saka_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  <Lock className="w-4 h-4 inline mr-1" />
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Lock className="w-4 h-4 inline mr-1" />
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-danger text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  สมัครสมาชิก
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" className="text-slate-900 font-medium hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
