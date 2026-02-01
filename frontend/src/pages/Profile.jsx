import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Lock, Save, Briefcase, Hash, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Profile = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: '',
        studentId: '',
        department: null,
        // Add other read-only fields if needed
    });
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('ไม่สามารถเรียกดูข้อมูลโปรไฟล์ได้');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            const data = {
                name: profile.name,
                email: profile.email,
                ...(password && { password }) // Only send password if provided
            };

            const response = await axios.put(`${API_URL}/profile`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfile(prev => ({ ...prev, ...response.data }));
            setMessage('บันทึกข้อมูลสำเร็จ');
            setPassword(''); // Clear password field

            // Update local storage user info if name changed
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...currentUser, name: response.data.name, email: response.data.email }));

        } catch (err) {
            setError(err.response?.data?.error || 'ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                        {profile.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">จัดการโปรไฟล์</h1>
                        <p className="text-slate-500">แก้ไขข้อมูลส่วนตัวของคุณ</p>
                    </div>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Read Only Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                ตำแหน่ง / ผู้ใช้งาน
                            </label>
                            <input
                                type="text"
                                value={profile.role}
                                disabled
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        {profile.studentId && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-slate-400" />
                                    รหัสนักศึกษา
                                </label>
                                <input
                                    type="text"
                                    value={profile.studentId}
                                    disabled
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 my-4 pt-4">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">ข้อมูลที่แก้ไขได้</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    ชื่อ-นามสกุล
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    อีเมล
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-slate-400" />
                                    เปลี่ยนรหัสผ่าน (เว้นว่างหากไม่ต้องการเปลี่ยน)
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="ใส่รหัสผ่านใหม่..."
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    บันทึกการเปลี่ยนแปลง
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
