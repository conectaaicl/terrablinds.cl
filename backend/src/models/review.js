const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: true },
    customer_name: { type: DataTypes.STRING(200), allowNull: false },
    customer_email: { type: DataTypes.STRING(200), allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    text: { type: DataTypes.TEXT, allowNull: false },
    photo_url: { type: DataTypes.STRING(500) },
    approved: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'reviews', timestamps: true, underscored: true });

module.exports = Review;
