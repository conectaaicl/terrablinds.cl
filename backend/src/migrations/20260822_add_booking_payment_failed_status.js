'use strict';

/** Adds 'payment_failed' to the bookings.status ENUM.
 *  Distinguishes technical payment errors from commercial cancellations.
 *  UP: safe — PostgreSQL adds the enum value without locking the table.
 *  DOWN: requires recreating the type, which cannot be done while rows use the value.
 *        Use with caution; ensure no rows have status='payment_failed' before rollback.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        // PostgreSQL requires the ENUM type to be altered directly.
        // This operation is safe (non-blocking) — it adds a value but doesn't rewrite rows.
        await queryInterface.sequelize.query(
            `ALTER TYPE "enum_bookings_status" ADD VALUE IF NOT EXISTS 'payment_failed'`
        );
    },

    async down(queryInterface, Sequelize) {
        // PRODUCTION ROLLBACK STRATEGY — application rollback is preferred over ENUM surgery.
        //
        // PREFERRED (forward-fix / application rollback):
        //   Revert the backend code to the Phase 5 tag. Existing rows with
        //   status='payment_failed' remain in the database but are inert:
        //     - availability queries only check ['pending_payment','confirmed']
        //     - booking list/admin queries filter by known statuses
        //   No data is lost, no migration is needed, and the slot is correctly
        //   excluded from future bookings.
        //
        // ENUM REMOVAL (only if strictly required and zero rows use 'payment_failed'):
        //   1. Verify: SELECT COUNT(*) FROM bookings WHERE status='payment_failed'  → must be 0
        //   2. Forward-fix: UPDATE bookings SET status='cancelled' WHERE status='payment_failed'
        //   3. CREATE TYPE enum_bookings_status_new AS ENUM(
        //        'pending_payment','confirmed','completed','cancelled')
        //   4. ALTER TABLE bookings ALTER COLUMN status TYPE enum_bookings_status_new
        //        USING status::text::enum_bookings_status_new
        //   5. DROP TYPE enum_bookings_status
        //   6. ALTER TYPE enum_bookings_status_new RENAME TO enum_bookings_status
        //
        // This migration does NOT auto-execute the ENUM removal to prevent accidental data loss.
        throw new Error(
            'Cannot automatically remove payment_failed from ENUM. ' +
            'PREFERRED: application rollback (revert backend code); ' +
            'payment_failed records remain inert — availability queries exclude them. ' +
            'ENUM removal requires manual intervention with zero rows using this status.'
        );
    },
};
