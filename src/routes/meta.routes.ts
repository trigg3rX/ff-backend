import { Router, Request, Response, NextFunction } from 'express';
import { MetaController } from '../controllers/meta.controller';

const router = Router();

/**
 * GET /api/v1/meta/runtime-config
 * Public endpoint - no auth required
 * Returns runtime configuration for frontend validation
 */
router.get(
  '/runtime-config',
  (req: Request, res: Response, next: NextFunction) => {
    MetaController.getRuntimeConfig(req, res).catch(next);
  }
);

export default router;
