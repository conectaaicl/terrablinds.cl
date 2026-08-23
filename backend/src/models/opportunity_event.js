const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OpportunityEvent = sequelize.define('OpportunityEvent', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    opportunity_id: { type: DataTypes.INTEGER, allowNull: false },
    from_status: {
        type: DataTypes.STRING(30),
        allowNull: true,
        comment: 'null on the first event (no previous status).',
    },
    to_status: { type: DataTypes.STRING(30), allowNull: false },
    actor: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Admin email or system identifier that triggered the change.',
    },
    note: { type: DataTypes.TEXT, allowNull: true },
}, {
    tableName: 'opportunity_events',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['opportunity_id'] },
    ],
});

module.exports = OpportunityEvent;
