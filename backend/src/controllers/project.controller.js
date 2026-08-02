const { Project } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const projects = await Project.findAll({
            where: { is_active: true },
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
        });
        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err.message);
        res.status(500).json({ error: 'Error fetching projects' });
    }
};

exports.getAllAdmin = async (req, res) => {
    try {
        const projects = await Project.findAll({
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
        });
        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err.message);
        res.status(500).json({ error: 'Error fetching projects' });
    }
};

exports.create = async (req, res) => {
    try {
        const { title, category, location, description, image_url, sort_order } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });
        const project = await Project.create({ title, category, location, description, image_url, sort_order: sort_order || 0 });
        res.status(201).json(project);
    } catch (err) {
        console.error('Error creating project:', err.message);
        res.status(500).json({ error: 'Error creating project' });
    }
};

exports.update = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const { title, category, location, description, image_url, is_active, sort_order } = req.body;
        await project.update({ title, category, location, description, image_url, is_active, sort_order });
        res.json(project);
    } catch (err) {
        console.error('Error updating project:', err.message);
        res.status(500).json({ error: 'Error updating project' });
    }
};

exports.remove = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        await project.destroy();
        res.json({ message: 'Project deleted' });
    } catch (err) {
        console.error('Error deleting project:', err.message);
        res.status(500).json({ error: 'Error deleting project' });
    }
};
