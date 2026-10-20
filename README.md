# CaptionCraft AI — Social Caption & SEO Generator

Turn one idea, script, or image into platform-ready content for Instagram, Facebook, YouTube, and LinkedIn.

## Features

- **Multi-input generator:** describe the post, paste a script/transcript, and/or upload an image.
- **Platform-aware outputs:** Instagram/Facebook hooks, captions, SEO keywords, hashtags, CTA and alt text; YouTube titles, description, tags and pinned comment; LinkedIn hook, post, hashtags and closing question.
- **Editable results:** edit generated fields, copy individual fields or copy a platform's content, and regenerate an individual field.
- **Creator profile:** save brand name, niche, audience, tone, language, fixed hashtags and preferred CTA.
- **History:** search generations, mark favorites, reload and edit previous results.
- **Character warnings:** counters and warnings for key platform limits.
- **Server-side AI credentials:** Claude API requests run through Express; the key is not placed in browser code.
- **Responsive UI:** desktop and mobile layouts.

## Tech stack

- Frontend: React 18, Vite, Lucide React
- Backend: Node.js, Express, Multer
- AI: Anthropic Claude API
- Local persistence: browser localStorage for the brand profile and generation history

> History and profile data are currently stored in the browser used to access the app. Supabase authentication/cloud sync are not configured in this version.

## Requirements

- Node.js 20 or newer recommended
- An Anthropic API key with access to the configured Claude model

## Run locally

1. Clone the repository and enter its directory:

   ```bash
   git clone https://github.com/ManikandanP24/Social-Caption-SEO-Generator.git
   cd Social-Caption-SEO-Generator
   ```

2. Install root dependencies and the frontend/backend dependencies:

   ```bash
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

3. Create your backend environment file:

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env`:

   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   CLAUDE_MODEL=claude-sonnet-5-5
   PORT=3001
   ```

   Keep this file private. It is covered by `.gitignore`; do not commit API keys.

4. Run the frontend and backend together:

   ```bash
   npm run dev
   ```

5. Open the Vite URL shown in your terminal, usually [http://localhost:5173](http://localhost:5173).

The frontend calls the Express API through Vite's `/api` proxy. The backend health endpoint is `/api/health`.

## Useful commands

```bash
npm run dev       # start frontend and backend
npm run build     # build the frontend for production
npm start         # start the backend API
```

## API routes

- `GET /api/health` — backend readiness and API-key configuration status
- `POST /api/generate` — generate platform content; accepts multipart form data, including an optional image
- `POST /api/regenerate-field` — regenerate one result field

## Important notes

- Review output before publishing. Verify factual claims, links, timestamps, and any platform-specific requirements.
- Generated alt text should be checked against the actual image.
- Image uploads support PNG, JPEG, WebP and GIF up to 10 MB.
- Cloud-based user accounts, cloud history sync, publishing/scheduling, and production deployment are not included yet.

## License

No license has been specified yet. Add a license file before redistributing the project.
