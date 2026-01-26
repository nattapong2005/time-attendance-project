import prisma from '../prisma.js';

export const createLeaveRequest = async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, type, reason } = req.body;
    try {
        const leave = await prisma.leaveRequest.create({
            data: {
                userId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                type, // 'SICK' or 'PERSONAL'
                reason,
                status: 'PENDING'
            }
        });
        res.status(201).json(leave);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getMyLeaves = async (req, res) => {
    const userId = req.user.id;
    try {
        const leaves = await prisma.leaveRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(leaves);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const updateLeaveStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED', 'REJECTED'
    try {
        const leave = await prisma.leaveRequest.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json(leave);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteLeave = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.leaveRequest.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Leave request deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getAllLeaves = async (req, res) => {
    try {
        const leaves = await prisma.leaveRequest.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(leaves);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
