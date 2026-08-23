const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: true },
    email: { type: DataTypes.STRING(200), allowNull: true },
    phone: { type: DataTypes.STRING(50), allowNull: true },
    phone_normalized: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Chilean normalized format: +569XXXXXXXX',
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
}, {
    tableName: 'contacts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // Partial unique indexes on (email) and (phone_normalized) WHERE NOT NULL
    // are defined in migrate_growth_engine.sql — Sequelize cannot express WHERE-conditional indexes.
});

module.exports = Contact;
