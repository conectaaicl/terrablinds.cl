const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlockedDay = sequelize.define('BlockedDay', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
    reason: { type: DataTypes.STRING(200) },
}, {
    tableName: 'blocked_days',
    underscored: true,
});

module.exports = BlockedDay;
