import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QRCodeCanvas } from 'qrcode.react'
import axios from 'axios'
import { QrCode, Camera, Clock, RefreshCw, LogIn, LogOut } from 'lucide-react'

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
    if (!dateString) return '--:--'
    return new Date(dateString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 text-center">สแกน QR Code ลงเวลา</h1>

      {/* Today Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">สถานะวันนี้</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">เข้างาน</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{formatTime(todayAttendance?.checkIn)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">ออกงาน</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{formatTime(todayAttendance?.checkOut)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <QrCode className="w-5 h-5 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">QR Code สำหรับสแกน</h2>
          </div>
          <div className="flex flex-col items-center">
            {qrData && (
              <>
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <QRCodeCanvas value={qrData} size={180} />
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  หมดอายุใน <span className="font-bold text-slate-900 font-mono">{countdown}</span> วินาที
                </p>
                <button
                  onClick={generateQRCode}
                  className="mt-3 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  สร้างใหม่
                </button>
              </>
            )}
          </div>
        </div>

        {/* Scanner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Camera className="w-5 h-5 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">สแกนด้วยกล้อง</h2>
          </div>
          <div id="reader" className="overflow-hidden rounded-xl"></div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl text-center text-sm font-medium ${messageType === 'success' ? 'bg-green-50 text-green-700' :
            messageType === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
          }`}>
          {message}
        </div>
      )}

      {/* Manual Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 text-center">หรือกดปุ่มลงเวลา</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCheckIn}
            disabled={isLoading || todayAttendance?.checkIn}
            className="py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            ลงเวลาเข้างาน
          </button>
          <button
            onClick={handleCheckOut}
            disabled={isLoading || !todayAttendance?.checkIn || todayAttendance?.checkOut}
            className="py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            ลงเวลาออกงาน
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScanQRCode
