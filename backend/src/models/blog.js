const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Blog = sequelize.define('Blog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    excerpt: {
        type: DataTypes.TEXT
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    meta_description: {
        type: DataTypes.STRING(160)
    },
    meta_keywords: {
        type: DataTypes.STRING
    },
    cover_image: {
        type: DataTypes.STRING
    },
    author: {
        type: DataTypes.STRING,
        defaultValue: 'TerraBlinds'
    },
    is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    published_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'blogs',
    timestamps: true,
    underscored: true
});

module.exports = Blog;
