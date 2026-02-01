import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    Clock,
    FileText,
    Building2,
    BookOpen,
    MapPin,
    BarChart3,
    LogOut,
    Menu,
    ChevronLeft,
    ChevronRight,
    Shield
} from 'lucide-react'

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

        if (parsedUser.role !== 'ADMIN' && parsedUser.role !== 'TEACHER') {
            navigate('/home')
        }
    }, [navigate])

    const handleSignOut = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    const navLinks = [
        { path: '/admin/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
        { path: '/admin/users', label: 'จัดการผู้ใช้', icon: Users },
        { path: '/admin/attendance', label: 'การลงเวลา', icon: Clock },
        { path: '/admin/leaves', label: 'คำขอลา', icon: FileText },
        { path: '/admin/departments', label: 'แผนก', icon: Building2 },
        { path: '/admin/sakas', label: 'สาขา', icon: BookOpen },
        { path: '/admin/reports', label: 'รายงาน', icon: BarChart3 },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar - Desktop */}
            <aside className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-16'}`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-slate-900">Admin</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                        {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const Icon = link.icon
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                title={!isSidebarOpen ? link.label : undefined}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {isSidebarOpen && <span>{link.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Info */}
                <div className="p-3 border-t border-slate-200">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-700">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500">{user?.role}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-700">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                    <div className="flex justify-between items-center px-4 sm:px-6 h-16">
                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <h1 className="text-lg font-semibold text-slate-900">
                                {navLinks.find(l => isActive(l.path))?.label || 'Admin Panel'}
                            </h1>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">ออกจากระบบ</span>
                        </button>
                    </div>
                </header>

                {/* Mobile Sidebar */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50">
                        <div
                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        ></div>
                        <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-slate-900">Admin Panel</span>
                            </div>
                            <nav className="space-y-1">
                                {navLinks.map((link) => {
                                    const Icon = link.icon
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(link.path)
                                                    ? 'bg-slate-900 text-white'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{link.label}</span>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </aside>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
                    <div className="page-enter">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
