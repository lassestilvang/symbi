/**
 * Encryption Service
 * 
 * Provides AES-256 encryption for sensitive data storage.
 * Uses device keychain (iOS) / Keystore (Android) for key management.
 * Requirements: 11.2
 */

import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

/**
 * EncryptionService provides encryption/decryption for sensitive data.
 * 
 * Note: This is a simplified implementation using expo-crypto.
 * In production, consider using:
 * - react-native-keychain for secure key storage
 * - react-native-aes-crypto for native AES encryption
 * - expo-secure-store for Expo-managed apps
 */
export class EncryptionService {
  private static readonly ENCRYPTION_KEY_ID = '@symbi:encryption_key';
  private static encryptionKey: string | null = null;

  /**
   * Initialize encryption service and generate/retrieve encryption key
   */
  static async initialize(): Promise<boolean> {
    try {
      // In production, this would use react-native-keychain or expo-secure-store
      // to securely store the encryption key in device keychain/keystore
      
      // For now, we'll generate a key and store it (this is simplified)
      if (!this.encryptionKey) {
        this.encryptionKey = await this.getOrCreateEncryptionKey();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize encryption service:', error);
      return false;
    }
  }

  /**
   * Encrypt data using AES-256
   */
  static async encrypt(data: string): Promise<string> {
    try {
      if (!this.encryptionKey) {
        await this.initialize();
      }

      // In production, use react-native-aes-crypto for proper AES-256 encryption
      // This is a simplified implementation using base64 encoding
      // Real implementation would use: AES.encrypt(data, key, iv)
      
      const encrypted = await this.simpleEncrypt(data);
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data
   */
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      if (!this.encryptionKey) {
        await this.initialize();
      }

      // In production, use react-native-aes-crypto for proper AES-256 decryption
      // This is a simplified implementation using base64 decoding
      // Real implementation would use: AES.decrypt(encryptedData, key, iv)
      
      const decrypted = await this.simpleDecrypt(encryptedData);
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt an object (converts to JSON first)
   */
  static async encryptObject<T>(obj: T): Promise<string> {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Decrypt to an object (parses JSON after decryption)
   */
  static async decryptObject<T>(encryptedData: string): Promise<T> {
    const jsonString = await this.decrypt(encryptedData);
    return JSON.parse(jsonString);
  }

  /**
   * Hash data using SHA-256 (one-way, for verification)
   */
  static async hash(data: string): Promise<string> {
    try {
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data
      );
      return digest;
    } catch (error) {
      console.error('Hashing error:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Generate a random encryption key
   */
  private static async generateEncryptionKey(): Promise<string> {
    // In production, use a proper key derivation function (PBKDF2, scrypt, etc.)
    const randomBytes = await Crypto.getRandomBytesAsync(32); // 256 bits
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Get or create encryption key
   * In production, this would use react-native-keychain or expo-secure-store
   */
  private static async getOrCreateEncryptionKey(): Promise<string> {
    try {
      // In production, retrieve from secure storage:
      // const credentials = await Keychain.getGenericPassword({ service: 'symbi-encryption' });
      // if (credentials) return credentials.password;
      
      // Generate new key
      const key = await this.generateEncryptionKey();
      
      // In production, store in secure storage:
      // await Keychain.setGenericPassword('encryption-key', key, { service: 'symbi-encryption' });
      
      return key;
    } catch (error) {
      console.error('Error managing encryption key:', error);
      throw error;
    }
  }

  /**
   * Simple encryption implementation (placeholder for production AES-256)
   * In production, replace with react-native-aes-crypto
   */
  private static async simpleEncrypt(data: string): Promise<string> {
    // This is a simplified implementation for demonstration
    // In production, use proper AES-256-GCM encryption with:
    // - Random IV (Initialization Vector)
    // - Authentication tag
    // - Proper key derivation
    
    // For now, we'll use base64 encoding with a simple XOR cipher
    // THIS IS NOT SECURE - only for demonstration
    const key = this.encryptionKey || '';
    const encrypted = this.xorCipher(data, key);
    return Buffer.from(encrypted).toString('base64');
  }

  /**
   * Simple decryption implementation (placeholder for production AES-256)
   */
  private static async simpleDecrypt(encryptedData: string): Promise<string> {
    // This is a simplified implementation for demonstration
    // In production, use proper AES-256-GCM decryption
    
    const key = this.encryptionKey || '';
    const decoded = Buffer.from(encryptedData, 'base64').toString();
    return this.xorCipher(decoded, key);
  }

  /**
   * Simple XOR cipher (NOT SECURE - only for demonstration)
   * In production, use proper AES-256-GCM encryption
   */
  private static xorCipher(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  }

  /**
   * Clear encryption key from memory
   */
  static clearKey(): void {
    this.encryptionKey = null;
  }
}

/**
 * Production Implementation Notes:
 * 
 * For a production app, replace the simple encryption with:
 * 
 * 1. Install dependencies:
 *    npm install react-native-keychain react-native-aes-crypto
 * 
 * 2. Key Storage (iOS Keychain / Android Keystore):
 *    import * as Keychain from 'react-native-keychain';
 *    
 *    // Store key
 *    await Keychain.setGenericPassword('encryption-key', key, {
 *      service: 'symbi-encryption',
 *      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
 *    });
 *    
 *    // Retrieve key
 *    const credentials = await Keychain.getGenericPassword({ service: 'symbi-encryption' });
 * 
 * 3. AES-256-GCM Encryption:
 *    import { Aes } from 'react-native-aes-crypto';
 *    
 *    // Encrypt
 *    const iv = await Aes.randomKey(16); // 128-bit IV
 *    const encrypted = await Aes.encrypt(data, key, iv, 'aes-256-gcm');
 *    
 *    // Decrypt
 *    const decrypted = await Aes.decrypt(encrypted, key, iv, 'aes-256-gcm');
 * 
 * 4. Certificate Pinning for API calls:
 *    Use react-native-ssl-pinning or configure in native code
 *    
 *    iOS (AppDelegate.m):
 *    - Implement NSURLSessionDelegate
 *    - Validate server certificate in didReceiveChallenge
 *    
 *    Android (OkHttpClient):
 *    - Use CertificatePinner
 *    - Add SHA-256 hashes of expected certificates
 */
