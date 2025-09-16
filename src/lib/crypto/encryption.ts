/* proporciona métodos para generar pares de claves, cifrar y descifrar mensajes usando secp256k1 y guardar/cargar claves hacia/desde el almacenamiento local. */
import * as secp256k1 from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { randomBytes } from '@noble/hashes/utils';

export class CryptoManager {
  private privateKey: Uint8Array;
  private publicKey: Uint8Array;
  
  constructor(privateKey?: Uint8Array) {
    if (privateKey) {
      this.privateKey = privateKey;
    } else {
      this.privateKey = secp256k1.utils.randomPrivateKey();
    }
    this.publicKey = secp256k1.getPublicKey(this.privateKey);
  }
  
  static async generateKeyPair() {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const publicKey = secp256k1.getPublicKey(privateKey);
    
    return {
      privateKey: Buffer.from(privateKey).toString('hex'),
      publicKey: Buffer.from(publicKey).toString('hex')
    };
  }
  
  getPublicKey(): string {
    return Buffer.from(this.publicKey).toString('hex');
  }
  
  getPrivateKey(): string {
    return Buffer.from(this.privateKey).toString('hex');
  }
  
  async encryptMessage(message: string, recipientPublicKey: string): Promise<{
    encrypted: string;
    iv: string;
  }> {
    try {
      const recipientKey = Buffer.from(recipientPublicKey, 'hex');
      const sharedSecret = secp256k1.getSharedSecret(
        this.privateKey,
        recipientKey
      );
      
      const encryptionKey = sha256(sharedSecret);
      const iv = randomBytes(16);
      const messageBytes = new TextEncoder().encode(message);
      
      const encrypted = new Uint8Array(messageBytes.length);
      for (let i = 0; i < messageBytes.length; i++) {
        encrypted[i] = messageBytes[i] ^ encryptionKey[i % encryptionKey.length];
      }
      
      const combined = new Uint8Array(iv.length + encrypted.length);
      combined.set(iv);
      combined.set(encrypted, iv.length);
      
      return {
        encrypted: Buffer.from(combined).toString('base64'),
        iv: Buffer.from(iv).toString('base64')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }
  
  async decryptMessage(encryptedData: string, senderPublicKey: string): Promise<string> {
    try {
      const data = Buffer.from(encryptedData, 'base64');
      const iv = data.slice(0, 16);
      const encrypted = data.slice(16);
      const senderKey = Buffer.from(senderPublicKey, 'hex');
      
      const sharedSecret = secp256k1.getSharedSecret(
        this.privateKey,
        senderKey
      );
      
      const decryptionKey = sha256(sharedSecret);
      const decrypted = new Uint8Array(encrypted.length);
      
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ decryptionKey[i % decryptionKey.length];
      }
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return '[Error: Could not decrypt message]';
    }
  }
  
  saveToLocalStorage(password?: string) {
    const data = {
      privateKey: this.getPrivateKey(),
      publicKey: this.getPublicKey()
    };
    
    localStorage.setItem('criptochat_keys', JSON.stringify(data));
  }
  
  static loadFromLocalStorage(password?: string): CryptoManager | null {
    try {
      const stored = localStorage.getItem('criptochat_keys');
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      const privateKey = Buffer.from(data.privateKey, 'hex');
      return new CryptoManager(privateKey);
    } catch {
      return null;
    }
  }
}