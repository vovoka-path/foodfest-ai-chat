import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';

@Injectable()
export class EmbeddingsService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingsService.name);
  private model = 'Xenova/all-MiniLM-L6-v2';

  // <<<--- ИЗМЕНЕНИЕ 1: Вместо самой модели, храним Promise, который ее вернет
  private generatorPromise: Promise<FeatureExtractionPipeline>;

  onModuleInit() {
    this.logger.log(`Initializing model: ${this.model}`);
    // <<<--- ИЗМЕНЕНИЕ 2: Мы не ждем (await) здесь. Мы просто запускаем процесс
    // и сохраняем сам Promise.
    this.generatorPromise = pipeline('feature-extraction', this.model);

    // Добавляем обработчик, чтобы видеть, когда модель реально загрузилась
    this.generatorPromise
      .then(() => {
        this.logger.log('Model initialized successfully');
      })
      .catch((error) => {
        this.logger.error('Failed to initialize model', error);
      });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // <<<--- ИЗМЕНЕНИЕ 3: КЛЮЧЕВОЙ ШАГ!
    // Любой вызов этого метода теперь СНАЧАЛА дождется (await)
    // завершения Promise'а инициализации.
    const generator = await this.generatorPromise;

    // Если первый вызов пришел до готовности - он подождет.
    // Все последующие вызовы получат уже готовый результат мгновенно.
    const output = await generator(text, {
      pooling: 'mean',
      normalize: true,
    });

    const dataArray = Array.from(output.data);
    return dataArray.map((item) => Number(item));
  }
}
