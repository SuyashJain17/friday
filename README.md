# 🌟 Friday — AI-Powered Search & Answer Engine

Friday is an AI-powered conversational search engine inspired by Perplexity AI. It searches the live web, extracts context, synthesizes information using GPT-4o, and streams interactive answers in real-time. It features secure user registration, session persistent conversation history, and contextual follow-up questions.

---

## 🛠️ Tech Stack

Friday is built as a unified, full-stack **Next.js 16** application running on Vercel and Edge-compatible runtimes:

### Full-Stack Architecture (Next.js App Router)
- **Framework:** Next.js 16 (App Router + React 19)
- **Runtime & Bundler:** [Bun](https://bun.sh/) / Node.js (Vercel Edge & Serverless compatible)
- **Styling:** Tailwind CSS 4, Shadcn UI / Radix UI, Framer Motion
- **ORM:** Prisma ORM 7.8 (`@prisma/adapter-pg` PostgreSQL adapter with custom generated client)
- **Database:** Supabase PostgreSQL (Managed DB with connection pooling & pgBouncer)
- **Search Engine:** Tavily Search AI (Real-time advanced web search and scraping)
- **LLM Orchestration:** Vercel AI SDK (`ai` & `@ai-sdk/openai` running GPT-4o via Web Streams API)
- **Auth:** Supabase Auth (JWT verification & auto user persistence)

---

## 📂 Project Structure

```text
friday/
├── app/                          # Next.js App Router Pages & API Route Handlers
│   ├── api/
│   │   ├── ask/                  # POST /api/ask — AI streaming endpoint (Web Streams API)
│   │   ├── conversations/        # GET /api/conversations, GET/PATCH/DELETE [id], export
│   │   └── followups/            # POST /api/followups — Contextual follow-up streaming
│   ├── auth/                     # Authentication & Callback routes
│   ├── conversation/[id]/        # Historical conversation view
│   ├── search/[id]/              # Active search view
│   ├── globals.css               # Global Tailwind CSS & custom design tokens
│   └── layout.tsx                # Global App Layout
├── components/                   # Reusable UI components (SearchBar, Sidebar, MetaballBackground)
├── generated/                    # Automatically generated Prisma Client (`generated/client`)
├── lib/
│   ├── db/                       # Singleton Prisma DB connection instance
│   ├── services/                 # Clean server service layer (auth, ai, conversation, search)
│   ├── stream/                   # Web Streams API (`ReadableStream`) helper utilities
│   └── api.ts                    # Axios API Client with TTL caching & request deduplication
├── prisma/                       # Prisma schema & database migrations
├── public/                       # Static public assets
├── .env                          # Prisma CLI environment variables (Database & API Keys)
├── .env.local                    # Next.js local development overrides
├── package.json                  # Full-stack dependencies & build scripts
└── README.md                     # Project documentation
```

---

## 💾 Database Schema

The PostgreSQL database contains the following models managed via Prisma (`prisma/schema.prisma`):

```mermaid
erDiagram
    User ||--o{ Conversation : owns
    Conversation ||--o{ Message : contains

    User {
        string id PK "UUID"
        string email UK
        enum provider "Github | Google"
        string name
        string supabaseId
    }

    Conversation {
        string id PK "UUID"
        string title
        string slug
        string userId FK
    }

    Message {
        int id PK "Autoincrement"
        string content
        enum role "User | Assistance"
        string conversationId FK
        DateTime createdAt
    }
```

---

## ⚙️ Environment Variables

Set up your credentials inside `.env` (loaded automatically by the Prisma CLI) and/or `.env.local` (loaded automatically by Next.js during local development):

```env
# Supabase Client & Service Keys
NEXT_PUBLIC_SUPABASE_URL=https://[db_ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=https://[db_ref].supabase.co
VITE_SUPABASE_SECRET_KEY=your_supabase_service_role_key

# API Target URL (Leave empty when deployed or running locally with internal App Router)
NEXT_PUBLIC_API_URL=

# Tavily API Search Key
TAVILY_API_KEY=your_tavily_api_key

# OpenAI / AI Gateway API Key
AI_GATEWAY_API_KEY=your_openai_api_key

# Database Connection (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[db_ref]:[pass]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres.[db_ref]:[pass]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

# Optional GitHub OAuth
GITHUB_OAUTH_CLIENT_ID=your_github_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret
```

---

## 🚀 Setup & Installation

Ensure you have [Bun](https://bun.sh/) installed locally on your system.

### 1. Database & Prisma Setup

1. Configure your database URLs in `.env` or `.env.local`.
2. Generate the custom Prisma Client (`generated/client`):
   ```bash
   bun run db:generate
   ```

### 2. Start the Application

Start the unified full-stack Next.js dev server on port `3000`:
```bash
bun install
bun dev
```

### 3. Production Build & Verification

Verify full production readiness (`bun --bun run prisma generate && next build`):
```bash
bun run build
```

---

## ⚡ Performance & Caching Architecture

To ensure instantaneous typing responsiveness and minimal network overhead, Friday incorporates a specialized multi-layer optimization strategy:

1. **Adaptive 3D Raymarching Throttling (`MetaballBackground`)**:
   The interactive 3D metaball canvas dynamically detects when the user is typing into an `<input>` or `<textarea>` element (`document.activeElement`). While typing, raymarching loops throttle to ~15 FPS to yield 100% of main thread priority to UI rendering, instantly restoring buttery 60 FPS when typing stops. Max shader iterations are bounded and `pixelRatio` is capped at `1.25` for optimal GPU performance.
2. **Client-Side Request Deduplication & TTL Caching (`lib/api.ts`)**:
   `fetchConversations()` implements an in-memory `Promise` deduplication layer and a `5000ms` TTL cache. Simultaneous requests across sidebar and layout components share a single network call, eliminating database polling overhead while automatically invalidating on `deleteConversation` or `renameConversation`.
3. **Database Bounding (`take: 50`)**:
   Database queries to `getUserConversations` limit historical retrieval to the top 50 recent sessions, minimizing JSON serialization latency and serverless connection pool consumption.

---

## 📡 API Reference (`/api/*`)

All internal requests are authenticated via Supabase JWT attached to the `Authorization` header by the frontend API interceptor (`lib/api.ts`).

### 🔐 Auth Verification Header
```http
Authorization: Bearer <JWT_Token_From_Supabase>
```

---

### 1. New Search Query (`POST /api/ask`)

Streams an AI answer based on real-time web search results via standard Web Streams API.

- **URL:** `/api/ask`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "query": "What is the best way to learn Rust in 2026?"
  }
  ```

#### Response Format (`text/event-stream` / `ReadableStream`)
1. **Raw Text:** Streams markdown chunks generated by GPT-4o.
2. **Sources Tag:** Appended at the end of the text stream:
   ```text
   <SOURCES>
   [{"url": "https://example.com/rust", "title": "Learn Rust in 2026"}]
   <SOURCES>
   ```
3. **Conversation ID Tag:** Appended at the very end of the stream for tracking follow-ups:
   ```text
   <CONVERSATION_ID>
   550e8400-e29b-41d4-a716-446655440000
   <CONVERSATION_ID>
   ```

---

### 2. Follow-Up Query (`POST /api/followups`)

Continues a search session by appending conversation history (`chatHistory`) to the prompt.

- **URL:** `/api/followups`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "query": "Can you give me a code example of a web server in Rust?",
    "conversationId": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```
- **Response Format:** Same streaming format with `<SOURCES>` blocks (closes cleanly after `<SOURCES>`).

---

### 3. Get Conversations List (`GET /api/conversations`)

Fetches the list of previous conversations for the current authenticated user.

- **URL:** `/api/conversations`
- **Method:** `GET`
- **Success Response:** `200 OK`
  ```json
  {
    "conversations": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "What is the best way to learn Rust in 2026?",
        "slug": "what-is-the-best-way-to-learn-rust-in-2026",
        "messages": [
          {
            "content": "What is the best way to learn Rust in 2026?",
            "createdAt": "2026-06-25T18:16:08.000Z"
          }
        ]
      }
    ]
  }
  ```

---

### 4. Get Conversation Details (`GET /api/conversations/:id`)

Fetches all messages for a specific conversation session.

- **URL:** `/api/conversations/:id`
- **Method:** `GET`
- **Success Response:** `200 OK`
  ```json
  {
    "conversation": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "What is the best way to learn Rust in 2026?",
      "slug": "what-is-the-best-way-to-learn-rust-in-2026",
      "userId": "usr_abc123",
      "messages": [
        {
          "id": 1,
          "content": "What is the best way to learn Rust in 2026?",
          "role": "User",
          "conversationId": "550e8400-e29b-41d4-a716-446655440000",
          "createdAt": "2026-06-25T18:16:08.000Z"
        },
        {
          "id": 2,
          "content": "To learn Rust in 2026, start with...",
          "role": "Assistance",
          "conversationId": "550e8400-e29b-41d4-a716-446655440000",
          "createdAt": "2026-06-25T18:16:15.000Z"
        }
      ]
    }
  }
  ```

---

### 5. Rename Conversation (`PATCH /api/conversations/:id`)

Updates the title of an existing conversation.

- **URL:** `/api/conversations/:id`
- **Method:** `PATCH`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Learning Rust — Best Resources"
  }
  ```

---

### 6. Delete Conversation (`DELETE /api/conversations/:id`)

Deletes a conversation and all its associated messages.

- **URL:** `/api/conversations/:id`
- **Method:** `DELETE`

---

### 7. Export Conversation (`GET /api/conversations/:id/export`)

Downloads the full transcript of a conversation as a formatted `.txt` file.

- **URL:** `/api/conversations/:id/export`
- **Method:** `GET`
- **Headers Returned:** `Content-Type: text/plain`, `Content-Disposition: attachment; filename="conversation-<id>.txt"`
