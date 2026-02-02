// ============================================
// LENDING TYPES - Complete Type Definitions
// ============================================

import { SupportedChain, ExecutionStatus } from './swap.types';

// Re-export shared types for convenience
export { SupportedChain, ExecutionStatus } from './swap.types';

// Supported Lending Providers
export enum LendingProvider {
  AAVE = 'AAVE',
  COMPOUND = 'COMPOUND',
}

// Lending Operation Types
export enum LendingOperation {
  SUPPLY = 'SUPPLY',           // Deposit/Supply assets
  WITHDRAW = 'WITHDRAW',       // Withdraw supplied assets
  BORROW = 'BORROW',          // Borrow assets
  REPAY = 'REPAY',            // Repay borrowed assets
  ENABLE_COLLATERAL = 'ENABLE_COLLATERAL',  // Enable asset as collateral
  DISABLE_COLLATERAL = 'DISABLE_COLLATERAL', // Disable asset as collateral
}

// Interest Rate Mode
export enum InterestRateMode {
  STABLE = 'STABLE',     // Stable interest rate (if available)
  VARIABLE = 'VARIABLE', // Variable interest rate
}

// Token Information for Lending
export interface LendingTokenInfo {
  address: string;
  symbol?: string;
  decimals?: number;
  name?: string;
}

// Lending Input Configuration
export interface LendingInputConfig {
  // Mandatory fields
  operation: LendingOperation;
  asset: LendingTokenInfo;
  amount: string; // Wei/smallest unit as string to handle big numbers
  walletAddress: string; // The wallet that will perform the operation
  
  // Operation-specific fields
  interestRateMode?: InterestRateMode; // For BORROW operations (default: VARIABLE)
  onBehalfOf?: string; // Optional: perform operation on behalf of another address
  
  // Gas preferences (optional)
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  gasLimit?: string;
  
  // Advanced options
  simulateFirst?: boolean; // Default: true - simulate before executing
  referralCode?: number; // Aave referral code (default: 0)
}

// Lending Position Information
export interface LendingPosition {
  asset: LendingTokenInfo;
  supplied: string; // Amount supplied
  borrowed: string; // Amount borrowed
  availableToBorrow: string;
  availableToWithdraw: string;
  supplyAPY: string; // Annual percentage yield for supply
  borrowAPY: string; // Annual percentage yield for borrow
  isCollateral: boolean;
  healthFactor?: string; // Overall account health (< 1.0 means liquidation risk)
  ltv?: string; // Loan-to-value ratio
  liquidationThreshold?: string;
}

// Lending Quote/Info Response
export interface LendingQuote {
  provider: LendingProvider;
  chain: SupportedChain;
  operation: LendingOperation;
  asset: LendingTokenInfo;
  amount: string;
  
  // Rate information
  supplyAPY?: string;
  borrowAPY?: string;
  availableLiquidity?: string;
  
  // Position information (if querying existing position)
  currentPosition?: LendingPosition;
  
  // Transaction estimates
  gasEstimate: string;
  estimatedGasCost: string; // In native token
  
  // Health factor impact (for borrow/withdraw operations)
  currentHealthFactor?: string;
  newHealthFactor?: string;
  
  validUntil?: number; // Unix timestamp
  rawQuote?: any; // Provider-specific quote data
}

// Lending Transaction
export interface LendingTransaction {
  to: string;
  from: string;
  data: string;
  value: string;
  gasLimit: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  chainId: number;
}

// Lending Execution Result
export interface LendingExecutionResult {
  success: boolean;
  txHash?: string;
  operation: LendingOperation;
  asset: LendingTokenInfo;
  amount: string;
  gasUsed?: string;
  effectiveGasPrice?: string;
  blockNumber?: number;
  timestamp: Date;
  status: ExecutionStatus;
  
  // Post-execution position info
  newPosition?: LendingPosition;
  
  errorMessage?: string;
  errorCode?: string;
  retryCount?: number;
}

// Lending Node Configuration
export interface LendingNodeConfig {
  provider: LendingProvider;
  chain: SupportedChain;
  inputConfig: LendingInputConfig;
  
  // Execution preferences
  simulateFirst?: boolean; // Default: true
  autoRetryOnFailure?: boolean; // Default: true
  maxRetries?: number; // Default: 3
  
  // Output mapping (for passing data to next nodes)
  outputMapping?: Record<string, string>;
}

// Account Data (Aave/Compound)
export interface LendingAccountData {
  totalCollateralBase: string;
  totalDebtBase: string;
  availableBorrowsBase: string;
  currentLiquidationThreshold: string;
  ltv: string;
  healthFactor: string;
}

// Asset Reserve Data
export interface AssetReserveData {
  asset: string;
  symbol: string;
  decimals: number;
  supplyAPY: string;
  variableBorrowAPY: string;
  stableBorrowAPY?: string;
  availableLiquidity: string;
  totalSupplied: string;
  totalBorrowed: string;
  utilizationRate: string;
  ltv: string;
  liquidationThreshold: string;
  liquidationBonus: string;
  isActive: boolean;
  isFrozen: boolean;
  canBorrow: boolean;
  canSupply: boolean;
  canBeCollateral: boolean;
}

// Database Models
export interface DBLendingExecution {
  id: string;
  node_execution_id: string;
  provider: LendingProvider;
  chain: SupportedChain;
  wallet_address: string;
  operation: LendingOperation;
  asset: any; // JSONB
  amount: string;
  interest_rate_mode?: InterestRateMode;
  tx_hash?: string;
  gas_used?: string;
  effective_gas_price?: string;
  block_number?: number;
  status: ExecutionStatus;
  error_message?: string;
  error_code?: string;
  position_data?: any; // JSONB - post-execution position
  quote_data?: any; // JSONB
  created_at: Date;
  completed_at?: Date;
}

// Provider-specific configurations
export interface AaveConfig {
  poolAddress: string;
  poolDataProviderAddress: string;
  wethGatewayAddress?: string;
  oracleAddress?: string;
  version: 'v2' | 'v3';
}

export interface CompoundConfig {
  comptrollerAddress: string;
  cTokenAddress: string; // Mapping of asset to cToken
  priceOracleAddress?: string;
  version: 'v2' | 'v3';
}

// Validation types
export interface LendingValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Job data for queue
export interface LendingExecutionJobData {
  nodeExecutionId: string;
  provider: LendingProvider;
  chain: SupportedChain;
  inputConfig: LendingInputConfig;
}

