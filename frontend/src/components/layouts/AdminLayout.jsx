import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'

const AdminLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [user, setUser] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
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

        // Redirect non-admin to user home
        if (parsedUser.role !== 'ADMIN') {
            navigate('/home')
        }
    }, [navigate])

    const handleSignOut = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    const navLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/users', label: 'จัดการผู้ใช้', icon: '👥' },
        { path: '/admin/attendance', label: 'การลงเวลา', icon: '⏰' },
        { path: '/admin/leaves', label: 'คำขอลา', icon: '📝' },
        { path: '/admin/departments', label: 'แผนก', icon: '🏢' },
        { path: '/admin/locations', label: 'สถานที่ฝึกงาน', icon: '📍' },
        { path: '/admin/reports', label: 'รายงาน', icon: '📈' },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar - Desktop */}
            <aside className={`hidden md:flex flex-col bg-slate-800 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                {/* Logo */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🛡️</span>
                            <span className="font-bold">Admin Panel</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-slate-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(link.path)
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            <span className="text-xl">{link.icon}</span>
                            {isSidebarOpen && <span>{link.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-slate-700">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">{user?.name}</p>
                                <p className="text-xs text-slate-400">{user?.role}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 mx-auto bg-indigo-500 rounded-full flex items-center justify-center font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm sticky top-0 z-50">
                    <div className="flex justify-between items-center px-6 py-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <h1 className="text-xl font-semibold text-gray-800">
                            {navLinks.find(l => isActive(l.path))?.label || 'Admin Panel'}
                        </h1>

                        <button
                            onClick={handleSignOut}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
                        >
                            ออกจากระบบ
                        </button>
                    </div>
                </header>

                {/* Mobile Sidebar */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-40">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-800 text-white p-4">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-2xl">🛡️</span>
                                <span className="font-bold">Admin Panel</span>
                            </div>
                            <nav className="space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive(link.path)
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-300 hover:bg-slate-700'
                                            }`}
                                    >
                                        <span>{link.icon}</span>
                                        <span>{link.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </aside>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
