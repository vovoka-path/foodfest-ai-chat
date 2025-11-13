import { Module } from '@nestjs/common';
import { ChunkingService } from './chunking.service.js';
import { SanitizerModule } from '../sanitizer/sanitizer.module.js';

@Module({
  imports: [SanitizerModule],
  providers: [ChunkingService],
  exports: [ChunkingService],
})
export class ChunkingModule {}
