const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    short_description: {
        type: DataTypes.TEXT
    },
    is_unit_price: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    price_unit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    base_price_m2: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    features: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    colors: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: true
    },
    min_width: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
    },
    max_width: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
    },
    min_height: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
    },
    max_height: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
    },
    lead_time_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Días de fabricación estimados'
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'products',
    timestamps: true,
    underscored: true
});

module.exports = Product;
