import React from 'react'
import { Bell } from 'lucide-react'

const Notification = () => {
  const notifications = []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">การแจ้งเตือน</h1>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="empty-state-text">ไม่มีการแจ้งเตือน</p>
            <p className="text-sm text-slate-400">เมื่อมีการแจ้งเตือนใหม่ จะแสดงที่นี่</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif, index) => (
              <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                <p className="text-sm text-slate-900">{notif.message}</p>
                <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notification
