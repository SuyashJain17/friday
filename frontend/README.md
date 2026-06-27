# Friday - AI-Powered Search Engine Frontend

A modern, beautiful frontend for Friday - an AI-powered search engine that provides intelligent, sourced answers with real-time streaming responses.

## Features

- **Modern Dark Theme** - Carefully designed dark interface with vibrant accent colors
- **Real-time Streaming** - Watch AI responses stream in real-time as they're generated
- **Smart Sources** - Display relevant sources and citations alongside answers
- **Conversation History** - Keep track of all your searches and conversations
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- **Smooth Animations** - Framer Motion animations for a polished user experience
- **Markdown Support** - Full markdown rendering with syntax highlighting for code blocks

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4.2
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Markdown**: React Markdown + Prism for syntax highlighting
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ (Recommended: 20+)
- bun (recommended) or npm/pnpm/yarn
- Backend API running (see Backend Setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SuyashJain17/friday
   cd friday
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Start the development server**
   ```bash
   bun run dev
   ```

   The application will be available at `http://localhost:3000`

## Project Structure

```
app/
├── layout.tsx              # Root layout with providers and metadata
├── page.tsx                # Home page with hero section and search
├── globals.css             # Global styles and theme variables
├── search/
│   └── page.tsx            # Search results page with streaming response
├── conversation/
│   └── [id]/
│       └── page.tsx        # Individual conversation view
└── conversations/
    └── page.tsx            # All conversations list

components/
├── SearchBar.tsx           # Search input with suggestions
├── ResponseStream.tsx      # Streaming response renderer with markdown
├── SourcesList.tsx         # Display sources and citations
├── MessageBubble.tsx       # Chat message display
├── ConversationCard.tsx    # Conversation preview card
├── Header.tsx              # Top navigation
├── LoadingSkeleton.tsx     # Loading state components
└── ui/                     # shadcn/ui components

lib/
├── api.ts                  # API client and endpoints
├── types.ts                # TypeScript type definitions
├── hooks.ts                # Custom React hooks (useStreaming)
├── constants.ts            # App constants and configuration
└── utils.ts                # Helper functions
```

## Key Components

### SearchBar
Search input with suggestions dropdown and keyboard shortcuts support.

### ResponseStream
Handles streaming responses with:
- Real-time markdown rendering
- Syntax highlighting for code blocks
- Copy response to clipboard
- Responsive typography

### SourcesList
Displays sources with:
- Title and description
- External links
- Animated entrance
- Sticky positioning

### MessageBubble
Chat-style message display for conversations with different styles for user/assistant messages.

## API Integration

The frontend connects to the backend API at `NEXT_PUBLIC_API_URL`:

### Key Endpoints

- `POST /friday_ask` - New search query with streaming response
- `POST /friday_ask/follow_up` - Follow-up question in existing conversation
- `GET /conversations` - Fetch all user conversations
- `GET /conversations/:conversationId` - Fetch single conversation
- `DELETE /conversations/:conversationId` - Delete conversation

## Styling & Theme

### Color System

The app uses a modern dark theme with:
- **Background**: Deep dark (`--background: oklch(0.08 0 0)`)
- **Primary**: Vibrant blue-purple (`--primary: oklch(0.6 0.2 264)`)
- **Accent**: Lighter purple (`--accent: oklch(0.65 0.2 280)`)
- **Muted**: Gray tones for secondary content

### Tailwind CSS

Tailwind 4.2 is configured in `globals.css` with:
- CSS variables for theme colors
- Custom animation utilities
- Responsive design utilities
- Dark theme by default

## Performance

- Code splitting with dynamic imports
- Image optimization with Next.js Image component
- Lazy loading for conversation list
- Streaming responses for instant feedback
- Smooth animations with Framer Motion

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Building for Production

```bash
# Build the app
bun run build

# Start production server
bun run start

# Lint code
bun run lint
```

## Development Tips

### Hot Module Replacement (HMR)
Changes to files automatically reflect in the browser without full page reload.

### TypeScript
Full TypeScript support with strict mode enabled. Type definitions for all components and hooks.

### Debugging
- Use React DevTools browser extension
- Console logs with `[v0]` prefix for debugging
- Network tab to inspect API calls

## Environment Variables

See `.env.example` for all available configuration options:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (optional) | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase key (optional) | No |

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: support@friday.app

## Roadmap

- Authentication integration
- User profiles and preferences
- Advanced search filters
- Export conversations to PDF/Markdown
- Share conversations with others
- Dark/Light theme toggle
- Multi-language support

## Acknowledgments

Inspired by Perplexity AI but built with our unique vision for an outstanding AI search experience.
