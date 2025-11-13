# Implemented Functionality

## Core Functionality

- **Document Upload:** Users can upload documents in various formats (e.g., PDF, TXT, DOCX).
- **Chunking:** Uploaded documents are split into smaller chunks for efficient processing.
- **Embedding Generation:** Each chunk is converted into a vector embedding using a suitable model.
- **Vector Storage:** Embeddings are stored in a vector database (e.g., pgvector) for similarity search.
- **Indexing:** Documents are indexed to enable fast retrieval.
- **Search:** Users can search for information within the uploaded documents using keywords or natural language queries.
- **Chat Interface:** A chat interface allows users to interact with the knowledge base.
- **Contextual Responses:** The chat interface provides responses based on the most relevant document chunks.

## Admin Functionality

- **Document Management:** Administrators can view, edit, and delete uploaded documents.
- **User Management:** Administrators can manage user accounts and permissions.

## Notifications

- **Telegram Notifications:** The system can send notifications to a Telegram channel.

## Data Models

- **Document:** Represents a single uploaded document.
- **KnowledgeChunk:** Represents a chunk of text extracted from a document.
- **DocumentStatus:** Enumerates the possible statuses of a document (e.g., uploaded, processed, indexed).