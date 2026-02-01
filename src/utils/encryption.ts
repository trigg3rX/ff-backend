import * as crypto from 'crypto';
import { logger } from './logger';

/**
 * Encryption utility for sensitive data using AES-256-GCM
 * 
 * Requirements:
 * - Set ENCRYPTION_KEY environment variable (64 hex characters = 32 bytes)
 * - Generate with: openssl rand -hex 32
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 32 bytes = 256 bits

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  if (key.length !== KEY_LENGTH * 2) {
    throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH * 2} hex characters (${KEY_LENGTH} bytes)`);
  }

  try {
    return Buffer.from(key, 'hex');
  } catch (error) {
    throw new Error('ENCRYPTION_KEY must be valid hexadecimal string');
  }
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns base64 encoded string: iv:authTag:encryptedData
 * 
 * @param plaintext - The string to encrypt
 * @returns Base64 encoded encrypted string with IV and auth tag
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    
    // Generate random IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    // Combine IV, auth tag, and encrypted data
    // Format: iv:authTag:encryptedData (all base64 encoded)
    const result = [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted
    ].join(':');
    
    return result;
  } catch (error) {
    logger.error({ error }, 'Encryption failed');
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string that was encrypted with encrypt()
 * 
 * @param encryptedData - The encrypted string (format: iv:authTag:encryptedData)
 * @returns The decrypted plaintext string
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    
    // Split the encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivBase64, authTagBase64, encrypted] = parts;
    
    // Convert from base64
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    
    // Validate lengths
    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid auth tag length');
    }
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error({ error }, 'Decryption failed');
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if data appears to be encrypted
 * (Basic check - looks for the format iv:authTag:data)
 */
export function isEncrypted(data: string): boolean {
  const parts = data.split(':');
  return parts.length === 3;
}

/**
 * Generate a new encryption key (for setup/testing)
 * Run this once and store the result in your .env file
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}
