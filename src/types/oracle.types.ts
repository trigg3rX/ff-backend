import { SupportedChain } from './swap.types';

/**
 * Oracle Providers
 */
export enum OracleProvider {
  CHAINLINK = 'CHAINLINK',
  PYTH = 'PYTH',
}

export interface ChainlinkOracleConfig {
  provider: OracleProvider.CHAINLINK;
  chain: SupportedChain;

  /**
   * Chainlink AggregatorV3Interface feed address (e.g., ETH/USD).
   */
  aggregatorAddress: string;

  /**
   * Optional staleness guard. If set, fail when updatedAt is older than now - staleAfterSeconds.
   */
  staleAfterSeconds?: number;

  /**
   * Output mapping (for passing data to next nodes)
   */
  outputMapping?: Record<string, string>;
}

export interface PythOracleConfig {
  provider: OracleProvider.PYTH;
  chain: SupportedChain;

  /**
   * Pyth price feed ID (hex string, e.g., "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace" for ETH/USD)
   * See: https://pyth.network/developers/price-feed-ids
   */
  priceFeedId: string;

  /**
   * Optional staleness guard. If set, fail when price is older than now - staleAfterSeconds.
   */
  staleAfterSeconds?: number;

  /**
   * Output mapping (for passing data to next nodes)
   */
  outputMapping?: Record<string, string>;
}

export type OracleNodeConfig = ChainlinkOracleConfig | PythOracleConfig;

export interface ChainlinkPriceOutput {
  provider: OracleProvider.CHAINLINK;
  chain: SupportedChain;
  aggregatorAddress: string;

  description?: string;
  decimals: number;

  roundId: string;
  answeredInRound: string;
  startedAt: number;
  updatedAt: number;

  /**
   * Raw answer as a base-10 string (scaled by `decimals`).
   */
  answer: string;

  /**
   * Human-readable formatted answer (e.g. "2211.12345678").
   */
  formattedAnswer: string;
}

export interface PythPriceOutput {
  provider: OracleProvider.PYTH;
  chain: SupportedChain;
  priceFeedId: string;

  /**
   * Price feed description/symbol (e.g., "ETH/USD")
   */
  symbol?: string;

  /**
   * Price value scaled by the exponent
   */
  price: string;

  /**
   * Confidence interval for the price
   */
  confidence: string;

  /**
   * Exponent for the price (negative for decimals)
   */
  exponent: number;

  /**
   * Unix timestamp when price was published
   */
  publishTime: number;

  /**
   * Human-readable formatted price
   */
  formattedPrice: string;
}


