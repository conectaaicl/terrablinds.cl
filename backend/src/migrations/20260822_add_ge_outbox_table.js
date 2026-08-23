'use strict';

/**
 * Migration: create ge_outbox table
 * Apply with: npx sequelize-cli db:migrate (or execute raw SQL below)
 * DO NOT apply to production until Fase 5 deploy is approved.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ge_outbox', {
            id: {
                type:          Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey:    true,
                allowNull:     false,
            },
            type: {
                type:      Sequelize.STRING(80),
                allowNull: false,
            },
            payload: {
                type:      Sequelize.JSON,
                allowNull: false,
            },
            attempts: {
                type:         Sequelize.INTEGER,
                allowNull:    false,
                defaultValue: 0,
            },
            processed_at: {
                type: Sequelize.DATE,
            },
            last_error: {
                type: Sequelize.TEXT,
            },
            locked_until: {
                type: Sequelize.DATE,
            },
            created_at: {
                type:      Sequelize.DATE,
                allowNull: false,
            },
        });

        await queryInterface.addIndex('ge_outbox', ['processed_at', 'attempts', 'locked_until'], {
            name: 'idx_ge_outbox_pending',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('ge_outbox');
    },
};
