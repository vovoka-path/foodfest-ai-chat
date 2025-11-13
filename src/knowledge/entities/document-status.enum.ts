// Этот файл не имеет зависимостей от других сущностей, разрывая цикл.
export enum DocumentStatus {
  PENDING = 'PENDING',
  INDEXING = 'INDEXING',
  INDEXED = 'INDEXED',
  FAILED = 'FAILED',
  INDEXING_IN_PROGRESS = 'INDEXING_IN_PROGRESS',
  INDEXING_FAILED = 'INDEXING_FAILED',
}
