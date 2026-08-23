const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    source: { type: DataTypes.STRING, defaultValue: 'chat' },
    notes: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('new', 'contacted', 'converted', 'lost'), defaultValue: 'new' },
    contact_id: { type: DataTypes.INTEGER, allowNull: true },
    opportunity_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
    tableName: 'leads',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Lead;
