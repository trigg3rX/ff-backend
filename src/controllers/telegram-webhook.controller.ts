import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/privy-auth';
import { TelegramConnectionModel } from '../models/telegram';
import { logger } from '../utils/logger';
import crypto from 'crypto';

// In-memory store for incoming messages (per chat)
// In production, use Redis or database
const incomingMessagesStore = new Map<string, Array<{
    updateId: number;
    messageId?: number;
    text?: string;
    from?: { id: number; firstName: string; username?: string };
    date: number;
}>>();

// Webhook secret for verification (optional security layer)
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

/**
 * Handle incoming webhook updates from Telegram
 * POST /api/v1/integrations/telegram/webhook/:secret
 * 
 * This is a PUBLIC endpoint - Telegram calls it directly
 */
export const handleIncomingWebhook = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { secret } = req.params;

        // Verify webhook secret if configured
        if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
            logger.warn({ providedSecret: secret }, 'Invalid webhook secret');
            res.status(401).json({ ok: false });
            return;
        }

        const update = req.body;

        // Extract message info
        const message = update.message || update.channel_post;
        if (!message) {
            // Acknowledge other update types but don't process
            res.json({ ok: true });
            return;
        }

        const chatId = String(message.chat.id);

        // Store the message
        const messages = incomingMessagesStore.get(chatId) || [];
        messages.push({
            updateId: update.update_id,
            messageId: message.message_id,
            text: message.text,
            from: message.from ? {
                id: message.from.id,
                firstName: message.from.first_name,
                username: message.from.username,
            } : undefined,
            date: message.date,
        });

        // Keep only last 100 messages per chat
        if (messages.length > 100) {
            messages.shift();
        }
        incomingMessagesStore.set(chatId, messages);

        logger.info({ chatId, updateId: update.update_id, text: message.text?.substring(0, 50) }, 'Telegram webhook received');

        res.json({ ok: true });
    } catch (error) {
        logger.error({ error }, 'Error processing Telegram webhook');
        // Always respond 200 to Telegram to prevent retries
        res.json({ ok: true });
    }
};

/**
 * Get recent messages for a connection
 * GET /api/v1/integrations/telegram/connections/:connectionId/messages
 */
export const getRecentMessages = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.userId;
        const connectionId = Array.isArray(req.params.connectionId)
            ? req.params.connectionId[0]
            : req.params.connectionId;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }
        if (!connectionId) {
            res.status(400).json({ success: false, error: 'Invalid connectionId' });
            return;
        }

        // Get connection to find chatId
        const connection = await TelegramConnectionModel.findByIdAndUser(connectionId, userId);
        if (!connection) {
            res.status(404).json({ success: false, error: 'Connection not found' });
            return;
        }

        const chatId = connection.chat_id;
        const messages = incomingMessagesStore.get(chatId) || [];

        res.json({
            success: true,
            data: {
                messages: messages.slice(-50), // Last 50
                count: messages.length,
                chatId,
                chatTitle: connection.chat_title,
            },
        });
    } catch (error) {
        logger.error({ error }, 'Error getting recent messages');
        next(error);
    }
};

/**
 * Generate webhook URL info
 * GET /api/v1/integrations/telegram/webhook-info
 */
export const getWebhookInfo = async (
    _req: Request,
    res: Response
): Promise<void> => {
    const baseUrl = process.env.TELEGRAM_WEBHOOK_BASE_URL;
    const secret = WEBHOOK_SECRET || crypto.randomBytes(16).toString('hex');

    res.json({
        success: true,
        data: {
            configured: !!baseUrl,
            webhookUrl: baseUrl ? `${baseUrl}/api/v1/integrations/telegram/webhook/${secret}` : null,
            note: baseUrl ?
                'Use this URL when setting up webhook via setWebhook API' :
                'Set TELEGRAM_WEBHOOK_BASE_URL in .env to enable webhooks',
        },
    });
};
