import React from 'react'
import { CheckCircle, QrCode, Clock, FileText } from 'lucide-react'

const About = () => {
  const features = [
    { icon: QrCode, label: 'รองรับการสแกน QR Code' },
    { icon: Clock, label: 'ระบบบันทึกเวลาอัตโนมัติ' },
    { icon: FileText, label: 'ระบบขอลาออนไลน์' },
    { icon: CheckCircle, label: 'รายงานสรุปการลงเวลา' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">เกี่ยวกับเรา</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            ระบบบันทึกเวลาฝึกงาน
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            ระบบนี้ถูกพัฒนาขึ้นเพื่อช่วยให้การบันทึกเวลาเข้า-ออกงานของนักศึกษาฝึกงาน
            เป็นไปอย่างสะดวกและมีประสิทธิภาพ รองรับการสแกน QR Code และการลงเวลาแบบ Manual
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            สามารถติดตามประวัติการลงเวลา ขอลา และดูรายงานสรุปได้ตลอดเวลา
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">คุณสมบัติหลัก</h3>
            <ul className="space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-slate-700">{feature.label}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
