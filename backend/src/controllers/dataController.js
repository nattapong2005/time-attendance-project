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
// --- SAKAS ---
export const createSaka = async (req, res) => {
    const { saka_name } = req.body;
    try {
        const saka = await prisma.saka.create({ data: { saka_name } });
        res.status(201).json(saka);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getSakas = async (req, res) => {
    try {
        const sakas = await prisma.saka.findMany();
        res.json(sakas);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const updateSaka = async (req, res) => {
    const { id } = req.params;
    const { saka_name } = req.body;
    try {
        const saka = await prisma.saka.update({
            where: { id: parseInt(id) },
            data: { saka_name }
        });
        res.json(saka);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteSaka = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.saka.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Saka deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

