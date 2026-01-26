import React, { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

const GenerateQRCode = () => {
  const [employeeId, setEmployeeId] = useState('')
  const [qrData, setQrData] = useState('')
  const [actionType, setActionType] = useState('')

  const handleGenerate = (type) => {
    if (!employeeId) {
      alert('กรุณากรอกรหัสพนักงานก่อน')
      return
    }

    const timestamp = new Date().toISOString()
    const data = JSON.stringify({
      id: employeeId,
      time: timestamp,
      type: type // 'check-in' หรือ 'check-out'
    })

    setActionType(type)
    setQrData(data)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">สร้าง QR Code สำหรับลงเวลา</h1>

      <input
        type="text"
        className="border px-4 py-2 rounded mb-4 w-full max-w-md"
        placeholder="รหัสพนักงาน"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      />

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => handleGenerate('check-in')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          สร้าง QR เข้างาน
        </button>
        <button
          onClick={() => handleGenerate('check-out')}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          สร้าง QR ออกงาน
        </button>
      </div>

      {qrData && (
        <div className="bg-white p-4 rounded shadow text-center">
          <QRCodeCanvas value={qrData} size={256} />
          <p className="mt-2 text-sm text-gray-500 break-all">
            ประเภท: <strong>{actionType === 'check-in' ? 'เข้างาน' : 'ออกงาน'}</strong><br />
            ข้อมูล: {qrData}
          </p>
        </div>
      )}
    </div>
  )
}

export default GenerateQRCode
