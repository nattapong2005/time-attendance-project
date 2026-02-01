import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, QrCode, FileText, BarChart3, LogIn, UserPlus, Shield } from 'lucide-react'

const Indexs = () => {
  const features = [
    { icon: QrCode, title: 'QR Code', desc: 'สแกนลงเวลาง่าย' },
    { icon: Clock, title: 'บันทึกเวลา', desc: 'อัตโนมัติ' },
    { icon: FileText, title: 'ขอลาออนไลน์', desc: 'ลาป่วย / ลากิจ' },
    { icon: BarChart3, title: 'รายงาน', desc: 'สรุปข้อมูล' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          {/* Logo */}
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Time Attendance
          </h1>
          <p className="text-slate-500 mb-8">
            ระบบบันทึกเวลาฝึกงาน
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-slate-50 rounded-xl p-4 text-center">
                  <Icon className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-900">{feature.title}</p>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              เข้าสู่ระบบ
            </Link>
            <Link
              to="/register"
              className="w-full py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-slate-400 border-t border-slate-100">
        © {new Date().getFullYear()} Time Attendance System
      </footer>
    </div>
  )
}

export default Indexs
