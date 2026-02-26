import { defineConfig } from '@mikro-orm/postgresql';
import {
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_USER,
  DATABASE_HOST,
  DATABASE_PORT,
} from '../settings';

export default defineConfig({
  host: DATABASE_HOST,
  port: parseInt(DATABASE_PORT, 10),
  dbName: DATABASE_NAME,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,

  // Registre aqui TODAS as entidades da aplicação
  entities: [
    // Adicione suas entidades aqui conforme for criando
  ],

  // Permite rodar sem entidades no início do projeto
  discovery: {
    warnWhenNoEntities: false,
  },

  // Não conecta automaticamente ao banco no startup (útil para desenvolvimento)
  connect: false,

  migrations: {
    path: 'src/database/migrations',
  },

  seeder: {
    path: 'src/database/seeders',
  },

  // Configurações adicionais recomendadas
  debug: process.env.NODE_ENV === 'development',
  allowGlobalContext: true, // Permite usar EntityManager fora do RequestContext em algumas situações
});
