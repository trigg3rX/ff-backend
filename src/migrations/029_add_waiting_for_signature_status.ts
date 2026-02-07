import { Pool } from 'pg';
import { logger } from '../utils/logger';

export const up = async (pool: Pool): Promise<void> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        logger.info('Updating execution status constraints to include WAITING_FOR_SIGNATURE...');

        // Update workflow_executions status constraint
        await client.query(`
      ALTER TABLE workflow_executions 
      DROP CONSTRAINT IF EXISTS valid_status;
      
      ALTER TABLE workflow_executions 
      ADD CONSTRAINT valid_status 
      CHECK (status IN ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'RETRYING', 'WAITING_FOR_SIGNATURE'));
    `);

        // Update node_executions status constraint
        await client.query(`
      ALTER TABLE node_executions 
      DROP CONSTRAINT IF EXISTS valid_status;
      
      ALTER TABLE node_executions 
      ADD CONSTRAINT valid_status 
      CHECK (status IN ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'RETRYING', 'WAITING_FOR_SIGNATURE'));
    `);

        logger.info('Execution status constraints updated successfully');

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error({ error }, 'Failed to update execution status constraints');
        throw error;
    } finally {
        client.release();
    }
};

export const down = async (_pool: Pool): Promise<void> => {
    // We won't strictly revert the constraint to avoid issues if some records are already in that state
    logger.info('Down migration for status constraints - no-op to prevent data loss');
};
