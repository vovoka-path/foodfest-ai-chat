import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

// --- Сущность 1: ChatSessionEntity ---
@Entity({ name: 'chat_sessions' })
export class ChatSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Связь определена с классом из этого же файла, импорт не нужен
  @OneToMany(() => ChatMessageEntity, (message) => message.session)
  messages: ChatMessageEntity[];
}

// --- Сущность 2: ChatMessageEntity ---
export enum ChatMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

@Entity({ name: 'chat_messages' })
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Связь определена с классом из этого же файла, импорт не нужен
  @ManyToOne(() => ChatSessionEntity, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  session: ChatSessionEntity;

  @Column({
    type: 'enum',
    enum: ChatMessageRole,
  })
  role: ChatMessageRole;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
