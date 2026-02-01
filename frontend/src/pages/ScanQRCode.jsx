import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QRCodeCanvas } from 'qrcode.react'
import axios from 'axios'
import { QrCode, Camera, Clock, RefreshCw, LogIn, LogOut, Check, X as XIcon, Image as ImageIcon } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const ScanQRCode = () => {
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [qrData, setQrData] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Camera & Photo State
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)

  const scannerRef = useRef(null)
  const timerRef = useRef(null)
  const scanLock = useRef(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Initialize QR Scanner
  const initScanner = () => {
    if (scannerRef.current || isCameraOpen || capturedPhoto) return

    try {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } }
      const scanner = new Html5QrcodeScanner('reader', config, false)
      scanner.render(onScanSuccess, onScanFailure)
      scannerRef.current = scanner
    } catch (err) {
      console.error("Error initializing scanner:", err)
    }
  }

  // Clear QR Scanner
  const clearScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear()
        scannerRef.current = null
      } catch (error) {
        console.error("Failed to clear scanner", error)
      }
    }
  }

  useEffect(() => {
    checkTodayAttendance()
    generateQRCode()

    // Real-time clock timer
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Initial start if camera not open
    if (!isCameraOpen) {
      initScanner()
    }

    return () => {
      // Cleanup on unmount
      clearScanner()
      clearInterval(timerRef.current)
      clearInterval(clockTimer)
      stopCamera(false) // Don't restart scanner on unmount
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
      const response = await axios.get(`${API_URL}/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTodayAttendance(response.data || null)
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

  // Camera Functions
  const startCamera = async () => {
    // 1. Stop QR Scanner first to free up camera
    await clearScanner()

    setCapturedPhoto(null)
    setIsCameraOpen(true)
    setMessage('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setMessage("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้อง หรือปิดโปรแกรมอื่นที่ใช้กล้องอยู่")
      setMessageType('error')
      setIsCameraOpen(false)
      // Attempt to restart scanner if selfie failed
      initScanner()
    }
  }

  const stopCamera = (shouldRestartScanner = true) => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraOpen(false)

    if (shouldRestartScanner) {
      // Add small delay to ensure camera is fully released
      setTimeout(() => {
        initScanner()
      }, 500)
    }
  }

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedPhoto(dataUrl)
      stopCamera()
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    startCamera()
  }

  const handleCheckIn = async (withPhoto = false) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const body = withPhoto && capturedPhoto ? { photo: capturedPhoto } : {}

      const response = await axios.post(`${API_URL}/attendance/check-in`, body, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setTodayAttendance(response.data)
      setMessage('ลงเวลาเข้างานสำเร็จ!')
      setMessageType('success')
      setCapturedPhoto(null)
      setIsCameraOpen(false)
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
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">ลงเวลาเข้า-ออกงาน</h1>
        <div className="inline-block px-6 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            {currentTime.toLocaleDateString('th-TH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-3xl font-bold font-mono text-slate-900 mt-1">
            {currentTime.toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>
      </div>

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

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl text-center text-sm font-medium ${messageType === 'success' ? 'bg-green-50 text-green-700' :
          messageType === 'error' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
          {message}
        </div>
      )}

      {/* Selfie Check-in Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <Camera className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">ถ่ายรูปยืนยันตัวตน</h2>
        </div>

        <div className="flex flex-col items-center gap-4">
          {!isCameraOpen && !capturedPhoto && (
            <button
              onClick={startCamera}
              disabled={isLoading || todayAttendance?.checkIn}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Camera className="w-6 h-6 text-slate-500" />
              </div>
              <span className="font-medium">แตะเพื่อเปิดกล้อง</span>
            </button>
          )}

          {isCameraOpen && (
            <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto object-cover transform scale-x-[-1]" />
              <button
                onClick={takePhoto}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center hover:scale-105 transition-transform"
              >
                <div className="w-12 h-12 bg-red-500 rounded-full"></div>
              </button>
              <button
                onClick={stopCamera}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {capturedPhoto && (
            <div className="flex flex-col items-center w-full gap-4">
              <div className="relative w-full max-w-sm mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={capturedPhoto} alt="Captured" className="w-full h-auto" />
                <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full shadow-sm flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  พร้อมส่ง
                </div>
              </div>

              <div className="flex w-full gap-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  ถ่ายใหม่
                </button>
                <button
                  onClick={() => handleCheckIn(true)}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'กำลังบันทึก...' : 'ยืนยันลงเวลา'}
                </button>
              </div>
            </div>
          )}

          {/* Hidden Canvas for Capture */}
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual Check-out */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 text-center">ออกงาน</h2>
          <button
            onClick={handleCheckOut}
            disabled={isLoading || !todayAttendance?.checkIn || todayAttendance?.checkOut}
            className="w-full py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            ลงเวลาออกงาน
          </button>
        </div>

        {/* QR Code Scan (Legacy) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <QrCode className="w-5 h-5 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">สแกน QR Codes</h2>
          </div>
          <div id="reader" className="overflow-hidden rounded-xl"></div>
        </div>
      </div>

    </div>
  )
}

export default ScanQRCode
