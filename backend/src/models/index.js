const sequelize = require('../config/database');
const Product = require('./product');
const ProductCategory = require('./product_category');
const Quote = require('./quote');
const User = require('./user');
const Config = require('./config');
const Project = require('./project');
const FAQ = require('./faq');
const Lead = require('./lead');
const Booking = require('./booking');
const BlockedDay = require('./blockedDay');
const Blog = require('./blog');
const Review = require('./review');
const Referral = require('./referral');

// Growth Engine models
const Contact = require('./contact');
const Opportunity = require('./opportunity');
const Touchpoint = require('./touchpoint');
const OpportunityEvent = require('./opportunity_event');
const FollowUp = require('./follow_up');
const GeOutbox = require('./ge_outbox');
const ApiKey = require('./api_key');

// ── Associations ──────────────────────────────────────────────────────────────

// Contact ↔ Opportunity (1:N)
Contact.hasMany(Opportunity, { foreignKey: 'contact_id', as: 'opportunities' });
Opportunity.belongsTo(Contact, { foreignKey: 'contact_id', as: 'contact' });

// Opportunity ↔ Touchpoint (1:N)
Opportunity.hasMany(Touchpoint, { foreignKey: 'opportunity_id', as: 'touchpoints' });
Touchpoint.belongsTo(Opportunity, { foreignKey: 'opportunity_id', as: 'opportunity' });

// Opportunity ↔ OpportunityEvent (1:N — immutable audit log)
Opportunity.hasMany(OpportunityEvent, { foreignKey: 'opportunity_id', as: 'events' });
OpportunityEvent.belongsTo(Opportunity, { foreignKey: 'opportunity_id', as: 'opportunity' });

// Quote optionally belongs to an Opportunity (nullable FK, backward-compat)
Quote.belongsTo(Opportunity, { foreignKey: 'opportunity_id', as: 'opportunity', constraints: false });
Opportunity.hasMany(Quote, { foreignKey: 'opportunity_id', as: 'quotes', constraints: false });

// Lead links back to Contact + Opportunity after Growth Engine processing
Lead.belongsTo(Contact, { foreignKey: 'contact_id', as: 'contact', constraints: false });
Lead.belongsTo(Opportunity, { foreignKey: 'opportunity_id', as: 'opportunity', constraints: false });

// Opportunity ↔ FollowUp (1:N)
Opportunity.hasMany(FollowUp, { foreignKey: 'opportunity_id', as: 'follow_ups' });
FollowUp.belongsTo(Opportunity, { foreignKey: 'opportunity_id', as: 'opportunity' });

// ─────────────────────────────────────────────────────────────────────────────

const models = {
    Product,
    ProductCategory,
    Quote,
    User,
    Config,
    Project,
    FAQ,
    Lead,
    Booking,
    BlockedDay,
    Blog,
    Review,
    Referral,
    // Growth Engine
    Contact,
    Opportunity,
    Touchpoint,
    OpportunityEvent,
    FollowUp,
    GeOutbox,
    ApiKey,
    sequelize,
};

module.exports = models;
