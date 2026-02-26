import { Type } from '@mikro-orm/core';
import { EncryptionService } from '../encryption.service';

export class EncryptedDecimalTransformer extends Type<number | null, string | null> {
  private static encryptionService: EncryptionService;

  static setEncryptionService(service: EncryptionService) {
    EncryptedDecimalTransformer.encryptionService = service;
  }

  convertToDatabaseValue(value: number | null): string | null {
    if (!EncryptedDecimalTransformer.encryptionService) {
      throw new Error('EncryptionService não foi configurado no transformer');
    }
    return EncryptedDecimalTransformer.encryptionService.encryptDecimal(value);
  }

  convertToJSValue(value: string | null): number | null {
    if (!EncryptedDecimalTransformer.encryptionService) {
      throw new Error('EncryptionService não foi configurado no transformer');
    }
    return EncryptedDecimalTransformer.encryptionService.decryptDecimal(value);
  }

  getColumnType(): string {
    return 'text';
  }
}
