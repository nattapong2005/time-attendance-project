import prisma from '../prisma.js';
import bcrypt from 'bcrypt';

export const createUser = async (req, res) => {
    const { name, email, password, role, departmentId, locationId, studentId } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields: name, email, password, role' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const validRoles = ['STUDENT', 'ADMIN', 'TEACHER'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: `Invalid role. Allowed: ${validRoles.join(', ')}` });
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                studentId,
                departmentId,
                locationId
            }
        });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                studentId: true,
                department: true,
                internshipLocation: true,
                createdAt: true
            }
        });
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
    }

    if (data.role) {
        const validRoles = ['STUDENT', 'ADMIN', 'TEACHER'];
        if (!validRoles.includes(data.role)) {
            return res.status(400).json({ error: `Invalid role. Allowed: ${validRoles.join(', ')}` });
        }
    }

    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    // Remove undefined fields
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data
        });
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'User deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
