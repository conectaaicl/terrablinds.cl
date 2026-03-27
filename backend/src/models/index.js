const sequelize = require('../config/database');
const Product = require('./product');
const Quote = require('./quote');
const User = require('./user');
const Config = require('./config');
const Project = require('./project');
const FAQ = require('./faq');
const Lead = require('./lead');
const Booking = require('./booking');
const BlockedDay = require('./blockedDay');
const Blog = require('./blog');

const models = {
    Product,
    Quote,
    User,
    Config,
    Project,
    FAQ,
    Lead,
    Booking,
    BlockedDay,
    Blog,
    sequelize
};

module.exports = models;
