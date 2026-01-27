import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FileText, Calendar, History, Plus } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const LeaveRequest = () => {
  const [leaveHistory, setLeaveHistory] = useState([])
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'SICK',
    reason: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchLeaveHistory()
  }, [])

  const fetchLeaveHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/leaves/my-history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLeaveHistory(response.data)
    } catch (err) {
      console.error('Error fetching leave history:', err)
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
    setSuccess('')

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด')
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/leaves`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSuccess('ส่งคำขอลาสำเร็จ!')
      setFormData({ startDate: '', endDate: '', type: 'SICK', reason: '' })
      fetchLeaveHistory()
    } catch (err) {
      setError(err.response?.data?.error || 'ไม่สามารถส่งคำขอได้')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-danger'
    }
    const labels = {
      PENDING: 'รอดำเนินการ',
      APPROVED: 'อนุมัติ',
      REJECTED: 'ไม่อนุมัติ'
    }
    return (
      <span className={`badge ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">ขอลา</h1>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">สร้างคำขอลา</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                <Calendar className="w-4 h-4 inline mr-1" />
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Calendar className="w-4 h-4 inline mr-1" />
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ประเภทการลา</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input"
            >
              <option value="SICK">ลาป่วย</option>
              <option value="PERSONAL">ลากิจ</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FileText className="w-4 h-4 inline mr-1" />
              เหตุผล
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              placeholder="ระบุเหตุผลการลา..."
              className="input resize-none"
            />
          </div>

          {error && <div className="alert alert-danger text-sm">{error}</div>}
          {success && <div className="alert alert-success text-sm">{success}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                กำลังส่ง...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                ส่งคำขอลา
              </>
            )}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">ประวัติการลา</h2>
        </div>

        {leaveHistory.length === 0 ? (
          <div className="empty-state">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="empty-state-text">ยังไม่มีประวัติการลา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>ประเภท</th>
                  <th>เหตุผล</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {leaveHistory.map((leave) => (
                  <tr key={leave.id}>
                    <td className="font-medium text-slate-900">
                      {new Date(leave.startDate).toLocaleDateString('th-TH')} - {new Date(leave.endDate).toLocaleDateString('th-TH')}
                    </td>
                    <td>
                      {leave.type === 'SICK' ? 'ลาป่วย' : 'ลากิจ'}
                    </td>
                    <td className="max-w-xs truncate">{leave.reason}</td>
                    <td>{getStatusBadge(leave.status)}</td>
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

export default LeaveRequest
