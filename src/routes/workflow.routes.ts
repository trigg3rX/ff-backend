import { Router, Request, Response } from 'express';
import {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  updateWorkflow,
  fullUpdateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getExecutionStatus,
  getExecutionHistory,
} from '../controllers/workflow.controller';
import { subscribeToExecution } from '../services/ExecutionSSEService';
import { verifyPrivyToken } from '../middleware/privy-auth';
import { verifySubscriptionToken } from '../services/subscription-token.service';
import { logger } from '../utils/logger';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  createWorkflowSchema,
  updateWorkflowSchema,
  executeWorkflowSchema,
  listWorkflowsQuerySchema,
  idParamSchema,
  fullUpdateWorkflowSchema,
} from '../middleware/schemas';

const router = Router();

// Real-time execution updates via Server-Sent Events
// Security: Token-based authentication is used instead of Authorization header
router.get('/executions/:executionId/subscribe', async (req: Request, res: Response) => {
  const executionId = typeof req.params.executionId === 'string'
    ? req.params.executionId
    : req.params.executionId?.[0];
  const token = req.query.token as string | undefined;

  if (!executionId) {
    res.status(400).json({ success: false, error: 'Missing executionId' });
    return;
  }

  // Verify the subscription token
  const verification = await verifySubscriptionToken(executionId, token);

  if (!verification.valid) {
    logger.warn(
      { executionId, error: verification.error },
      'SSE subscription denied - invalid token'
    );
    res.status(401).json({
      success: false,
      error: verification.error || 'Invalid or expired subscription token',
    });
    return;
  }

  logger.info(
    { executionId, userId: verification.userId },
    'SSE subscription authorized'
  );

  subscribeToExecution(executionId, res);
});

// Apply Privy authentication to all other workflow routes
router.use(verifyPrivyToken);

// Workflow CRUD with validation
router.post('/', validateBody(createWorkflowSchema), createWorkflow);
router.get('/', validateQuery(listWorkflowsQuerySchema), listWorkflows);
router.get('/:id', validateParams(idParamSchema), getWorkflow);
router.put('/:id', validateParams(idParamSchema), validateBody(updateWorkflowSchema), updateWorkflow);
router.put('/:id/full', validateParams(idParamSchema), validateBody(fullUpdateWorkflowSchema), fullUpdateWorkflow);
router.delete('/:id', validateParams(idParamSchema), deleteWorkflow);

// Workflow Execution with validation
router.post('/:id/execute', validateParams(idParamSchema), validateBody(executeWorkflowSchema), executeWorkflow);
router.get('/:id/executions', validateParams(idParamSchema), getExecutionHistory);
router.get('/executions/:executionId', getExecutionStatus);

export default router;
