import { Type } from '@mikro-orm/core';
import { EncryptionService } from '../encryption.service';

export class EncryptedStringTransformer extends Type<string | null, string | null> {
  private static encryptionService: EncryptionService;

  static setEncryptionService(service: EncryptionService) {
    EncryptedStringTransformer.encryptionService = service;
  }

  convertToDatabaseValue(value: string | null): string | null {
    if (!EncryptedStringTransformer.encryptionService) {
      throw new Error('EncryptionService não foi configurado no transformer');
    }
    return EncryptedStringTransformer.encryptionService.encrypt(value);
  }

  convertToJSValue(value: string | null): string | null {
    if (!EncryptedStringTransformer.encryptionService) {
      throw new Error('EncryptionService não foi configurado no transformer');
    }
    return EncryptedStringTransformer.encryptionService.decrypt(value);
  }

  getColumnType(): string {
    return 'text';
  }
}
