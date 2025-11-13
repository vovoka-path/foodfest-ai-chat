# FOOD FEST AI CHAT

A sophisticated Retrieval-Augmented Generation (RAG) system built with NestJS, featuring document processing, vector search, and AI-powered chat capabilities.


![NestJS](https://img.shields.io/badge/NestJS-11+-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![Redis](https://img.shields.io/badge/Redis-6+-red)

## 🚀 Features

### Core Capabilities
- **RAG Chat System**: Intelligent conversational AI with context-aware responses
- **Document Management**: Upload, process, and index documents automatically
- **Vector Search**: Semantic search using embeddings and PostgreSQL pgvector
- **Asynchronous Processing**: Background document indexing with BullMQ
- **Multi-LLM Support**: Integration with OpenAI and Google Gemini
- **Admin Dashboard**: Built-in AdminJS interface for system management
- **Telegram Notifications**: Real-time updates via Telegram bot

### Advanced Features
- **Query Rewriting**: Automatic query enhancement using conversation history
- **Chunking Strategy**: Intelligent document segmentation for optimal retrieval
- **Vector Embeddings**: Local embedding generation using @xenova/transformers
- **Session Management**: Persistent chat sessions with history tracking
- **Status Tracking**: Real-time document processing status updates

## 🏗️ Architecture

### System Overview
```
User Query → Chat API → Query Rewriting → Vector Search → LLM Generation → Response
     ↓
Document Upload → AdminJS → Indexing Queue → Chunking → Embeddings → Vector Storage
```

### Key Components
- **Chat Module**: RAG conversation handling with context management
- **Knowledge Module**: Document CRUD operations and status tracking
- **Embeddings Module**: Local embedding generation using transformers
- **Search Module**: Vector similarity search with pgvector
- **Indexing Module**: Asynchronous document processing pipeline
- **Notifications Module**: Telegram integration for status updates

## 🛠️ Technology Stack

### Backend Framework
- **NestJS 11+**: Progressive Node.js framework
- **TypeScript**: Type-safe development
- **Express**: HTTP server foundation

### Database & Storage
- **PostgreSQL 14+**: Primary database with pgvector extension
- **Redis**: Queue management and caching
- **TypeORM**: Database ORM with vector support

### AI & ML
- **@xenova/transformers**: Local embedding generation
- **OpenAI API**: GPT model integration
- **Google Gemini**: Alternative LLM provider
- **pgvector**: Vector similarity search

### Queue & Processing
- **BullMQ**: Background job processing
- **Redis**: Queue storage and management

### Admin & Monitoring
- **AdminJS**: Administrative dashboard
- **NestJS DevTools**: Development monitoring

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ with pgvector extension
- Redis 6+
- npm (recommended) or npm

### Environment Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd food_fast_backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_DB=foodfest_ai_chat_db
DATABASE_URL="postgresql://admin:secret@localhost:5433/foodfest_ai_chat_db?schema=public"

# Telegram Notifier
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=


# REDIS DOCKER
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379

# GEMINI LLM
GEMINI_API_KEY="key"
GEMINI_MODEL_NAME="gemini-2.5-flash" # gemini-2.5-flash-lite

# OPENAI LLM
# OPENAI_API_KEY="sk-..."
OPENAI_MODEL_NAME="gpt-4o"
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_REQUEST_TIMEOUT=30000 # 30 секунд в миллисекундах
OPENAI_MAX_RETRIES=1       # 1 повторная попытка при сбоях (всего 2 запроса)

# GOOGLE_CLOUD_PROJECT=gemini-cli-for-vscode
```

### Database Setup
1. Create PostgreSQL database:
```sql
CREATE DATABASE foodfest_chat;
CREATE EXTENSION IF NOT EXISTS vector;
```

2. Run migrations (if applicable):
```bash
npm run migration:run
```

## 🚀 Running the Application

### Development Mode
```bash
# Start the application in watch mode
npm run start:dev

# Start with debug logging
npm run start:debug
```

### Production Mode
```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Background Services
```bash
# Start Redis server
redis-server

# Start PostgreSQL
sudo systemctl start postgresql
```

## 📚 API Documentation

### Core Endpoints

#### Chat API (`/api/chat`)
```typescript
POST /api/chat
{
  "query": "What are the key features?",
  "sessionId": "optional-session-id"
}
```

#### Documents API (`/api/documents`)
```typescript
POST /api/documents
GET /api/documents
GET /api/documents/:id
PUT /api/documents/:id
DELETE /api/documents/:id
```

### Admin Dashboard
- **URL**: `http://localhost:3001/admin`
- **Credentials**: Configured via environment variables

## 🔧 Configuration

### Embedding Models
Default model: `Xenova/all-MiniLM-L6-v2`
```typescript
// src/embeddings/embeddings.service.ts
private model = 'Xenova/all-MiniLM-L6-v2';
```

### Chat Configuration
```typescript
// src/chat/chat.service.ts
const CHAT_CONFIG = {
  TAKE: 10, // History message limit
};
```

### Vector Search
```typescript
// Default topK for similarity search
const relevantChunks = await this.searchService.findRelevantChunks(
  queryEmbedding,
  5, // Number of chunks to retrieve
);
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

## 📊 Monitoring & Debugging

### Health Checks
- Application: `http://localhost:3001/api/health`
- Database connection status
- Redis connectivity
- Model loading status

### Logging
- Application logs: Console output with structured logging
- Queue monitoring: BullMQ dashboard
- AdminJS: Built-in monitoring interface

### Performance Metrics
- Embedding generation time
- Vector search latency
- LLM response times
- Queue processing statistics

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start services
docker-compose up -d
```

### Manual Deployment
1. Build the application:
```bash
npm run build
```

2. Set production environment variables
3. Start the application:
```bash
NODE_ENV=production npm run start:prod
```

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_HOST` | PostgreSQL host | localhost |
| `REDIS_HOST` | Redis host | localhost |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `GEMINI_API_KEY` | Google Gemini key | - |
| `ADMIN_EMAIL` | Admin dashboard email | admin@food.com |
| `ADMIN_PASSWORD` | Admin dashboard password | pass |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write unit tests for new features
- Use conventional commit messages
- Update documentation for API changes

## 📄 License

This project is licensed under the UNLICENSED license.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the admin dashboard for system status

## 🔄 Changelog

### Version 0.0.1
- Initial release with core RAG functionality
- Document indexing and vector search
- Chat interface with context management
- Admin dashboard integration
- Telegram notifications

---

**Built with ❤️ using NestJS, TypeScript, and modern AI technologies.**
