# Social Caption & SEO Generator

Full-stack React + Vite frontend and Express backend for generating social content for Instagram/Facebook, YouTube, and LinkedIn.

## Requirements
- Node.js 20+
- Anthropic API key

## Setup
1. Install dependencies from the root: `npm install`
2. Create `server/.env` from `server/.env.example` and add your `ANTHROPIC_API_KEY`.
3. Run `npm run dev`.
4. Open the Vite local URL shown in the terminal.

The frontend runs locally and requests generations from the Express backend. Keep API credentials in `server/.env`; never put them in client code.

See project source for routes and configuration.