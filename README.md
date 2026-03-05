# NestJs Structure

## Stack Tecnológica

- **NestJS** - Framework Node.js progressivo
- **MikroORM** - TypeScript ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via JSON Web Tokens
- **Swagger** - Documentação automática da API
- **Helmet** - Segurança de headers HTTP
- **Joi** - Validação de variáveis de ambiente

## Características

- ✅ Autenticação JWT completa
- ✅ Sistema de permissões granulares
- ✅ Multi-tenancy com empresa_id
- ✅ Criptografia AES-256-GCM para dados sensíveis
- ✅ Auditoria de ações
- ✅ Proteção CSRF
- ✅ Sanitização XSS
- ✅ Soft delete
- ✅ Swagger UI integrado
- ✅ Validação automática de DTOs
- ✅ Migrations do banco de dados

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd <seu-repositorio>
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```bash
# Gerar chave JWT (mínimo 32 caracteres)
openssl rand -base64 32

# Gerar chave de criptografia (exatamente 64 caracteres hex)
openssl rand -hex 32
```

### 4. Configure o banco de dados

Crie o banco de dados PostgreSQL:

```sql
CREATE DATABASE teste;
```

### 5. Execute as migrations

```bash
npm run migration:up
```

### 6. Inicie a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## Documentação da API

Acesse a documentação Swagger UI em:
```
http://localhost:3000/api
```

Endpoints para download do OpenAPI:
- JSON: `http://localhost:3000/api-json`
- YAML: `http://localhost:3000/api-yaml`

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Inicia em modo watch
npm run start:debug        # Inicia em modo debug

# Build
npm run build              # Compila o projeto

# Migrations
npm run migration:create   # Cria uma nova migration
npm run migration:up       # Executa migrations pendentes
npm run migration:down     # Reverte última migration

# Testes
npm run test               # Executa testes unitários
npm run test:watch         # Executa testes em modo watch
npm run test:cov           # Gera relatório de cobertura

# Linting
npm run lint               # Executa ESLint
npm run format             # Formata código com Prettier
```

## Estrutura do Projeto

```
src/
├── main.ts                          # Bootstrap da aplicação
├── app.module.ts                    # Módulo raiz
├── app.controller.ts                # Controller principal
├── app.service.ts                   # Service principal
├── settings.ts                      # Variáveis de ambiente
│
├── config/
│   ├── configuration.ts             # Configuração tipada
│   ├── env.validation.ts            # Validação Joi do .env
│   └── mikro-orm.config.ts          # Configuração do MikroORM
│
├── entities/                        # Entidades MikroORM
│   └── default.entity.ts            # BaseEntity abstrata
│
├── database/
│   ├── postgres-entity.repository.ts  # Repositório base
│   └── migrations/                    # Migrations
│
├── middlewares/
│   └── auth.middleware.ts            # Middleware JWT
│
├── auth/
│   ├── auth.module.ts
│   ├── jwt-auth.guard.ts
│   ├── jwt.strategy.ts
│   ├── empresa.guard.ts
│   ├── permissions.guard.ts
│   ├── roles.guard.ts
│   └── decorators/
│       ├── current-user.decorator.ts
│       ├── current-empresa.decorator.ts
│       └── current-cliente.decorator.ts
│
├── common/
│   ├── encryption/
│   │   ├── encryption.module.ts
│   │   ├── encryption.service.ts
│   │   └── transformers/
│   ├── guards/
│   │   └── csrf.guard.ts
│   └── pipes/
│       └── sanitize.pipe.ts
│
├── decorators/
│   ├── permissions.decorator.ts
│   ├── roles.decorator.ts
│   └── public.decorator.ts
│
└── audit/
    ├── audit.module.ts
    └── audit.service.ts
```

## Criando um Novo Módulo

Para criar um novo módulo seguindo os padrões do projeto:

### 1. Criar a entidade

```typescript
// src/entities/produto/produto.entity.ts
import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { DefaultEntity } from '../default.entity';

@Entity()
export class Produto extends DefaultEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Index()
  @Property({ type: 'uuid' })
  empresa_id!: string;

  @Property({ length: 100 })
  nome!: string;

  @Property({ nullable: true })
  deletadoEm?: Date;
}
```

### 2. Registrar entidade no MikroORM

```typescript
// src/config/mikro-orm.config.ts
import { Produto } from '../entities/produto/produto.entity';

export default defineConfig({
  // ...
  entities: [Produto], // Adicione aqui
});
```

### 3. Criar migration

```bash
npm run migration:create
npm run migration:up
```

### 4. Criar módulo, controller e service

```bash
# Estrutura sugerida
src/produto/
├── produto.module.ts
├── produto.controller.ts
├── produto.service.ts
└── dto/
    ├── create-produto.dto.ts
    └── update-produto.dto.ts
```

### 5. Importar no AppModule

```typescript
// src/app.module.ts
import { ProdutoModule } from './produto/produto.module';

@Module({
  imports: [
    // ...
    ProdutoModule,
  ],
})
export class AppModule {}
```

## Segurança

### Autenticação

Todas as rotas (exceto as marcadas com `@Public()`) exigem autenticação JWT via header:

```
Authorization: Bearer <seu-token-jwt>
```

### Permissões

Use os decorators de permissão nos controllers:

```typescript
@Post()
@CanCreate('produtos')  // Requer permissão 'criar' no módulo 'produtos'
async create(@Body() dto: CreateProdutoDto) { ... }
```

### CSRF

Para requisições POST/PUT/PATCH/DELETE, inclua o header:

```
X-Requested-With: XMLHttpRequest
```

## Boas Práticas

1. **Sempre** filtre por `empresa_id` para multi-tenancy
2. Use **soft delete** ao invés de delete físico
3. Registre **auditoria** para operações críticas
4. **Nunca** exponha dados sensíveis em logs
5. Use **criptografia** para campos sensíveis
6. Valide **todos** os inputs com DTOs

## Licença

UNLICENSED
