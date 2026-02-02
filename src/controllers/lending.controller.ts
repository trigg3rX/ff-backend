import { Request, Response, NextFunction } from 'express';
import { lendingExecutionService } from '../services/lending/LendingExecutionService';
import { lendingProviderFactory } from '../services/lending/providers/LendingProviderFactory';
import { logger } from '../utils/logger';
import {
  LendingProvider,
  SupportedChain,
  LendingInputConfig,
} from '../types/lending.types';
import { ApiResponse } from '../types';

/**
 * Get quote from lending provider
 */
export const getLendingQuote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { provider, chain } = req.params;
    const config: LendingInputConfig = req.body;

    logger.info({ provider, chain, operation: config.operation }, 'Getting lending quote');

    const quote = await lendingExecutionService.getQuote(
      chain as SupportedChain,
      provider as LendingProvider,
      config
    );

    const response: ApiResponse = {
      success: true,
      data: quote,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get supported providers for a chain
 */
export const getSupportedLendingProviders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chain } = req.params;

    const providers = lendingProviderFactory
      .getProvidersForChain(chain as SupportedChain)
      .map((p) => p.getName());

    const response: ApiResponse = {
      success: true,
      data: {
        chain,
        providers,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get lending execution details
 */
export const getLendingExecution = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const lendingExecution = await lendingExecutionService.getLendingExecution(id);

    if (!lendingExecution) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Lending execution not found',
          code: 'LENDING_EXECUTION_NOT_FOUND',
        },
      } as ApiResponse);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: lendingExecution,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get lending executions for a wallet
 */
export const getLendingExecutionsByWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { walletAddress } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const executions = await lendingExecutionService.getLendingExecutionsByWallet(
      walletAddress,
      limit
    );

    const response: ApiResponse = {
      success: true,
      data: executions,
      meta: {
        timestamp: new Date().toISOString(),
        total: executions.length,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's lending position
 */
export const getLendingPosition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { provider, chain, walletAddress } = req.params;
    const { asset } = req.query;

    logger.info({ provider, chain, walletAddress, asset }, 'Getting lending position');

    const lendingProvider = lendingProviderFactory.getProvider(provider as LendingProvider);
    
    const position = await lendingProvider.getPosition(
      chain as SupportedChain,
      walletAddress,
      asset as string | undefined
    );

    const response: ApiResponse = {
      success: true,
      data: position,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's account data (health factor, etc.)
 */
export const getLendingAccountData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { provider, chain, walletAddress } = req.params;

    logger.info({ provider, chain, walletAddress }, 'Getting lending account data');

    const lendingProvider = lendingProviderFactory.getProvider(provider as LendingProvider);
    
    const accountData = await lendingProvider.getAccountData(
      chain as SupportedChain,
      walletAddress
    );

    const response: ApiResponse = {
      success: true,
      data: accountData,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get asset reserve data (APY, liquidity, etc.)
 */
export const getAssetReserveData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { provider, chain, asset } = req.params;

    logger.info({ provider, chain, asset }, 'Getting asset reserve data');

    const lendingProvider = lendingProviderFactory.getProvider(provider as LendingProvider);
    
    const reserveData = await lendingProvider.getAssetReserveData(
      chain as SupportedChain,
      asset
    );

    const response: ApiResponse = {
      success: true,
      data: reserveData,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get available assets for lending/borrowing
 */
export const getAvailableAssets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { provider, chain } = req.params;

    logger.info({ provider, chain }, 'Getting available assets');

    const lendingProvider = lendingProviderFactory.getProvider(provider as LendingProvider);
    
    const assets = await lendingProvider.getAvailableAssets(
      chain as SupportedChain
    );

    const response: ApiResponse = {
      success: true,
      data: assets,
      meta: {
        timestamp: new Date().toISOString(),
        total: assets.length,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

