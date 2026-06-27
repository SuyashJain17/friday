# Friday Frontend - Quick Start Guide

Welcome to Friday! This is your brand new AI search engine frontend. Here's how to get started.

## Installation & Setup (2 minutes)

```bash
# 1. Install dependencies
bun install

# 2. Create environment file
cp .env.example .env.local

# 3. Update the API URL (if not localhost:3001)
# Edit .env.local and set NEXT_PUBLIC_API_URL
```

## Running the App

```bash
# Development mode with hot reload
bun run dev

# Open http://localhost:3000 in your browser
```

## What You Get

### Pages Ready to Use

1. **Home Page** - Beautiful hero with search bar
   - URL: `/`
   - Features: Hero section, feature cards, smooth animations

2. **Search Results** - Real-time AI responses
   - URL: `/search?q=your+query`
   - Features: Streaming responses, sources sidebar, related questions

3. **Conversation View** - Full chat history
   - URL: `/conversation/[id]`
   - Features: Message history, follow-up questions, share/delete options

4. **All Conversations** - Browse history
   - URL: `/conversations`
   - Features: Grid view, search, delete with confirmation

### Key Features

- Real-time streaming responses with markdown rendering
- Source citations with external links
- Responsive design (mobile, tablet, desktop)
- Dark theme with vibrant accent colors
- Smooth animations and transitions
- Copy-to-clipboard functionality
- Loading states and error handling

## Configuration

### Set Your API URL

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001  # Your backend API
```

### Customize Theme Colors

Edit `app/globals.css` to change colors:
```css
:root {
  --primary: oklch(0.6 0.2 264);      /* Main brand color */
  --accent: oklch(0.65 0.2 280);      /* Secondary color */
  --background: oklch(0.08 0 0);      /* Dark background */
}
```

## Development Tips

### File Structure
```
components/        - Reusable UI components
  ├── SearchBar   - Search input with suggestions
  ├── ResponseStream - Markdown renderer
  ├── SourcesList - Source citations
  └── ...other components
  
lib/              - Business logic
  ├── api.ts      - Backend API integration
  ├── hooks.ts    - Custom React hooks
  ├── types.ts    - TypeScript definitions
  └── ...utilities
  
app/              - Pages and routing
  ├── page.tsx    - Home page
  ├── search/     - Search results page
  ├── conversation/ - Conversation pages
  └── conversations/ - Conversations list
```

### Hot Reload
Changes to files automatically reflect in the browser. No need to manually refresh!

### TypeScript
Full TypeScript support. Type definitions are in `lib/types.ts`.

### Styling
Uses Tailwind CSS 4.2. All styles are in component files or `app/globals.css`.

## API Integration

The frontend connects to your backend at the `NEXT_PUBLIC_API_URL`.

### Required Endpoints

Your backend should provide:

1. **POST /friday_ask**
   - Body: `{ query: string }`
   - Returns: Streaming response with answer, sources, and conversation ID

2. **POST /friday_ask/follow_up**
   - Body: `{ query: string, conversationId: string }`
   - Returns: Follow-up response in same conversation

3. **GET /conversations**
   - Returns: Array of user conversations

4. **GET /conversations/:conversationId**
   - Returns: Single conversation with full history

### Response Format

Streaming responses should include:
```
<CONVERSATION_ID>abc123</CONVERSATION_ID>
<SOURCES>[{"title":"...", "url":"..."}]</SOURCES>
Actual answer text...
```

## Deployment

### To Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# Set NEXT_PUBLIC_API_URL in Vercel environment variables
```

### To Other Hosts
```bash
# Build for production
bun run build

# Start production server
bun run start
```

## Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules .next
bun install
bun run dev
```

### API connection failing
- Check if backend is running
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### Styles not loading
- Restart dev server: `Ctrl+C` and `bun run dev`
- Check if Tailwind is configured in `next.config.mjs`

### Components not appearing
- Check that all imports are correct
- Verify component files exist in `components/` folder
- Check TypeScript errors with `bun run lint`

## Next Steps

1. **Connect Your Backend**
   - Update API URL
   - Test a search query
   - Verify streaming works

2. **Add Authentication**
   - Uncomment Supabase setup in Header.tsx
   - Add environment variables

3. **Customize Branding**
   - Update colors in globals.css
   - Change logo in components/Header.tsx
   - Update copy in pages

4. **Deploy**
   - Connect GitHub repo
   - Deploy to Vercel/hosting platform
   - Set production environment variables

5. **Monitor & Improve**
   - Check Web Vitals
   - Gather user feedback
   - Iterate on design

## Key Files to Know

| File | Purpose |
|------|---------|
| `app/page.tsx` | Home page - customize welcome message |
| `lib/api.ts` | API client - adjust endpoints here |
| `app/globals.css` | Theme colors and animations |
| `components/SearchBar.tsx` | Search input - customize suggestions |
| `components/ResponseStream.tsx` | Answer display - modify markdown rendering |

## Support

- Check README.md for detailed documentation
- Review IMPLEMENTATION.md for architecture details
- Look at component files for specific implementation details

## Fun Features to Try

1. Click suggestions in SearchBar for quick searches
2. Hover over sources to see external links
3. Copy response with the copy button
4. Try on mobile for responsive design
5. Delete conversations with confirmation dialog

Good luck with Friday! Build something amazing! 🚀
