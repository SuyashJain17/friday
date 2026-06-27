# 🌟 Friday — AI-Powered Search & Answer Engine

Friday is an AI-powered conversational search engine inspired by Perplexity AI. It searches the live web, extracts context, synthesizes information using GPT-4o, and streams interactive answers in real-time. It features secure user registration, session persistent conversation history, and contextual follow-up questions.

---

## 🛠️ Tech Stack

Friday is built on a modern, fast, type-safe stack:

### Frontend
- **Framework:** React 19 (Vite / Bun-integrated bundler)
- **Styling:** Tailwind CSS, Shadcn UI / Radix UI
- **State & Routing:** React Router v8, Axios
- **Auth:** Supabase Auth (SSR integration + Social Providers)

### Backend
- **Runtime:** [Bun](https://bun.sh/) (Fast, all-in-one JavaScript runtime)
- **Server:** Express 5 (with native TypeScript support)
- **ORM:** Prisma ORM 7.8 (PostgreSQL adapter)
- **Database:** Supabase PostgreSQL (Managed DB with connection pooling)
- **Search Engine:** Tavily Search AI (Real-time advanced web search and scraping)
- **LLM Orchestration:** Vercel AI SDK (`ai` & `@ai-sdk/openai` running GPT-4o)

---

## 📂 Project Structure

```text
friday/
├── backend/                  # Express API Server
│   ├── generated/            # Automatically generated Prisma Client (ignored by git)
│   ├── prisma/
│   │   ├── migrations/       # Database schema migrations
│   │   └── schema.prisma     # Prisma data models
│   ├── client.ts             # Supabase Admin/Client setup
│   ├── db.ts                 # Database instance connection (Prisma Client)
│   ├── index.ts              # Express server and search endpoints
│   ├── middleware.ts         # Supabase Auth verification & Auto User Sync
│   ├── prompt.ts             # LLM prompt templates & System prompts
│   └── tsconfig.json         # Backend TS Config
│
└── frontend/                 # React UI Application
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── lib/              # API clients & configuration (Supabase, API URLs)
    │   ├── pages/            # App pages (Dashboard, Auth, etc.)
    │   ├── App.tsx           # Router and Navigation
    │   ├── frontend.tsx      # DOM Entrypoint
    │   └── index.ts          # SPA serve and HMR dev server (Bun-based)
    └── package.json          # Frontend build scripts & dependencies
```

---

## 💾 Database Schema

The PostgreSQL database contains the following models managed via Prisma:

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

Copy the environment keys to setup your credentials.

### Backend (`backend/.env`)
```env
# Tavily API Search Key
TAVILY_API_KEY=your_tavily_api_key

# OpenAI / AI Gateway API Key
AI_GATEWAY_API_KEY=your_openai_api_key

# Database Connection (Supabase PostgreSQL)
# Connection Pooling (Port 6543) used for transaction queries
DATABASE_URL="postgresql://postgres.[db_ref]:[pass]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct Connection (Port 5432) used for database migrations
DIRECT_DATABASE_URL="postgresql://postgres.[db_ref]:[pass]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

# Auth Provider Configurations (Optional)
GITHUB_OAUTH_CLIENT_ID=your_github_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret

# Supabase Auth Keys
VITE_SUPABASE_URL=https://[db_ref].supabase.co
VITE_SUPABASE_SECRET_KEY=your_supabase_service_role_key
```

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://[db_ref].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

---

## 🚀 Setup & Installation

Ensure you have [Bun](https://bun.sh/) installed locally on your system.

### 1. Database Setup

1. Configure your database URLs in `backend/.env`.
2. Inside `backend`, run the Prisma migration command to prepare your PostgreSQL DB schema:
   ```bash
   cd backend
   bun --bun run prisma migrate dev
   ```
3. Run the generator to update the custom-compiled Prisma client in `backend/generated/`:
   ```bash
   bun --bun run prisma generate
   ```

### 2. Start the Backend API Server

Start the Express API server (runs on port `3001` by default):
```bash
cd backend
bun run index.ts
```

### 3. Start the Frontend Development Server

Start the React SPA development server (runs with Hot Module Reloading):
```bash
cd frontend
bun install
bun dev
```

---

## 📡 API Reference

All requests must be authenticated. Include your Supabase Access Token (JWT) in the `Authorization` header.

### 🔐 Auth Verification Header
```http
Authorization: <JWT_Token_From_Supabase>
```

---

### 1. New Search Query

Stream an AI answer based on real-time web search results.

- **URL:** `/friday_ask`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "query": "What is the best way to learn Rust in 2026?"
  }
  ```

#### Response Format (Server-Sent Event / Text Stream)
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

### 2. Follow-Up Query

Continue a search session by appending history context to the model prompt.

- **URL:** `/friday_ask/follow_up`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "query": "Can you give me a code example of a web server in Rust?",
    "conversationId": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```
- **Response Format:** Same streaming format with `<SOURCES>` blocks.

---

### 3. Get Conversations List

Fetch the list of previous conversations for the current authenticated user.

- **URL:** `/conversations`
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

### 4. Get Conversation Details

Fetch all messages for a specific conversation session.

- **URL:** `/conversations/:conversationId`
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
