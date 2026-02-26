import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import mikroOrmConfig from './config/mikro-orm.config';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';

import { AuthMiddleware } from './middlewares/auth.middleware';
import { CsrfGuard } from './common/guards/csrf.guard';
import { EncryptionModule } from './common/encryption/encryption.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuração global — disponível em toda a aplicação via ConfigService
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // MikroORM
    MikroOrmModule.forRoot(mikroOrmConfig),

    // JWT global — disponível sem reimportar nos módulos
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback-secret-change-me',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),

    // Módulos da aplicação
    EncryptionModule,
    AuditModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // CSRF como guard global
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      // Rotas públicas que não precisam de JWT
      .exclude(
        { path: '/', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL },
        // Adicione aqui outras rotas públicas conforme necessário
        // { path: 'auth/login', method: RequestMethod.POST },
        // { path: 'usuario/cadastro', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
