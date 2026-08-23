const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Uses the existing 'referrals' table (coupon-code based referral program)
const Referral = sequelize.define('Referral', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    owner_name: { type: DataTypes.STRING(200), allowNull: false },
    owner_email: { type: DataTypes.STRING(200) },
    discount_pct: { type: DataTypes.INTEGER, defaultValue: 10 },
    uses_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    max_uses: { type: DataTypes.INTEGER },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    notes: { type: DataTypes.TEXT },
}, { tableName: 'referrals', underscored: true, timestamps: true });

module.exports = Referral;
