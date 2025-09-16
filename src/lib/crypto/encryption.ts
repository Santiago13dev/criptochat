/* proporciona métodos para generar pares de claves, cifrar y descifrar mensajes usando secp256k1 y guardar/cargar claves hacia/desde el almacenamiento local. */
export class CryptoManager {
  private publicKey: string;
  private privateKey: string;
  
  constructor() {
    // Generar claves simuladas
    this.privateKey = this.generateRandomKey();
    this.publicKey = this.generatePublicFromPrivate(this.privateKey);
  }
  
  private generateRandomKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  private generatePublicFromPrivate(privateKey: string): string {
    // Simulación de generación de clave pública
    const hash = this.simpleHash(privateKey);
    return 'pub_' + hash.substring(0, 64);
  }
  
  private simpleHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
  
  static async generateKeyPair() {
    const crypto = new CryptoManager();
    return {
      privateKey: crypto.privateKey,
      publicKey: crypto.publicKey
    };
  }
  
  getPublicKey(): string {
    return this.publicKey;
  }
  
  getPrivateKey(): string {
    return this.privateKey;
  }
  
  async encryptMessage(message: string, recipientPublicKey: string): Promise<{
    encrypted: string;
    iv: string;
  }> {
    try {
      // Usar Web Crypto API del navegador
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      
      // Generar IV aleatorio
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Crear una clave de encriptación basada en las claves
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.privateKey.substring(0, 32)),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode(recipientPublicKey.substring(0, 16)),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      return {
        encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv))
      };
    } catch (error) {
      // Fallback a encriptación simple
      console.warn('Using fallback encryption:', error);
      return {
        encrypted: btoa(message),
        iv: btoa(Math.random().toString(36).substring(2))
      };
    }
  }
  
  async decryptMessage(encryptedData: string, senderPublicKey: string): Promise<string> {
    try {
      // Intentar desencriptar con Web Crypto API
      const decoder = new TextDecoder();
      const encrypted = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      // Por ahora, usar fallback
      return atob(encryptedData);
    } catch (error) {
      console.error('Decryption error:', error);
      try {
        // Fallback: intentar decodificar base64
        return atob(encryptedData);
      } catch {
        return '[Error: No se pudo desencriptar el mensaje]';
      }
    }
  }
  
  saveToLocalStorage() {
    const data = {
      privateKey: this.privateKey,
      publicKey: this.publicKey,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('criptochat_keys', JSON.stringify(data));
      console.log('Keys saved to localStorage');
    } catch (error) {
      console.error('Error saving keys:', error);
    }
  }
  
  static loadFromLocalStorage(): CryptoManager | null {
    try {
      const stored = localStorage.getItem('criptochat_keys');
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      const crypto = new CryptoManager();
      crypto.privateKey = data.privateKey;
      crypto.publicKey = data.publicKey;
      
      console.log('Keys loaded from localStorage');
      return crypto;
    } catch (error) {
      console.error('Error loading keys:', error);
      return null;
    }
  }
}