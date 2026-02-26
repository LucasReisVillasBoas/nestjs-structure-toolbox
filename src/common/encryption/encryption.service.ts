import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('encryption.key');
    if (!encryptionKey || encryptionKey.length !== 64) {
      throw new Error(
        'ENCRYPTION_KEY deve ter 64 caracteres hexadecimais (32 bytes). ' +
          'Gere uma com: openssl rand -hex 32',
      );
    }
    this.key = Buffer.from(encryptionKey, 'hex');
  }

  encrypt(plainText: string | number | null): string | null {
    if (!plainText && plainText !== 0) return null;

    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(String(plainText), 'utf8', 'base64');
      encrypted += cipher.final('base64');

      const authTag = cipher.getAuthTag();

      // Formato: iv:encryptedData:authTag (todos em base64)
      return `${iv.toString('base64')}:${encrypted}:${authTag.toString('base64')}`;
    } catch (error) {
      console.error('Erro ao criptografar:', error);
      throw new Error('Falha na criptografia');
    }
  }

  decrypt(encryptedText: string | null): string | null {
    if (!encryptedText) return null;

    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Formato de criptografia inválido');
      }

      const [ivBase64, encryptedData, authTagBase64] = parts;
      const iv = Buffer.from(ivBase64, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar:', error);
      throw new Error('Falha na descriptografia');
    }
  }

  encryptDecimal(value: number | null): string | null {
    if (value === null || value === undefined) return null;
    return this.encrypt(value.toString());
  }

  decryptDecimal(encryptedValue: string | null): number | null {
    if (!encryptedValue) return null;
    const decrypted = this.decrypt(encryptedValue);
    return decrypted ? parseFloat(decrypted) : null;
  }
}
