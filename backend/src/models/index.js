const sequelize = require('../config/database');
const Product = require('./product');
const Quote = require('./quote');
const User = require('./user');
const Config = require('./config');
const Project = require('./project');
const FAQ = require('./faq');

const models = {
    Product,
    Quote,
    User,
    Config,
    Project,
    FAQ,
    sequelize
};

module.exports = models;
