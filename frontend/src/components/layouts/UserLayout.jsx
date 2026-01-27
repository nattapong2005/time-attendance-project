import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
    Home,
    LayoutDashboard,
    QrCode,
    FileText,
    Info,
    LogOut,
    Menu,
    X,
    Shield
} from 'lucide-react'

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

        setUser(JSON.parse(userData))
    }, [navigate])

    const handleSignOut = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    const navLinks = [
        { path: '/home', label: 'หน้าหลัก', icon: Home },
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/scan-qr-code', label: 'สแกน QR', icon: QrCode },
        { path: '/leave-request', label: 'ขอลา', icon: FileText },
        { path: '/about', label: 'เกี่ยวกับ', icon: Info },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/home" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-slate-900 hidden sm:block">Time Attendance</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                                                ? 'bg-slate-100 text-slate-900'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600 hidden sm:block">{user?.name}</span>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">ออกจากระบบ</span>
                            </button>

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            >
                                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-white">
                        <nav className="px-4 py-3 space-y-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(link.path)
                                                ? 'bg-slate-100 text-slate-900'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
                <div className="page-enter">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-4">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Time Attendance System
                </div>
            </footer>
        </div>
    )
}

export default UserLayout
