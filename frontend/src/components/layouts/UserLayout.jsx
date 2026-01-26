import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'

const UserLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [user, setUser] = useState(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            navigate('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Redirect admin to admin dashboard
        if (parsedUser.role === 'ADMIN') {
            navigate('/admin/dashboard')
        }
    }, [navigate])

    const handleSignOut = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    const navLinks = [
        { path: '/home', label: 'หน้าหลัก', icon: '🏠' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/scan-qr-code', label: 'Scan QR', icon: '📱' },
        { path: '/leave-request', label: 'ขอลา', icon: '📝' },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/home" className="flex items-center gap-2">
                            <span className="text-2xl">⏰</span>
                            <span className="text-xl font-bold hidden sm:block">ระบบลงเวลาฝึกงาน</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition ${isActive(link.path)
                                            ? 'bg-white/20 font-semibold'
                                            : 'hover:bg-white/10'
                                        }`}
                                >
                                    <span>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <span className="hidden sm:block text-sm">{user?.name}</span>
                            <button
                                onClick={handleSignOut}
                                className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
                            >
                                ออกจากระบบ
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-white/10"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <nav className="md:hidden pb-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isActive(link.path)
                                            ? 'bg-white/20 font-semibold'
                                            : 'hover:bg-white/10'
                                        }`}
                                >
                                    <span>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 text-center py-4 text-gray-500 text-sm mt-auto">
                &copy; {new Date().getFullYear()} ระบบลงเวลาฝึกงาน. All rights reserved.
            </footer>
        </div>
    )
}

export default UserLayout
