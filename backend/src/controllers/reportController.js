import prisma from '../prisma.js';

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count({ where: { role: 'STUDENT' } });
        const totalDepartments = await prisma.department.count();

        const today = new Date();
        // Use UTC to match @db.Date storage which is time-agnostic (00:00:00 UTC effectively)
        const startOfDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const endOfDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1));

        const checkInsToday = await prisma.attendance.count({
            where: {
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                status: 'PRESENT'
            }
        });

        const absentToday = await prisma.attendance.count({
            where: {
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                status: 'ABSENT'
            }
        });

        const pendingLeaves = await prisma.leaveRequest.count({
            where: { status: 'PENDING' }
        });

        res.json({
            totalUsers,
            totalDepartments,
            checkInsToday,
            absentToday,
            pendingLeaves
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getAttendanceSummary = async (req, res) => {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: 'Month and Year required' });

    // Use UTC for consistent querying
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const nextMonthStartDate = new Date(Date.UTC(year, month, 1));

    try {
        const data = await prisma.attendance.groupBy({
            by: ['status'],
            where: {
                date: {
                    gte: startDate,
                    lt: nextMonthStartDate
                }
            },
            _count: {
                status: true
            }
        });

        const formatted = {
            PRESENT: 0,
            ABSENT: 0,
            LATE: 0,
            LEAVE: 0
        };

        data.forEach(item => {
            formatted[item.status] = item._count.status;
        });

        // Also count late arrivals specifically if stored as boolean
        const lateCount = await prisma.attendance.count({
            where: {
                date: {
                    gte: startDate,
                    lt: nextMonthStartDate
                },
                isLate: true
            }
        });

        formatted.LATE = lateCount;

        res.json(formatted);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getMonthlyTrends = async (req, res) => {
    try {
        const currentDate = new Date();
        const monthlyData = [];

        // Get last 6 months of data
        for (let i = 5; i >= 0; i--) {
            const tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const year = tempDate.getFullYear();
            const month = tempDate.getMonth() + 1; // 1-12

            // Use UTC to match DB and use lt for next month first day to capture all records
            const startDate = new Date(Date.UTC(year, month - 1, 1));
            const nextMonthStartDate = new Date(Date.UTC(year, month, 1));

            // Count PRESENT (not late)
            const presentCount = await prisma.attendance.count({
                where: {
                    date: { gte: startDate, lt: nextMonthStartDate },
                    status: 'PRESENT',
                    isLate: false
                }
            });

            // Count LATE
            const lateCount = await prisma.attendance.count({
                where: {
                    date: { gte: startDate, lt: nextMonthStartDate },
                    isLate: true
                }
            });

            // Count ABSENT
            const absentCount = await prisma.attendance.count({
                where: {
                    date: { gte: startDate, lt: nextMonthStartDate },
                    status: 'ABSENT'
                }
            });

            monthlyData.push({
                month,
                year,
                present: presentCount,
                late: lateCount,
                absent: absentCount
            });
        }

        res.json(monthlyData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getStudentStats = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const where = {
            role: 'STUDENT',
            OR: [
                { name: { contains: search } },
                { email: { contains: search } }
            ]
        };

        // Get total count for pagination
        const totalUsers = await prisma.user.count({ where });

        // Get students with pagination
        const students = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                department: {
                    select: { name: true }
                }
            },
            skip,
            take: limit,
            orderBy: { name: 'asc' }
        });

        // Get stats for each student
        const studentStats = await Promise.all(students.map(async (student) => {
            const stats = await prisma.attendance.groupBy({
                by: ['status'],
                where: { userId: student.id },
                _count: { status: true }
            });

            const lateCount = await prisma.attendance.count({
                where: { userId: student.id, isLate: true }
            });

            const counts = {
                PRESENT: 0,
                ABSENT: 0,
                LEAVE: 0,
                LATE: lateCount // Explicit late count
            };

            stats.forEach(stat => {
                counts[stat.status] = stat._count.status;
            });

            // If a record is PRESENT and Late, it's counted in PRESENT by groupBy, 
            // but we might want to display it distinctly or just show "Late" as a subset.
            // Usually "Late" implies they were Present but Late. 
            // Let's keep counts pure: 
            // - Total Present (including late)
            // - Total Late (subset of present)
            // - Total Absent

            return {
                ...student,
                stats: counts
            };
        }));

        res.json({
            students: studentStats,
            pagination: {
                total: totalUsers,
                page,
                totalPages: Math.ceil(totalUsers / limit)
            }
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

