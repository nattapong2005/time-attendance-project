import prisma from '../prisma.js';
import fs from 'fs';
import path from 'path';

// Helper: Get Thai date (UTC+7) as UTC midnight
const getThaiDateUTC = (date = new Date()) => {
    const thaiTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    return new Date(Date.UTC(thaiTime.getUTCFullYear(), thaiTime.getUTCMonth(), thaiTime.getUTCDate()));
};

export const checkIn = async (req, res) => {
    const userId = req.user.id;
    // Normalize to start of day for unique constraint (Thai Date)
    const startOfDay = getThaiDateUTC();

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
        // Rule: Late if after 9:00 AM (Thai Time)
        const thaiNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        const isLate = thaiNow.getUTCHours() > 9 || (thaiNow.getUTCHours() === 9 && thaiNow.getUTCMinutes() > 0);

        const { photo } = req.body;
        let photoPath = null;

        if (photo) {
            // Save photo
            const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `checkin-${userId}-${Date.now()}.jpg`;
            const uploadDir = path.join(process.cwd(), 'uploads');

            // Ensure directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            fs.writeFileSync(path.join(uploadDir, filename), buffer);
            photoPath = `/uploads/${filename}`;
        }

        const attendance = await prisma.attendance.create({
            data: {
                userId,
                date: startOfDay, // Use normalized date for unique constraint
                checkIn: now,
                status: 'PRESENT',
                isLate,
                checkInPhoto: photoPath
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
    const startOfDay = getThaiDateUTC();
    // End of day is start of next day for lt comparison
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    try {
        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                date: startOfDay // Match strictly by the normalized date
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

export const getTodayAttendance = async (req, res) => {
    const userId = req.user.id;
    const startOfDay = getThaiDateUTC();

    try {
        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                date: startOfDay
            }
        });
        res.json(attendance);
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
    // date should be parseable, treat as Thai date
    const attendanceDate = getThaiDateUTC(new Date(date));

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

export const createAttendance = async (req, res) => {
    try {
        const { userId, date, checkIn, checkOut, status, isLate } = req.body;

        const attendanceDate = getThaiDateUTC(new Date(date));

        const existing = await prisma.attendance.findFirst({
            where: { userId, date: attendanceDate }
        });

        if (existing) {
            return res.status(400).json({ error: 'Attendance record for this user and date already exists' });
        }

        const data = {
            userId: parseInt(userId),
            date: attendanceDate,
            status: status || 'PRESENT',
            isLate: isLate || false
        };

        if (checkIn) data.checkIn = new Date(checkIn);
        if (checkOut) data.checkOut = new Date(checkOut);

        const newRecord = await prisma.attendance.create({ data });
        res.json(newRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteAttendance = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.attendance.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Attendance record deleted successfully' });
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

    // Construct dates in UTC to match the storage strategy
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0)); // Last day of month

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
