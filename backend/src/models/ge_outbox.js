'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Outbox table for reliable Growth Engine event delivery.
// Items are inserted synchronously within the caller's transaction, then processed
// asynchronously by ge_worker.service.js — so GE events survive process restarts
// and transient DB failures. Idempotent via external_ref on ingestLead.
const GeOutbox = sequelize.define('GeOutbox', {
    id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
    },
    type: {
        type:      DataTypes.STRING(80),
        allowNull: false,
    },
    payload: {
        type:      DataTypes.JSON,
        allowNull: false,
    },
    attempts: {
        type:         DataTypes.INTEGER,
        allowNull:    false,
        defaultValue: 0,
    },
    processed_at: {
        type: DataTypes.DATE,
    },
    last_error: {
        type: DataTypes.TEXT,
    },
    locked_until: {
        type: DataTypes.DATE,
    },
}, {
    tableName:   'ge_outbox',
    timestamps:  true,
    underscored: true,
    updatedAt:   false,
});

module.exports = GeOutbox;
