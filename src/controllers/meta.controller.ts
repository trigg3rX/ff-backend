import { Request, Response } from 'express';
import {
  getActiveChains,
  chainConfigs,
  type SupportedChainId,
} from '../config/config';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

/**
 * Meta Controller
 * Provides runtime configuration and system metadata
 */
export class MetaController {
  /**
   * GET /api/v1/meta/runtime-config
   * Returns runtime configuration and active chains
   */
  static async getRuntimeConfig(_req: Request, res: Response): Promise<void> {
    try {
      const activeChains = getActiveChains();

      // Build chain configs for frontend validation
      const chainDetails = activeChains.map((chainId: SupportedChainId) => {
        const config = chainConfigs[chainId];
        return {
          chainId: config.chainId,
          name: config.name,
          factoryAddress: config.factoryAddress,
          moduleAddress: config.moduleAddress,
          rpcUrl: config.rpcUrl,
        };
      });

      const response: ApiResponse = {
        success: true,
        data: {
          activeChains: activeChains,
          chainDetails: chainDetails,
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      logger.info({ activeChains }, 'Runtime config requested');

      res.status(200).json(response);
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : String(error),
        },
        'Failed to get runtime config'
      );

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve runtime configuration',
      });
    }
  }
}
