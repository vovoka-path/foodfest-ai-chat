import { ValueTransformer } from 'typeorm';
import pgvector from 'pgvector';

export class VectorTransformer implements ValueTransformer {
  to(value: number[] | null): string | null {
    if (!value) {
      return null;
    }
    return pgvector.toSql(value);
  }

  from(value: string | null): number[] | null {
    if (!value) {
      return null;
    }
    return pgvector.fromSql(value);
  }
}
