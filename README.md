# CaptionCraft AI — Free Social Caption & SEO Draft Builder

Create fast, editable social content drafts for Instagram, Facebook, YouTube, and LinkedIn. The default generator is lightweight and runs in the browser without a GPU, model download, Anthropic key, paid AI API, or AI-provider account.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ManikandanP24/Social-Caption-SEO-Generator)

## What it does

- Accept a content idea, script/transcript, and/or image filename plus context.
- Build structured Instagram/Facebook captions, keywords, hashtags, CTA and alt-text suggestions.
- Create YouTube title options, description templates, tags and pinned comment ideas.
- Create LinkedIn hook/post/hashtags/closing question drafts.
- Edit results, copy each field or a whole platform, and quickly regenerate template variations.
- Save brand settings, recent drafts, and favorites in the browser.
- Work on lower-powered devices because no LLM download or GPU inference is needed.

## Important limitation

**This release uses a rule-based template builder, not a ChatGPT-class AI model.** It is intentionally instant and reliable while avoiding the browser GPU/model loading errors from the earlier version. It extracts simple keywords from the supplied context/script and formats platform-specific copy; it does not deeply paraphrase, translate, analyze pixels in an image, or understand a script like a full LLM. For image-only input, add a description in the Content Idea field because the builder cannot read the image's contents. Edit and verify all drafts before publishing.

If you later want more creative AI-generated copy, we can add an optional provider setting or a compatible model mode without making that dependency block the instant draft generator.

## Tech stack

- Frontend: React 18, Vite, Lucide React
- Quick generator: client-side JavaScript templates; no inference model
- Static web server: Node.js and Express
- Persistence: browser localStorage for brand profile and draft history

Brand settings and history live only in the current browser. They are not synced between devices.

## Requirements

- Node.js 20 or newer for local setup and deployment
- A modern browser
- Internet access to load the site

No API key or .env file is required.

## Run locally

1. Clone this repository:

       git clone https://github.com/ManikandanP24/Social-Caption-SEO-Generator.git
       cd Social-Caption-SEO-Generator

2. Install dependencies:

       npm install
       npm install --prefix client
       npm install --prefix server

3. Start frontend and server:

       npm run dev

4. Open the Vite URL printed in the terminal, usually http://localhost:5173.

## Commands

    npm run dev       # start frontend and static server
    npm run build     # build frontend
    npm start         # serve production build

## Deploy to Render

The included render.yaml describes a single web service for the frontend and Express static server. No AI-provider secret is needed. After approving the Blueprint, Render provides the public .onrender.com URL. Free services may spin down after inactivity.

## License

No license has been specified yet. Add a license file before redistribution.
