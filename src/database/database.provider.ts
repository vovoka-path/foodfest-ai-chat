import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// FIX: Импортируем RawBuilder
import {
  ColumnType,
  Generated,
  Kysely,
  PostgresDialect,
  RawBuilder,
} from 'kysely';
import { Pool } from 'pg';
import { KYSLEY_INSTANCE } from './database.constants.js';

export interface ChunkTable {
  id: Generated<string>;
  content: string;
  source: string;
  persona: string;
  // FIX: Указываем, что при вставке/обновлении мы можем передавать не только строку,
  // но и специальный объект RawBuilder от Kysely.
  embedding: ColumnType<
    number[],
    string | RawBuilder<unknown>,
    string | RawBuilder<unknown>
  >;
  metadata: ColumnType<
    Record<string, unknown> | null,
    string | null,
    string | null
  >;
  createdAt: Generated<Date>;
}

export interface Database {
  chunks: ChunkTable;
}

export const databaseProvider: Provider = {
  provide: KYSLEY_INSTANCE,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    // Parse the DATABASE_URL to extract connection parameters
    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    const url = new URL(databaseUrl);
    const dialect = new PostgresDialect({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      pool: new Pool({
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.substring(1),
        user: url.username,
        password: url.password,
      }),
    });

    return new Kysely<Database>({
      dialect,
    });
  },
};
