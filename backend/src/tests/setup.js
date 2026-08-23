// Runs before any test module is loaded.
// Provides dummy DB env vars so database.js guard passes without a real connection.
// Sequelize creates the pool config but does NOT connect until a query is called.
// Our structural tests never call query methods, so no real DB is required.
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'terrablinds_test';
process.env.DB_USER = 'terrablinds';
process.env.DB_PASSWORD = 'test_password_not_real';
process.env.JWT_SECRET = 'test-jwt-secret-not-real';
