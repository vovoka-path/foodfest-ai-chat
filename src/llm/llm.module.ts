import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LlmService } from './llm.service.js';
import { OpenAiProvider } from './providers/openai.provider.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { BaseLlmProvider } from './providers/base-llm.provider.js';
import { LLM_PROVIDERS } from './llm.constants.js';

const llmProviderFactory: Provider = {
  provide: LLM_PROVIDERS,
  // ИЗМЕНЕНО: Мы больше не инжектируем готовые экземпляры провайдеров.
  // Мы инжектируем только ConfigService, чтобы фабрика сама решала, что создавать.
  useFactory: (configService: ConfigService) => {
    const activeProviders: BaseLlmProvider[] = [];

    const hasOpenAiKey = !!configService.get<string>('OPENAI_API_KEY');
    const hasGeminiKey = !!configService.get<string>('GEMINI_API_KEY');

    // ИЗМЕНЕНО: Экземпляры создаются только при наличии ключа!
    if (hasOpenAiKey) {
      activeProviders.push(new OpenAiProvider(configService));
    }
    if (hasGeminiKey) {
      activeProviders.push(new GeminiProvider(configService));
    }

    return activeProviders;
  },
  inject: [ConfigService], // Инжектируем только ConfigService
};

@Module({
  imports: [ConfigModule],
  providers: [
    LlmService,
    // ИЗМЕНЕНО: Мы больше не регистрируем провайдеры напрямую здесь,
    // так как фабрика теперь сама управляет их созданием.
    // OpenAiProvider,
    // GeminiProvider,
    llmProviderFactory,
  ],
  exports: [LlmService],
})
export class LlmModule {}
