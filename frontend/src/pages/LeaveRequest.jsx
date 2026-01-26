import React, { useState, useEffect } from 'react'
import axios from 'axios'

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
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    const labels = {
      PENDING: 'รอดำเนินการ',
      APPROVED: 'อนุมัติ',
      REJECTED: 'ไม่อนุมัติ'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">ขอลา</h2>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">สร้างคำขอลา</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทการลา</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            >
              <option value="SICK">ลาป่วย</option>
              <option value="PERSONAL">ลากิจ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เหตุผล</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              placeholder="ระบุเหตุผลการลา..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isLoading ? 'กำลังส่ง...' : 'ส่งคำขอลา'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">ประวัติการลา</h3>
        {leaveHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">ยังไม่มีประวัติการลา</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">วันที่</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ประเภท</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">เหตุผล</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaveHistory.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(leave.startDate).toLocaleDateString('th-TH')} - {new Date(leave.endDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {leave.type === 'SICK' ? 'ลาป่วย' : 'ลากิจ'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{leave.reason}</td>
                    <td className="px-4 py-3">{getStatusBadge(leave.status)}</td>
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
