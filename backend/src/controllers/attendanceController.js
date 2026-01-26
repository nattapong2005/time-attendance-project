import prisma from '../prisma.js';

export const checkIn = async (req, res) => {
    const userId = req.user.id;
    const today = new Date();
    // Normalize to start of day for unique constraint
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    try {
        // Check if already checked in today using findUnique or findFirst
        const existing = await prisma.attendance.findFirst({
            where: {
                userId,
                date: startOfDay
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'คุณได้ลงเวลาเข้างานวันนี้แล้ว' });
        }

        const now = new Date();
        // Rule: Late if after 9:00 AM
        const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);

        const attendance = await prisma.attendance.create({
            data: {
                userId,
                date: startOfDay, // Use normalized date for unique constraint
                checkIn: now,
                status: 'PRESENT',
                isLate
            }
        });

        res.json(attendance);
    } catch (error) {
        // Handle unique constraint error gracefully
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'คุณได้ลงเวลาเข้างานวันนี้แล้ว' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const checkOut = async (req, res) => {
    const userId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    try {
        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        if (!attendance) {
            return res.status(400).json({ error: 'No check-in record found for today' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ error: 'Already checked out' });
        }

        const updated = await prisma.attendance.update({
            where: { id: attendance.id },
            data: { checkOut: new Date() }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyAttendance = async (req, res) => {
    const userId = req.user.id;
    try {
        const records = await prisma.attendance.findMany({
            where: { userId },
            orderBy: { date: 'desc' } // Newest first
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin/Teacher: View student attendance
export const getStudentAttendance = async (req, res) => {
    const { studentId } = req.params;
    try {
        const records = await prisma.attendance.findMany({
            where: { userId: parseInt(studentId) },
            orderBy: { date: 'desc' }
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Manual absence recording or adjustment
export const recordAbsence = async (req, res) => {
    const { userId, date } = req.body;
    // date should be parseable
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    try {
        const existing = await prisma.attendance.findFirst({
            where: { userId, date: attendanceDate }
        });

        if (existing) return res.status(400).json({ error: 'Record already exists' });

        const attendance = await prisma.attendance.create({
            data: {
                userId,
                date: attendanceDate,
                status: 'ABSENT'
            }
        });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAttendance = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, status, isLate } = req.body;
    try {
        const data = {};
        if (checkIn) data.checkIn = new Date(checkIn);
        if (checkOut) data.checkOut = new Date(checkOut);
        if (status) data.status = status;
        if (typeof isLate === 'boolean') data.isLate = isLate;

        const updated = await prisma.attendance.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getMonthlyReport = async (req, res) => {
    const { month, year } = req.query; // 1-12, YYYY
    if (!month || !year) return res.status(400).json({ error: 'Month and Year required' });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    try {
        const attendance = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: { user: { select: { name: true, studentId: true } } }
        });
        res.json(attendance);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
