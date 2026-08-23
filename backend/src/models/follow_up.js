'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { FOLLOWUP_TYPES, FOLLOWUP_STATUSES, FOLLOWUP_PRIORITIES } = require('./constants');

const FollowUp = sequelize.define('FollowUp', {
    id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
    },
    opportunity_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
    },
    scheduled_at: {
        type:      DataTypes.DATE,
        allowNull: false,
    },
    type: {
        type:         DataTypes.ENUM(...FOLLOWUP_TYPES),
        allowNull:    false,
        defaultValue: 'call',
    },
    status: {
        type:         DataTypes.ENUM(...FOLLOWUP_STATUSES),
        allowNull:    false,
        defaultValue: 'pending',
    },
    priority: {
        type:         DataTypes.ENUM(...FOLLOWUP_PRIORITIES),
        allowNull:    false,
        defaultValue: 'medium',
    },
    next_action: {
        type: DataTypes.TEXT,
    },
    responsible: {
        type: DataTypes.STRING(200),
    },
    note: {
        type: DataTypes.TEXT,
    },
    completed_at: {
        type: DataTypes.DATE,
    },
}, {
    tableName:  'opportunity_follow_ups',
    timestamps: true,
    underscored: true,
});

module.exports = FollowUp;
