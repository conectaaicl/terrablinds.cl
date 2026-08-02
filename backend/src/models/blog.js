const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Blog = sequelize.define('Blog', {
    id:               { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title:            { type: DataTypes.STRING(255), allowNull: false },
    slug:             { type: DataTypes.STRING(255), allowNull: false, unique: true },
    excerpt:          { type: DataTypes.TEXT },
    content:          { type: DataTypes.TEXT('long'), allowNull: false },
    meta_title:       { type: DataTypes.STRING(100) },
    meta_description: { type: DataTypes.STRING(200) },
    keywords:         { type: DataTypes.STRING(500) },
    featured_image:   { type: DataTypes.STRING(500) },
    author:           { type: DataTypes.STRING(100), defaultValue: 'TerraBlinds' },
    is_published:     { type: DataTypes.BOOLEAN, defaultValue: false },
    published_at:     { type: DataTypes.DATE },
    read_time:        { type: DataTypes.INTEGER, defaultValue: 5 },
    views:            { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
    tableName: 'blogs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Blog;
