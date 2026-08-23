const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    author_name: { type: DataTypes.STRING(200), allowNull: false },
    author_role: { type: DataTypes.STRING(200), defaultValue: 'Cliente' },
    rating: { type: DataTypes.INTEGER, defaultValue: 5, validate: { min: 1, max: 5 } },
    content: { type: DataTypes.TEXT, allowNull: false },
    avatar_url: { type: DataTypes.STRING(500) },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'reviews', underscored: true, timestamps: true });

module.exports = Review;
