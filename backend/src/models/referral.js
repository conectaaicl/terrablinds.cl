const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Referral = sequelize.define('Referral', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    referrer_name: { type: DataTypes.STRING(200), allowNull: false },
    referrer_email: { type: DataTypes.STRING(200) },
    referrer_phone: { type: DataTypes.STRING(30) },
    referred_name: { type: DataTypes.STRING(200) },
    referred_email: { type: DataTypes.STRING(200) },
    referred_phone: { type: DataTypes.STRING(30) },
    status: {
        type: DataTypes.ENUM('pending', 'contacted', 'completed', 'rejected'),
        defaultValue: 'pending',
    },
    reward_amount: { type: DataTypes.INTEGER, defaultValue: 0 },
    notes: { type: DataTypes.TEXT },
}, { tableName: 'referrals', underscored: true, timestamps: true });

module.exports = Referral;
