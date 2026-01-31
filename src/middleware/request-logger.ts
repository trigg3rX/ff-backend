import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

/**
 * Middleware to log incoming requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = randomUUID();
  const startTime = Date.now();

  // Attach request ID to request object for use in other middleware
  (req as any).requestId = requestId;

  // Log incoming request
  logger.info(
    {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
    'Incoming request'
  );

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(
      {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      },
      'Request completed'
    );
  });

  next();
};
