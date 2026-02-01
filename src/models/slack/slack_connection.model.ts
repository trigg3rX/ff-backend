import { query } from '../../config/database';
import { logger } from '../../utils/logger';
import { encrypt, decrypt } from '../../utils/encryption';

export interface SlackConnection {
  id: string;
  user_id: string;
  name: string | null;
  webhook_url: string; // Decrypted URL (not the encrypted version from DB)
  created_at: Date;
}

export interface CreateSlackConnectionInput {
  userId: string;
  webhookUrl: string;
  name?: string;
}

export class SlackConnectionModel {
  /**
   * Create a new Slack webhook connection
   */
  static async create(input: CreateSlackConnectionInput): Promise<SlackConnection> {
    const { userId, webhookUrl, name } = input;

    // Encrypt webhook URL before storing
    const encryptedWebhookUrl = encrypt(webhookUrl);

    const text = `
      INSERT INTO slack_connections (user_id, webhook_url, name)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, name, webhook_url, created_at
    `;
    const values = [userId, encryptedWebhookUrl, name || null];

    try {
      const result = await query(text, values);
      logger.info({ userId, connectionId: result.rows[0].id }, 'Slack connection created');
      
      // Decrypt webhook URL before returning
      return {
        ...result.rows[0],
        webhook_url: decrypt(result.rows[0].webhook_url),
      };
    } catch (error) {
      logger.error({ error, userId }, 'Failed to create Slack connection');
      throw error;
    }
  }

  /**
   * Find a connection by ID and user ID (for security)
   */
  static async findByIdAndUser(connectionId: string, userId: string): Promise<SlackConnection | null> {
    const text = `
      SELECT id, user_id, name, webhook_url, created_at
      FROM slack_connections
      WHERE id = $1 AND user_id = $2
    `;
    const values = [connectionId, userId];

    try {
      const result = await query(text, values);
      if (result.rows.length === 0) {
        return null;
      }
      
      // Decrypt webhook URL before returning
      return {
        ...result.rows[0],
        webhook_url: decrypt(result.rows[0].webhook_url),
      };
    } catch (error) {
      logger.error({ error, connectionId, userId }, 'Failed to find Slack connection');
      throw error;
    }
  }

  /**
   * Find all connections for a user
   * Note: This returns connections WITHOUT decrypted webhook URLs for list view
   * Use findByIdAndUser() to get the decrypted URL when needed
   */
  static async findByUserId(userId: string): Promise<Omit<SlackConnection, 'webhook_url'>[]> {
    const text = `
      SELECT id, user_id, name, created_at
      FROM slack_connections
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const values = [userId];

    try {
      const result = await query(text, values);
      return result.rows;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to find Slack connections for user');
      throw error;
    }
  }

  /**
   * Update a connection
   */
  static async update(
    connectionId: string,
    userId: string,
    updates: { name?: string; webhookUrl?: string }
  ): Promise<SlackConnection | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(updates.name || null);
      paramCount++;
    }

    if (updates.webhookUrl !== undefined) {
      // Encrypt webhook URL before updating
      fields.push(`webhook_url = $${paramCount}`);
      values.push(encrypt(updates.webhookUrl));
      paramCount++;
    }

    if (fields.length === 0) {
      // No updates provided
      return await this.findByIdAndUser(connectionId, userId);
    }

    values.push(connectionId, userId);

    const text = `
      UPDATE slack_connections
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING id, user_id, name, webhook_url, created_at
    `;

    try {
      const result = await query(text, values);
      if (result.rows.length === 0) {
        return null;
      }
      logger.info({ connectionId, userId }, 'Slack connection updated');
      
      // Decrypt webhook URL before returning
      return {
        ...result.rows[0],
        webhook_url: decrypt(result.rows[0].webhook_url),
      };
    } catch (error) {
      logger.error({ error, connectionId, userId }, 'Failed to update Slack connection');
      throw error;
    }
  }

  /**
   * Delete a connection
   */
  static async delete(connectionId: string, userId: string): Promise<boolean> {
    const text = `
      DELETE FROM slack_connections
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    const values = [connectionId, userId];

    try {
      const result = await query(text, values);
      if (result.rows.length === 0) {
        return false;
      }
      logger.info({ connectionId, userId }, 'Slack connection deleted');
      return true;
    } catch (error) {
      logger.error({ error, connectionId, userId }, 'Failed to delete Slack connection');
      throw error;
    }
  }
}
