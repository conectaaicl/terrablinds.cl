const sequelize = require('../config/database');
const Product = require('./product');
const Quote = require('./quote');
const User = require('./user');
const Config = require('./config');

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
