import prisma from '../prisma.js';

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count({ where: { role: 'STUDENT' } });
        const totalDepartments = await prisma.department.count();
        const totalLocations = await prisma.internshipLocation.count();

        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

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
            totalLocations,
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

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    try {
        const data = await prisma.attendance.groupBy({
            by: ['status'],
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
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
                    lte: endDate
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
