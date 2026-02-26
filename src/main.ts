import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

import { AppModule } from './app.module';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

async function bootstrap() {
  // 1. Suporte opcional a HTTPS
  const httpsEnabled = process.env.ENABLE_HTTPS === 'true';
  let httpsOptions = null;
  if (httpsEnabled) {
    httpsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    };
  }

  // 2. Criar app
  const app = httpsEnabled
    ? await NestFactory.create(AppModule, { httpsOptions })
    : await NestFactory.create(AppModule);

  // 3. Helmet — headers de segurança HTTP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      frameguard: { action: 'deny' },
    }),
  );

  // 4. ConfigService (após criar o app)
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  // 5. CORS
  app.enableCors({
    origin: configService.get<string>('cors.origin'),
    credentials: configService.get<boolean>('cors.credentials') ?? true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
  });

  // 6. Pipes globais — sanitização XSS antes do ValidationPipe
  app.useGlobalPipes(
    new SanitizePipe(), // sanitização primeiro
    new ValidationPipe({
      whitelist: true, // Remove propriedades não declaradas no DTO
      forbidNonWhitelisted: true, // Lança erro se receber propriedades extras
      transform: true, // Converte tipos automaticamente
    }),
  );

  // 7. Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Infinity Check')
    .setDescription('API construída com NestJS + MikroORM + PostgreSQL')
    .setVersion('1.0.0')
    .setContact(
      'Equipe de Desenvolvimento',
      'https://example.com',
      'dev@example.com',
    )
    .addServer(`http://localhost:${port}`, 'Desenvolvimento Local')
    .addServer('https://api.example.com', 'Produção')
    // Bearer JWT para autenticação no Swagger UI
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Token JWT obtido via /auth/login',
        in: 'header',
      },
      'access-token', // Nome da security scheme — usado nos controllers
    )
    // Tags organizam os endpoints no Swagger UI
    .addTag('Health', 'Health check da aplicação')
    .addTag('Auth', 'Autenticação e autorização')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Swagger UI na rota /api
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'API Infinity Check - Documentação',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true, // Mantém o token entre reloads
      docExpansion: 'none', // Recolhido por padrão
      filter: true, // Campo de busca
      showRequestDuration: true,
    },
  });

  // Download do OpenAPI em JSON
  app.getHttpAdapter().get('/api-json', (req, res) => {
    res.json(document);
  });

  // Download do OpenAPI em YAML
  app.getHttpAdapter().get('/api-yaml', async (req, res) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.send(yaml.dump(document));
  });

  // 8. Iniciar
  await app.listen(port);
  console.log(`\n🚀 Aplicação rodando em http://localhost:${port}`);
  console.log(`📚 Swagger em http://localhost:${port}/api`);
  console.log(`📄 OpenAPI JSON em http://localhost:${port}/api-json`);
  console.log(`📄 OpenAPI YAML em http://localhost:${port}/api-yaml\n`);
}

bootstrap();
