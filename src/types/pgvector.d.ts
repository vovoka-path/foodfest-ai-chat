declare module 'pgvector' {
  export function toSql(value: number[]): string;
  export function fromSql(value: string): number[];
}
