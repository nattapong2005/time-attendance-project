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
    Shield,
    User,
    ChevronDown,
    Settings
} from 'lucide-react'

const UserLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [user, setUser] = useState(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)

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
        // { path: '/scan-qr-code', label: 'สแกน QR / กล้อง', icon: QrCode },
        { path: '/leave-request', label: 'ขอลา', icon: FileText },
        // { path: '/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
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
                        <div className="flex items-center gap-3 relative">
                            {/* Non-mobile User Name display (optional, can be part of dropdown trigger) */}

                            {/* Desktop User Menu (Hidden on Mobile) */}
                            <div className="hidden md:block relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all"
                                >
                                    <span>{user?.name || 'User'}</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsProfileOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden z-20 py-1">
                                            <div className="px-4 py-3 border-b border-slate-50">
                                                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                            </div>

                                            <Link
                                                to="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <Settings className="w-4 h-4" />
                                                ตั้งค่าโปรไฟล์
                                            </Link>

                                            <Link
                                                to="/dashboard"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                ภาพรวม
                                            </Link>

                                            <Link
                                                to="/about"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <Info className="w-4 h-4" />
                                                เกี่ยวกับ
                                            </Link>

                                            <div className="border-t border-slate-50 mt-1">
                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    ออกจากระบบ
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

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
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100 border-t border-slate-200' : 'max-h-0 opacity-0'
                        }`}
                >
                    <nav className="bg-white px-4 py-3 space-y-1">
                        {/* User Info Mobile */}
                        <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </div>

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

                        {/* Mobile Profile & Logout */}
                        <Link
                            to="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            ภาพรวม
                        </Link>

                        <Link
                            to="/about"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            <Info className="w-5 h-5" />
                            เกี่ยวกับ
                        </Link>

                        <Link
                            to="/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            <Settings className="w-5 h-5" />
                            ตั้งค่าโปรไฟล์
                        </Link>

                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-5 h-5" />
                            ออกจากระบบ
                        </button>
                    </nav>
                </div>
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
