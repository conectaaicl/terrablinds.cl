const sequelize = require('../config/database');
const Product = require('./product');
const Quote = require('./quote');
const User = require('./user');
const Config = require('./config');
const Project = require('./project');
const FAQ = require('./faq');
const Lead = require('./lead');

const models = {
    Product,
    Quote,
    User,
    Config,
    Project,
    FAQ,
    Lead,
    sequelize
};

module.exports = models;
