import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QRCodeCanvas } from 'qrcode.react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const ScanQRCode = () => {
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [qrData, setQrData] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [isLoading, setIsLoading] = useState(false)

  const scannerRef = useRef(null)
  const timerRef = useRef(null)
  const scanLock = useRef(false)

  useEffect(() => {
    checkTodayAttendance()
    generateQRCode()

    if (!scannerRef.current) {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } }
      const scanner = new Html5QrcodeScanner('reader', config, false)
      scanner.render(onScanSuccess, onScanFailure)
      scannerRef.current = scanner
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => { })
      }
      clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      generateQRCode()
    }
  }, [countdown])

  const checkTodayAttendance = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/attendance/my-history`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const today = new Date().toDateString()
      const todayRecord = response.data.find(record =>
        new Date(record.date).toDateString() === today
      )

      setTodayAttendance(todayRecord || null)
    } catch (err) {
      console.error('Error checking attendance:', err)
    }
  }

  const generateQRCode = () => {
    const payload = JSON.stringify({
      type: 'attendance',
      timestamp: new Date().toISOString(),
      code: Math.random().toString(36).substr(2, 9)
    })

    setQrData(payload)
    setCountdown(30)

    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/attendance/check-in`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTodayAttendance(response.data)
      setMessage('ลงเวลาเข้างานสำเร็จ!')
      setMessageType('success')
    } catch (err) {
      setMessage(err.response?.data?.error || 'ไม่สามารถลงเวลาได้')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/attendance/check-out`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTodayAttendance(response.data)
      setMessage('ลงเวลาออกงานสำเร็จ!')
      setMessageType('success')
    } catch (err) {
      setMessage(err.response?.data?.error || 'ไม่สามารถลงเวลาได้')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const onScanSuccess = (decodedText) => {
    if (scanLock.current) return
    scanLock.current = true

    try {
      const parsed = JSON.parse(decodedText)
      const qrTime = new Date(parsed.timestamp)
      const now = new Date()

      if ((now - qrTime) / 1000 > 30) {
        setMessage('QR Code หมดอายุแล้ว')
        setMessageType('error')
      } else if (!todayAttendance?.checkIn) {
        handleCheckIn()
      } else if (!todayAttendance?.checkOut) {
        handleCheckOut()
      } else {
        setMessage('คุณได้ลงเวลาเข้า-ออกงานแล้ววันนี้')
        setMessageType('info')
      }
    } catch (err) {
      setMessage('QR Code ไม่ถูกต้อง')
      setMessageType('error')
    }

    setTimeout(() => {
      scanLock.current = false
    }, 2000)
  }

  const onScanFailure = () => { }

  const formatTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">สแกน QR Code ลงเวลา</h2>

      {/* Today Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">สถานะวันนี้</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">เข้างาน</p>
            <p className="text-xl font-bold text-green-600">{formatTime(todayAttendance?.checkIn)}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">ออกงาน</p>
            <p className="text-xl font-bold text-orange-600">{formatTime(todayAttendance?.checkOut)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">QR Code สำหรับสแกน</h3>
          <div className="flex flex-col items-center">
            {qrData && (
              <>
                <div className="p-4 bg-white rounded-lg shadow-inner">
                  <QRCodeCanvas value={qrData} size={200} />
                </div>
                <p className="mt-3 text-gray-600">หมดอายุใน <span className="font-bold text-indigo-600">{countdown}</span> วินาที</p>
                <button
                  onClick={generateQRCode}
                  className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  สร้างใหม่
                </button>
              </>
            )}
          </div>
        </div>

        {/* Scanner */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">สแกนด้วยกล้อง</h3>
          <div id="reader" className="overflow-hidden rounded-lg"></div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl text-center ${messageType === 'success' ? 'bg-green-100 text-green-700' :
            messageType === 'error' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
          }`}>
          {message}
        </div>
      )}

      {/* Manual Buttons */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">หรือกดปุ่มลงเวลา</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCheckIn}
            disabled={isLoading || todayAttendance?.checkIn}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            ลงเวลาเข้างาน
          </button>
          <button
            onClick={handleCheckOut}
            disabled={isLoading || !todayAttendance?.checkIn || todayAttendance?.checkOut}
            className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
          >
            ลงเวลาออกงาน
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScanQRCode
