import { Router } from 'express';
import {
  getLendingQuote,
  getSupportedLendingProviders,
  getLendingExecution,
  getLendingExecutionsByWallet,
  getLendingPosition,
  getLendingAccountData,
  getAssetReserveData,
  getAvailableAssets,
} from '../controllers/lending.controller';

const router = Router();

// Get quote for lending operation
router.post('/quote/:provider/:chain', getLendingQuote);

// Get supported providers for chain
router.get('/providers/:chain', getSupportedLendingProviders);

// Get lending execution details
router.get('/executions/:id', getLendingExecution);

// Get lending executions for a wallet
router.get('/executions/wallet/:walletAddress', getLendingExecutionsByWallet);

// Get user's lending position
router.get('/position/:provider/:chain/:walletAddress', getLendingPosition);

// Get user's account data (health factor, etc.)
router.get('/account/:provider/:chain/:walletAddress', getLendingAccountData);

// Get asset reserve data (APY, liquidity, etc.)
router.get('/asset/:provider/:chain/:asset', getAssetReserveData);

// Get available assets for lending/borrowing
router.get('/assets/:provider/:chain', getAvailableAssets);

export default router;

