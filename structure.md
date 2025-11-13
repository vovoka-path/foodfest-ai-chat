# Project Structure

.editorconfig
.env
.env.example
.gitattributes
.gitignore
.pnpmrc
.prettierrc
DEPLOYMENT.md
docker-compose.yml
eslint.config.mjs
GRAPH.md
implemented.md
nest-cli.json
package-lock.json
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
README.md
tsconfig.build.json
tsconfig.json

src/
├── app.controller.spec.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts

src/chat/
    ├── chat.controller.spec.ts
    ├── chat.controller.ts
    ├── chat.module.ts
    ├── chat.service.spec.ts
    └── chat.service.ts

src/chat/dto/
    └── create-chat-message.dto.ts

src/chunking/
    ├── chunking.module.ts
    ├── chunking.service.spec.ts
    └── chunking.service.ts

src/database/
    ├── data-source.ts
    ├── database.constants.ts
    ├── database.module.ts
    ├── database.provider.ts
    └── vector.transformer.ts

src/documents/
    ├── documents.controller.ts
    ├── documents.module.ts
    ├── documents.service.ts
    └── dto/
        └── create-document.dto.ts

src/embeddings/
    ├── embeddings.module.ts
    ├── embeddings.service.spec.ts
    └── embeddings.service.ts

src/indexing/
    ├── indexing.module.ts
    ├── indexing.processor.ts
    └── indexing.service.ts

src/knowledge/
    ├── knowledge.module.ts
    ├── knowledge.service.ts
    ├── dto/
    │   └── document.dto.ts
    └── entities/
        ├── document-status.enum.ts
        ├── document.entity.ts
        └── knowledge-chunk.entity.ts

src/llm/
    ├── llm.constants.ts
    ├── llm.module.ts
    ├── llm.service.ts
    └── providers/
        ├── base-llm.provider.ts
        ├── gemini.provider.ts
        └── openai.provider.ts

src/notifications/
    ├── notifications.module.ts
    └── telegram/
        ├── telegram.service.spec.ts
        └── telegram.service.ts

src/search/
    ├── search.module.ts
    ├── search.service.spec.ts
    └── search.service.ts

src/types/
    ├── pgvector.d.ts
    └── typeorm.d.ts

test/
    ├── app.e2e-spec.ts
    └── jest-e2e.json
