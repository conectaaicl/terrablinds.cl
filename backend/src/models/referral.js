const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Referral = sequelize.define('Referral', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    owner_name: { type: DataTypes.STRING(200), allowNull: false },
    owner_email: { type: DataTypes.STRING(200) },
    discount_pct: { type: DataTypes.INTEGER, defaultValue: 10 },
    uses_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    max_uses: { type: DataTypes.INTEGER, allowNull: true },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    notes: { type: DataTypes.TEXT },
}, { tableName: 'referrals', timestamps: true, underscored: true });

module.exports = Referral;
