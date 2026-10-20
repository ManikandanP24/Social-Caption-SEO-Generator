# CaptionCraft AI — Free Social Caption & SEO Generator

Generate social media copy for Instagram, Facebook, YouTube, and LinkedIn using free open-source models that run locally in your browser. **No Anthropic key, no paid AI API, and no account with an AI provider is required.**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ManikandanP24/Social-Caption-SEO-Generator)

**Deploy:** Sign in to Render, review the Blueprint, and approve deployment. The app does not require any AI API secret. Render will show the public URL when the service is deployed.

## Features

- **Multi-input generator:** provide an idea, paste a script/transcript, and/or upload an image.
- **Platform-aware outputs:** Instagram/Facebook hooks, captions, SEO keywords, hashtags, CTA and alt text; YouTube titles, description, tags and pinned comment; LinkedIn hook, post, hashtags and closing question.
- **Editable results:** edit generated fields, copy individual fields or a platform's content, and regenerate individual fields.
- **Image captions on device:** a local image-captioning model summarizes uploads; verify the output, especially product names, prices, logos and small text.
- **Creator profile:** save brand name, niche, audience, tone, language, fixed hashtags and preferred CTA.
- **History:** search generations, mark favorites, reload and edit previous results.
- **Character warnings:** counters and warnings for key platform limits.
- **Private and keyless AI:** text generation uses WebLLM and image captions use Transformers.js in your browser; prompts/images are not sent to an AI API.
- **Responsive UI:** desktop and mobile layouts.

## Important: first use

This is a **free on-device model, not the hosted ChatGPT service**. The browser downloads the open models the first time you use text generation and image captioning; this can take a while and may use hundreds of megabytes or more of storage. Subsequent runs may use the browser cache. Text generation requires a WebGPU-compatible browser and a reasonably capable device. Recent Chrome or Edge on supported hardware is a good starting point. The smaller local model may be less capable than hosted ChatGPT models, and its claims and SEO recommendations should be checked before publishing.

## Tech stack

- Frontend: React 18, Vite, Lucide React
- Browser-local language model: WebLLM using Llama-3.2-1B-Instruct-q4f16_1-MLC
- Browser-local image captioning: Transformers.js using Xenova/vit-gpt2-image-captioning
- Static web server: Node.js and Express
- Local persistence: browser localStorage for the brand profile and generation history

History and profile data are stored in the browser in use; they are not synced to a cloud account.

## Requirements

- Node.js 20 or newer recommended
- A modern browser with WebGPU support for local language generation
- Internet access on first use to download the open models

No API key or .env file is required for AI.

## Run locally

1. Clone the repository:

       git clone https://github.com/ManikandanP24/Social-Caption-SEO-Generator.git
       cd Social-Caption-SEO-Generator

2. Install dependencies:

       npm install
       npm install --prefix client
       npm install --prefix server

3. Start both the frontend and the static API/status server:

       npm run dev

4. Open the Vite URL shown in the terminal, usually http://localhost:5173.

## Commands

    npm run dev       # start frontend and local web server
    npm run build     # build frontend assets for production
    npm start         # serve the built frontend

## Deployment

The included render.yaml deploys the client and server as a single Render web service. No provider secret is required. After deploying, use the public URL assigned by Render. The free Render tier may spin down after inactivity, causing a delay on the next visit.

## Notes

- Review AI outputs before publishing, especially factual details, tags, alt text, timestamps and links.
- The local image captioner produces a short scene description; it may not read on-image text reliably.
- Image uploads support PNG, JPEG, WebP and GIF up to 10 MB.
- Authentication, cross-device history sync, publishing/scheduling and cloud database storage are not included yet.

## License

No license has been specified yet. Add a license file before redistributing the project.
