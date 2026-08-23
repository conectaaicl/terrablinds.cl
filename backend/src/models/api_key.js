const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApiKey = sequelize.define('ApiKey', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    key_hash: {
        type: DataTypes.CHAR(64),
        allowNull: false,
        unique: true,
        comment: 'SHA-256 hex digest of the raw key. Never store the raw key.',
    },
    label: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Human-readable label, e.g. "n8n-prod", "conectatap-reader".',
    },
    scopes: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: ['ingest'],
        comment: 'Authorized scope array. TEXT[] in PostgreSQL. Use DataTypes.ARRAY to match SQL migration type exactly.',
    },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    last_used_at: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'api_keys',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = ApiKey;
