import {
  NodeType,
  NodeExecutionInput,
  NodeExecutionOutput,
} from '../../../types';
import {
  LendingNodeConfig,
  LendingProvider,
  SupportedChain,
  LendingOperation,
} from '../../../types/lending.types';
import { INodeProcessor } from '../interfaces/INodeProcessor';
import { lendingExecutionService } from '../../lending/LendingExecutionService';
import { logger } from '../../../utils/logger';
import { pool } from '../../../config/database';

/**
 * Lending Node Processor
 * Handles execution of lending nodes (supply, borrow, withdraw, repay)
 */
export class LendingNodeProcessor implements INodeProcessor {
  getNodeType(): NodeType {
    return NodeType.LENDING;
  }

  async execute(input: NodeExecutionInput): Promise<NodeExecutionOutput> {
    const startTime = new Date();
    logger.info({ nodeId: input.nodeId }, 'Executing lending node');

    try {
      const config: LendingNodeConfig = input.nodeConfig;

      // Validate configuration
      const validation = await this.validate(config);
      if (!validation.valid) {
        throw new Error(`Invalid lending configuration: ${validation.errors?.join(', ')}`);
      }

      // Get wallet private key from secrets
      const privateKey = input.secrets['WALLET_PRIVATE_KEY'];
      if (!privateKey) {
        throw new Error('Wallet private key not found in secrets');
      }

      // Get node execution ID from database
      const nodeExecutionId = await this.getNodeExecutionId(
        input.executionContext.executionId,
        input.nodeId
      );

      // Execute the lending operation
      const result = await lendingExecutionService.executeLending(
        nodeExecutionId,
        config.chain,
        config.provider,
        config.inputConfig,
        privateKey
      );

      const endTime = new Date();

      if (!result.success) {
        return {
          nodeId: input.nodeId,
          success: false,
          output: result,
          error: {
            message: result.errorMessage || 'Lending execution failed',
            code: result.errorCode || 'LENDING_FAILED',
          },
          metadata: {
            startedAt: startTime,
            completedAt: endTime,
            duration: endTime.getTime() - startTime.getTime(),
          },
        };
      }

      // Map output if configured
      let output = result;
      if (config.outputMapping) {
        output = this.applyOutputMapping(result, config.outputMapping);
      }

      logger.info(
        { nodeId: input.nodeId, txHash: result.txHash, operation: config.inputConfig.operation },
        'Lending node executed successfully'
      );

      return {
        nodeId: input.nodeId,
        success: true,
        output,
        metadata: {
          startedAt: startTime,
          completedAt: endTime,
          duration: endTime.getTime() - startTime.getTime(),
        },
      };
    } catch (error) {
      const endTime = new Date();
      logger.error({ error, nodeId: input.nodeId }, 'Lending node execution failed');

      return {
        nodeId: input.nodeId,
        success: false,
        output: null,
        error: {
          message: (error as Error).message,
          code: 'LENDING_NODE_ERROR',
          details: error,
        },
        metadata: {
          startedAt: startTime,
          completedAt: endTime,
          duration: endTime.getTime() - startTime.getTime(),
        },
      };
    }
  }

  async validate(config: any): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];

    if (!config) {
      errors.push('Config is required');
      return { valid: false, errors };
    }

    const lendingConfig = config as LendingNodeConfig;

    // Validate provider
    if (!lendingConfig.provider || !Object.values(LendingProvider).includes(lendingConfig.provider)) {
      errors.push('Invalid or missing provider');
    }

    // Validate chain
    if (!lendingConfig.chain || !Object.values(SupportedChain).includes(lendingConfig.chain)) {
      errors.push('Invalid or missing chain');
    }

    // Validate input config
    if (!lendingConfig.inputConfig) {
      errors.push('Input config is required');
    } else {
      const inputConfig = lendingConfig.inputConfig;

      // Validate operation
      if (!inputConfig.operation || !Object.values(LendingOperation).includes(inputConfig.operation)) {
        errors.push('Invalid or missing operation');
      }

      // Validate asset
      if (!inputConfig.asset?.address) {
        errors.push('Asset address is required');
      }

      // Validate amount (except for collateral enable/disable)
      if (
        inputConfig.operation !== LendingOperation.ENABLE_COLLATERAL &&
        inputConfig.operation !== LendingOperation.DISABLE_COLLATERAL
      ) {
        if (!inputConfig.amount) {
          errors.push('Amount is required');
        }
      }

      // Validate wallet address
      if (!inputConfig.walletAddress) {
        errors.push('Wallet address is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Get node execution ID from database
   */
  private async getNodeExecutionId(
    executionId: string,
    nodeId: string
  ): Promise<string> {
    const result = await pool.query<{ id: string }>(
      'SELECT id FROM node_executions WHERE execution_id = $1 AND node_id = $2 ORDER BY started_at DESC LIMIT 1',
      [executionId, nodeId]
    );

    if (result.rows.length === 0) {
      throw new Error('Node execution not found');
    }

    return result.rows[0].id;
  }

  /**
   * Apply output mapping to transform output data
   */
  private applyOutputMapping(output: any, mapping: Record<string, string>): any {
    const mapped: any = {};

    for (const [key, path] of Object.entries(mapping)) {
      // Simple path resolution (e.g., "txHash" -> output.txHash)
      const value = this.getValueByPath(output, path);
      mapped[key] = value;
    }

    return { ...output, ...mapped };
  }

  /**
   * Get value from object by path
   */
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

