import React from 'react'
import { Link } from 'react-router-dom'

const Indexs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            ระบบลงเวลาฝึกงาน
          </h1>
          <p className="text-gray-600">
            ระบบสำหรับเช็คชื่อและจัดการเวลาการฝึกงาน
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl mb-1">📱</div>
            <p className="text-xs text-gray-600">QR Code</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl mb-1">⏰</div>
            <p className="text-xs text-gray-600">เช็คเวลา</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl mb-1">📊</div>
            <p className="text-xs text-gray-600">รายงาน</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            to="/register"
            className="block w-full py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition"
          >
            สมัครสมาชิก
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Internship Attendance System
        </p>
      </div>
    </div>
  )
}

export default Indexs
