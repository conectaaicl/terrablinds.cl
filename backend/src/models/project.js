const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    category: { type: DataTypes.STRING(100), allowNull: false, defaultValue: '' },
    location: { type: DataTypes.STRING(200), allowNull: false, defaultValue: '' },
    description: { type: DataTypes.TEXT, allowNull: true },
    image_url: { type: DataTypes.STRING(500), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
    tableName: 'projects',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Project;
