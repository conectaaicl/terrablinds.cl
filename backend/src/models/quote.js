const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quote = sequelize.define('Quote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customer_email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customer_phone: {
        type: DataTypes.STRING
    },
    notes: {
        type: DataTypes.TEXT
    },
    items: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('pending', 'sent', 'accepted', 'rejected', 'completed'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'quotes',
    timestamps: true,
    underscored: true
});

module.exports = Quote;
