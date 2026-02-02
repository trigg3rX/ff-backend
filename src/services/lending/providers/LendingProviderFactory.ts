import { LendingProvider, SupportedChain } from '../../../types/lending.types';
import { ILendingProvider, ILendingProviderFactory } from '../interfaces/ILendingProvider';
import { AaveProvider } from './AaveProvider';
import { CompoundProvider } from './CompoundProvider';
import { logger } from '../../../utils/logger';

/**
 * Factory for creating and managing lending providers
 * Implements the Factory pattern for lending provider instantiation
 */
export class LendingProviderFactory implements ILendingProviderFactory {
  private providers: Map<LendingProvider, ILendingProvider>;

  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  /**
   * Initialize all available providers
   */
  private initializeProviders(): void {
    logger.info('Initializing lending providers...');

    try {
      this.providers.set(LendingProvider.AAVE, new AaveProvider());
      this.providers.set(LendingProvider.COMPOUND, new CompoundProvider());

      logger.info(
        { providerCount: this.providers.size },
        'Lending providers initialized'
      );
    } catch (error) {
      logger.error({ error }, 'Failed to initialize lending providers');
      throw error;
    }
  }

  /**
   * Get a specific provider by type
   */
  getProvider(provider: LendingProvider): ILendingProvider {
    const lendingProvider = this.providers.get(provider);

    if (!lendingProvider) {
      throw new Error(`Lending provider not found: ${provider}`);
    }

    return lendingProvider;
  }

  /**
   * Get all available providers
   */
  getAllProviders(): ILendingProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get providers that support a specific chain
   */
  getProvidersForChain(chain: SupportedChain): ILendingProvider[] {
    return this.getAllProviders().filter(provider =>
      provider.supportsChain(chain)
    );
  }

  /**
   * Check if a provider is available
   */
  hasProvider(provider: LendingProvider): boolean {
    return this.providers.has(provider);
  }

  /**
   * Get best provider for a specific chain
   * Can be extended with logic to choose based on rates, liquidity, etc.
   */
  getBestProviderForChain(chain: SupportedChain): ILendingProvider | null {
    const availableProviders = this.getProvidersForChain(chain);

    if (availableProviders.length === 0) {
      return null;
    }

    // For now, return the first available provider (Aave preferred)
    // In production, you might want to:
    // 1. Get rates from all providers
    // 2. Compare APYs and available liquidity
    // 3. Return the provider with best rates
    return availableProviders[0];
  }
}

// Export singleton instance
export const lendingProviderFactory = new LendingProviderFactory();

