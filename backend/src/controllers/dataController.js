import prisma from '../prisma.js';

// --- DEPARTMENTS ---
export const createDepartment = async (req, res) => {
    const { name } = req.body;
    try {
        const dept = await prisma.department.create({ data: { name } });
        res.status(201).json(dept);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getDepartments = async (req, res) => {
    try {
        const depts = await prisma.department.findMany();
        res.json(depts);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const updateDepartment = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const dept = await prisma.department.update({
            where: { id: parseInt(id) },
            data: { name }
        });
        res.json(dept);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.department.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Department deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// --- LOCATIONS ---
export const createLocation = async (req, res) => {
    const { name, address } = req.body;
    try {
        const loc = await prisma.internshipLocation.create({ data: { name, address } });
        res.status(201).json(loc);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getLocations = async (req, res) => {
    try {
        const locs = await prisma.internshipLocation.findMany();
        res.json(locs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const updateLocation = async (req, res) => {
    const { id } = req.params;
    const { name, address } = req.body;
    try {
        const loc = await prisma.internshipLocation.update({
            where: { id: parseInt(id) },
            data: { name, address }
        });
        res.json(loc);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteLocation = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.internshipLocation.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Location deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
