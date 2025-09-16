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
      // Convert recipient's public key from hex
      const recipientKey = Buffer.from(recipientPublicKey, 'hex');
      
      // Generate shared secret using ECDH
      const sharedSecret = secp256k1.getSharedSecret(
        this.privateKey,
        recipientKey
      );
      
      // Derive encryption key from shared secret
      const encryptionKey = sha256(sharedSecret);
      
      // Generate random IV
      const iv = randomBytes(16);
      
      // Convert message to bytes
      const messageBytes = new TextEncoder().encode(message);
      
      // Simple XOR encryption (REPLACE with AES-GCM in production!)
      const encrypted = new Uint8Array(messageBytes.length);
      for (let i = 0; i < messageBytes.length; i++) {
        encrypted[i] = messageBytes[i] ^ encryptionKey[i % encryptionKey.length];
      }
      
      // Combine IV and encrypted data
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
      // Convert from base64
      const data = Buffer.from(encryptedData, 'base64');
      
      // Extract IV and encrypted content
      const iv = data.slice(0, 16);
      const encrypted = data.slice(16);
      
      // Convert sender's public key
      const senderKey = Buffer.from(senderPublicKey, 'hex');
      
      // Generate shared secret
      const sharedSecret = secp256k1.getSharedSecret(
        this.privateKey,
        senderKey
      );
      
      // Derive decryption key
      const decryptionKey = sha256(sharedSecret);
      
      // Decrypt (XOR)
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
  
  // Sign a message
  async signMessage(message: string): Promise<string> {
    const messageHash = sha256(new TextEncoder().encode(message));
    const signature = await secp256k1.sign(messageHash, this.privateKey);
    return signature.toCompactHex();
  }
  
  // Verify a signature
  async verifySignature(
    message: string, 
    signature: string, 
    publicKey: string
  ): Promise<boolean> {
    try {
      const messageHash = sha256(new TextEncoder().encode(message));
      const sig = secp256k1.Signature.fromCompact(signature);
      const pubKey = Buffer.from(publicKey, 'hex');
      return secp256k1.verify(sig, messageHash, pubKey);
    } catch {
      return false;
    }
  }
  
  // Store keys securely in localStorage
  saveToLocalStorage(password?: string) {
    const data = {
      privateKey: this.getPrivateKey(),
      publicKey: this.getPublicKey()
    };
    
    // In production, encrypt with password
    const stored = password 
      ? this.simpleEncrypt(JSON.stringify(data), password)
      : JSON.stringify(data);
    
    localStorage.setItem('criptochat_keys', stored);
  }
  
  static loadFromLocalStorage(password?: string): CryptoManager | null {
    try {
      const stored = localStorage.getItem('criptochat_keys');
      if (!stored) return null;
      
      const data = password 
        ? JSON.parse(CryptoManager.simpleDecrypt(stored, password))
        : JSON.parse(stored);
      
      const privateKey = Buffer.from(data.privateKey, 'hex');
      return new CryptoManager(privateKey);
    } catch {
      return null;
    }
  }
  
  // Simple password encryption for local storage
  private simpleEncrypt(text: string, password: string): string {
    const key = sha256(new TextEncoder().encode(password));
    const textBytes = new TextEncoder().encode(text);
    const encrypted = new Uint8Array(textBytes.length);
    
    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = textBytes[i] ^ key[i % key.length];
    }
    
    return Buffer.from(encrypted).toString('base64');
  }
  
  private static simpleDecrypt(encrypted: string, password: string): string {
    const key = sha256(new TextEncoder().encode(password));
    const encryptedBytes = Buffer.from(encrypted, 'base64');
    const decrypted = new Uint8Array(encryptedBytes.length);
    
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ key[i % key.length];
    }
    
    return new TextDecoder().decode(decrypted);
  }
}