import { Router, Request, Response, NextFunction } from 'express';
import { verifyPrivyToken, AuthenticatedRequest } from '../../middleware/privy-auth';
import { validateBody } from '../../middleware/validation';
import * as slackController from '../../controllers/slack.controller';
import {
  createSlackWebhookSchema,
  updateSlackWebhookSchema,
  testSlackWebhookSchema,
  sendSlackMessageSchema,
} from '../../models/slack';

const router = Router();

/**
 * All Slack routes require Privy authentication
 */
router.use(verifyPrivyToken);

/**
 * POST /api/v1/integrations/slack/test
 * Test a webhook URL without saving (for verification)
 */
router.post(
  '/test',
  validateBody(testSlackWebhookSchema),
  (req: Request, res: Response, next: NextFunction) => {
    slackController.testWebhook(req as AuthenticatedRequest, res).catch(next);
  }
);

/**
 * POST /api/v1/integrations/slack/webhooks
 * Create a new Slack webhook connection
 */
router.post(
  '/webhooks',
  validateBody(createSlackWebhookSchema),
  (req: Request, res: Response, next: NextFunction) => {
    slackController.createWebhookConnection(req as AuthenticatedRequest, res).catch(next);
  }
);

/**
 * POST /api/v1/integrations/slack/send
 * Send a message via Slack webhook
 */
router.post(
  '/send',
  validateBody(sendSlackMessageSchema),
  (req: Request, res: Response, next: NextFunction) => {
    slackController.sendMessage(req as AuthenticatedRequest, res).catch(next);
  }
);

/**
 * GET /api/v1/integrations/slack/connections
 * Get all Slack connections for the authenticated user
 */
router.get(
  '/connections',
  (req: Request, res: Response, next: NextFunction) => {
    slackController.getConnections(req as AuthenticatedRequest, res).catch(next);
  }
);

/**
 * PUT /api/v1/integrations/slack/connections/:connectionId
 * Update a Slack connection
 */
router.put(
  '/connections/:connectionId',
  validateBody(updateSlackWebhookSchema),
  (req: Request, res: Response, next: NextFunction) => {
    slackController.updateConnection(req as AuthenticatedRequest, res).catch(next);
  }
);

/**
 * DELETE /api/v1/integrations/slack/connections/:connectionId
 * Delete a Slack connection
 */
router.delete(
  '/connections/:connectionId',
  (req: Request, res: Response, next: NextFunction) => {
    slackController.deleteConnection(req as AuthenticatedRequest, res).catch(next);
  }
);

export default router;
