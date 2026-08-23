module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    setupFiles: ['./src/tests/setup.js'],
    testTimeout: 10000,
    verbose: true,
};
