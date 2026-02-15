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
        type: sequelize.options.dialect === 'sqlite' ? DataTypes.JSON : DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    features: {
        type: sequelize.options.dialect === 'sqlite' ? DataTypes.JSON : DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
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
