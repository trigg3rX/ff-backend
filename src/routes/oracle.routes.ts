import { Router } from 'express';
import { OracleController } from '../controllers/oracle.controller';
import { asyncHandler } from '../middleware';

const router = Router();

/**
 * @route   GET /api/v1/oracle/providers
 * @desc    Get supported oracle providers
 * @access  Public
 */
router.get('/providers', asyncHandler(OracleController.getProviders));

/**
 * @route   GET /api/v1/oracle/feeds
 * @desc    Get all available price feeds
 * @query   category - Filter by category (crypto, forex, commodities, indices)
 * @query   provider - Filter by provider (CHAINLINK, PYTH)
 * @query   chain - Filter by chain (requires provider)
 * @access  Public
 */
router.get('/feeds', asyncHandler(OracleController.getAllFeeds));

/**
 * @route   GET /api/v1/oracle/feeds/:symbol
 * @desc    Get a specific price feed configuration
 * @param   symbol - Price pair symbol (e.g., "ETH/USD")
 * @query   provider - Oracle provider (CHAINLINK, PYTH)
 * @query   chain - Blockchain network
 * @access  Public
 */
router.get('/feeds/:symbol', asyncHandler(OracleController.getFeedBySymbol));

/**
 * @route   GET /api/v1/oracle/config
 * @desc    Get oracle configuration for a specific pair, provider, and chain
 * @query   symbol - Price pair symbol (e.g., "ETH/USD") [required]
 * @query   provider - Oracle provider (CHAINLINK, PYTH) [required]
 * @query   chain - Blockchain network [required]
 * @access  Public
 * 
 * @example
 * GET /api/v1/oracle/config?symbol=ETH/USD&provider=CHAINLINK&chain=ARBITRUM_SEPOLIA
 * Response: {
 *   "success": true,
 *   "data": {
 *     "symbol": "ETH/USD",
 *     "name": "Ethereum / US Dollar",
 *     "category": "crypto",
 *     "provider": "CHAINLINK",
 *     "chain": "ARBITRUM_SEPOLIA",
 *     "aggregatorAddress": "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165"
 *   }
 * }
 */
router.get('/config', asyncHandler(OracleController.getConfig));

export default router;

