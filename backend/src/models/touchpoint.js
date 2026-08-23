const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { SOURCES } = require('./constants');

const Touchpoint = sequelize.define('Touchpoint', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    opportunity_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Nullable — touchpoint may arrive before the opportunity is created.',
    },
    source: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: { isIn: [SOURCES] },
    },
    external_ref: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'External ID for idempotency. Unique per source — see migrate_growth_engine.sql.',
    },
    channel_detail: { type: DataTypes.STRING(200), allowNull: true },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        comment: 'UTM params, tag_id, commune, building_id, etc. JSONB matches SQL migration column type.',
    },
    occurred_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'When the interaction happened (may differ from created_at).',
    },
}, {
    tableName: 'touchpoints',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    // Composite partial unique index UNIQUE(source, external_ref) WHERE external_ref IS NOT NULL
    // is defined in migrate_growth_engine.sql — Sequelize cannot express partial indexes.
    indexes: [
        { fields: ['opportunity_id', 'occurred_at'] }, // first/last touch derivation
        { fields: ['source'] },
    ],
});

module.exports = Touchpoint;
