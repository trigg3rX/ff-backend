import {
  LendingProvider,
  SupportedChain,
  LendingInputConfig,
  LendingQuote,
  LendingTransaction,
  LendingPosition,
  AssetReserveData,
  LendingAccountData,
  LendingValidationResult,
} from '../../../types/lending.types';

/**
 * Base interface for all lending providers
 * Each provider (Aave, Compound) implements this interface
 */
export interface ILendingProvider {
  /**
   * Get provider name
   */
  getName(): LendingProvider;

  /**
   * Check if provider supports a specific chain
   */
  supportsChain(chain: SupportedChain): boolean;

  /**
   * Get a quote/info for a lending operation
   * @param chain - The blockchain to execute on
   * @param config - Lending input configuration
   * @returns Promise<LendingQuote>
   */
  getQuote(
    chain: SupportedChain,
    config: LendingInputConfig
  ): Promise<LendingQuote>;

  /**
   * Build transaction data for a lending operation
   * @param chain - The blockchain to execute on
   * @param config - Lending input configuration
   * @param quote - Optional quote from getQuote
   * @returns Promise<LendingTransaction>
   */
  buildTransaction(
    chain: SupportedChain,
    config: LendingInputConfig,
    quote?: LendingQuote
  ): Promise<LendingTransaction>;

  /**
   * Simulate a lending transaction (dry run)
   * @param chain - The blockchain to execute on
   * @param transaction - The transaction to simulate
   * @returns Promise<SimulationResult>
   */
  simulateTransaction(
    chain: SupportedChain,
    transaction: LendingTransaction
  ): Promise<{
    success: boolean;
    gasEstimate?: string;
    error?: string;
  }>;

  /**
   * Validate lending configuration
   * @param chain - The blockchain to execute on
   * @param config - Lending input configuration
   * @returns Promise<LendingValidationResult>
   */
  validateConfig(
    chain: SupportedChain,
    config: LendingInputConfig
  ): Promise<LendingValidationResult>;

  /**
   * Get user's lending position for a specific asset
   * @param chain - The blockchain
   * @param walletAddress - User's wallet address
   * @param asset - Asset address (optional, if not provided returns all positions)
   * @returns Promise<LendingPosition | LendingPosition[]>
   */
  getPosition(
    chain: SupportedChain,
    walletAddress: string,
    asset?: string
  ): Promise<LendingPosition | LendingPosition[]>;

  /**
   * Get user's account data (health factor, total collateral, etc.)
   * @param chain - The blockchain
   * @param walletAddress - User's wallet address
   * @returns Promise<LendingAccountData>
   */
  getAccountData(
    chain: SupportedChain,
    walletAddress: string
  ): Promise<LendingAccountData>;

  /**
   * Get reserve data for an asset (APY, liquidity, etc.)
   * @param chain - The blockchain
   * @param asset - Asset address
   * @returns Promise<AssetReserveData>
   */
  getAssetReserveData(
    chain: SupportedChain,
    asset: string
  ): Promise<AssetReserveData>;

  /**
   * Get all available assets for lending/borrowing
   * @param chain - The blockchain
   * @returns Promise<AssetReserveData[]>
   */
  getAvailableAssets(
    chain: SupportedChain
  ): Promise<AssetReserveData[]>;
}

/**
 * Lending provider factory interface
 */
export interface ILendingProviderFactory {
  getProvider(provider: LendingProvider): ILendingProvider;
  getAllProviders(): ILendingProvider[];
  getProvidersForChain(chain: SupportedChain): ILendingProvider[];
  hasProvider(provider: LendingProvider): boolean;
  getBestProviderForChain(chain: SupportedChain): ILendingProvider | null;
}

