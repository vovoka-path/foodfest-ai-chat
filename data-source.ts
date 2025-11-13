import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import pg from 'pg';
import pgvector from 'pgvector';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения
config({ path: './.env' });

// Оборачиваем в асинхронную функцию для настройки
export const getDataSourceOptions = async (): Promise<DataSourceOptions> => {
  const configService = new ConfigService();
  const databaseUrl = configService.get<string>('DATABASE_URL');

  // Создаем временный клиент для получения OID
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  // Используем двойные кавычки для строки, чтобы одинарные внутри работали
  const { rows } = await client.query(
    "SELECT oid FROM pg_type WHERE typname = 'vector'",
  );
  await client.end();

  if (rows.length > 0) {
    const vectorOid = rows[0].oid;
    pg.types.setTypeParser(vectorOid, (value) => pgvector.fromSql(value));
  }

  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
    driver: pg,
  };
};

// Создаем DataSource асинхронно для экспорта
const initializeDataSource = async () => {
  const options = await getDataSourceOptions();
  return new DataSource(options);
};

export default initializeDataSource();
