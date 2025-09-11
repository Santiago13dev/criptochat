import * as secp256k1 from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { randomBytes } from '@noble/hashes/utils';

export class CryptoManager {
  private privateKey: Uint8Array;
  private publicKey: Uint8Array;
  
  constructor() {
    // Generar par de claves
    this.privateKey = secp256k1.utils.randomPrivateKey();
    this.publicKey = secp256k1.getPublicKey(this.privateKey);
  }
  
  getPublicKey(): string {
    return Buffer.from(this.publicKey).toString('hex');
  }
  
  async encryptMessage(message: string, recipientPublicKey: string): Promise<string> {
    try {
      // Convertir la clave pública del destinatario
      const recipientKey = Buffer.from(recipientPublicKey, 'hex');
      
      // Crear secreto compartido usando ECDH
      const sharedSecret = secp256k1.getSharedSecret(
        this.privateKey,
        recipientKey
      );
      
      // Derivar clave de encriptación
      const encryptionKey = sha256(sharedSecret);
      
      // Generar IV aleatorio
      const iv = randomBytes(16);
      
      // Encriptar mensaje (implementar AES-GCM aquí)
      const messageBytes = new TextEncoder().encode(message);
      
      // Por ahora, XOR simple (CAMBIAR a AES-GCM en producción)
      const encrypted = new Uint8Array(messageBytes.length);
      for (let i = 0; i < messageBytes.length; i++) {
        encrypted[i] = messageBytes[i] ^ encryptionKey[i % encryptionKey.length];
      }
      
      // Combinar IV + encrypted
      const result = new Uint8Array(iv.length + encrypted.length);
      result.set(iv);
      result.set(encrypted, iv.length);
      
      return Buffer.from(result).toString('base64');
    } catch (error) {
      console.error('Error encriptando:', error);
      throw error;
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
      console.error('Error desencriptando:', error);
      return '[Error: No se pudo desencriptar]';
    }
  }
}

export const cryptoManager = new CryptoManager();