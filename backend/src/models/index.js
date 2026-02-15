require('dotenv').config();
const sequelize = require('../config/database');
const Product = require('./Product');
const Quote = require('./Quote');
const User = require('./User');
const Config = require('./Config');

// Define associations here if needed
// Example: Product.hasMany(Quote);

const models = {
    Product,
    Quote,
    User,
    Config,
    sequelize
};

module.exports = models;
