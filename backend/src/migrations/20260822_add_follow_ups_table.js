'use strict';

/**
 * Migration: create opportunity_follow_ups table
 * Apply with: npx sequelize-cli db:migrate (or execute raw SQL below)
 * DO NOT apply to production until Fase 5 deploy is approved.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('opportunity_follow_ups', {
            id: {
                type:          Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey:    true,
                allowNull:     false,
            },
            opportunity_id: {
                type:       Sequelize.INTEGER,
                allowNull:  false,
                references: { model: 'opportunities', key: 'id' },
                onDelete:   'CASCADE',
            },
            scheduled_at: {
                type:      Sequelize.DATE,
                allowNull: false,
            },
            type: {
                type:         Sequelize.ENUM('call', 'email', 'visit', 'message', 'other'),
                allowNull:    false,
                defaultValue: 'call',
            },
            status: {
                type:         Sequelize.ENUM('pending', 'done', 'cancelled', 'missed'),
                allowNull:    false,
                defaultValue: 'pending',
            },
            priority: {
                type:         Sequelize.ENUM('low', 'medium', 'high'),
                allowNull:    false,
                defaultValue: 'medium',
            },
            next_action: {
                type: Sequelize.TEXT,
            },
            responsible: {
                type: Sequelize.STRING(200),
            },
            note: {
                type: Sequelize.TEXT,
            },
            completed_at: {
                type: Sequelize.DATE,
            },
            created_at: {
                type:      Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type:      Sequelize.DATE,
                allowNull: false,
            },
        });

        await queryInterface.addIndex('opportunity_follow_ups', ['opportunity_id'], {
            name: 'idx_follow_ups_opportunity_id',
        });
        await queryInterface.addIndex('opportunity_follow_ups', ['status', 'scheduled_at'], {
            name: 'idx_follow_ups_status_scheduled',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('opportunity_follow_ups');
    },
};
