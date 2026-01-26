import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const About = () => {
  const navigate = useNavigate()

  const handleSignOut = () => {
    // แค่กลับไปหน้า Login ไม่ลบ user
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">MyWebApp</h1>
          <nav className="space-x-6 flex items-center">
            <Link to="/home" className="hover:underline">
              Home
            </Link>
            <Link to="/about" className="hover:underline">
              About
            </Link>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/scan-qr-code" className="hover:underline">
              Scan QR Code
            </Link>
            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition ml-4"
            >
              ออกจากระบบ
            </button>
          </nav>
        </div>
      </header>

      {/* Body */}
      <main className="flex-grow max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">About Us</h1>
        <p className="text-gray-700">
          ตรงนี้ก็ยังไม่ได้เขียนอะไรเหมือนกันค
        </p>
        <p className="mt-4 text-gray-700">
          ตรงนี้ก็ยังไม่ได้เขียนอะไรเหมือนกัน
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4 text-gray-500 text-sm mt-6">
        &copy; {new Date().getFullYear()} MyWebApp. All rights reserved.
      </footer>
    </div>
  )
}

export default About
