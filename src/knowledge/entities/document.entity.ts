// src/knowledge/entities/document.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { KnowledgeChunkEntity } from './knowledge-chunk.entity.js';
import { DocumentStatus } from './document-status.enum.js';

export { DocumentStatus };

@Entity('documents')
// ✅ 2. Наследуемся от BaseEntity
export class DocumentEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  // @Column({ type: 'text', unique: true })
  // source: string;

  // @Column({ type: 'text' })
  // persona: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @OneToMany(() => KnowledgeChunkEntity, (chunk) => chunk.document)
  chunks: Relation<KnowledgeChunkEntity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
