const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { OPPORTUNITY_STATUSES } = require('./constants');

const Opportunity = sequelize.define('Opportunity', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    contact_id: { type: DataTypes.INTEGER, allowNull: false },
    product_interest: { type: DataTypes.STRING(200), allowNull: true },
    status: {
        type: DataTypes.ENUM(...OPPORTUNITY_STATUSES),
        allowNull: false,
        defaultValue: 'new',
    },
    lost_reason: { type: DataTypes.TEXT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    won_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    won_at: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'opportunities',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['contact_id'] },
        { fields: ['status'] },
        { fields: ['created_at'] },
    ],
});

module.exports = Opportunity;
