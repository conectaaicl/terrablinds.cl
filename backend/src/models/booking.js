const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    service_type: {
        type: DataTypes.ENUM('visita_medidas', 'tecnico_persianas', 'tecnico_roller', 'tecnico_otros'),
        allowNull: false,
    },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    time_slot: { type: DataTypes.STRING(10), allowNull: false },
    client_name: { type: DataTypes.STRING(200), allowNull: false },
    client_email: { type: DataTypes.STRING(200), allowNull: false },
    client_phone: { type: DataTypes.STRING(50) },
    client_address: { type: DataTypes.STRING(500) },
    notes: { type: DataTypes.TEXT },
    status: {
        type: DataTypes.ENUM('pending_payment', 'confirmed', 'completed', 'cancelled'),
        defaultValue: 'pending_payment',
    },
    amount: { type: DataTypes.INTEGER, defaultValue: 15000 },
    flow_commerce_order: { type: DataTypes.STRING(100) },
    flow_token: { type: DataTypes.STRING(200) },
    paid_at: { type: DataTypes.DATE },
}, {
    tableName: 'bookings',
    underscored: true,
});

module.exports = Booking;
