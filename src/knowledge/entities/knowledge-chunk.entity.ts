// src/knowledge/entities/knowledge-chunk.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { DocumentEntity } from './document.entity.js';

@Entity('knowledge_chunks')
export class KnowledgeChunkEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  /**
   * КЛЮЧЕВОЕ ИЗМЕНЕНИЕ:
   * Тип свойства в коде меняется на `string`, чтобы соответствовать
   * тому, что возвращает `pgvector.toSql()`.
   * Декоратор `@Column({ type: 'vector' })` остается, он говорит TypeORM,
   * какой тип у колонки в самой базе данных PostgreSQL.
   */
  @Column({
    type: 'vector',
    length: 384,
    nullable: true,
  })
  embedding: string;

  @ManyToOne(() => DocumentEntity, (doc) => doc.chunks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documentId' })
  document: Relation<DocumentEntity>;

  @Column()
  documentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
