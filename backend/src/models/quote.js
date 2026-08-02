const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quote = sequelize.define('Quote', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quote_number: { type: DataTypes.STRING(20) },
    customer_name: { type: DataTypes.STRING, allowNull: false },
    customer_email: { type: DataTypes.STRING, allowNull: false },
    customer_phone: { type: DataTypes.STRING },
    customer_address: { type: DataTypes.STRING(500) },
    customer_commune: { type: DataTypes.STRING(200) },
    customer_rut: { type: DataTypes.STRING(20) },
    notes: { type: DataTypes.TEXT },
    items: { type: DataTypes.JSONB, allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: {
        type: DataTypes.ENUM('pending', 'contacted', 'sent', 'accepted', 'rejected', 'completed'),
        defaultValue: 'pending'
    }
}, { tableName: 'quotes', timestamps: true, underscored: true });

module.exports = Quote;
