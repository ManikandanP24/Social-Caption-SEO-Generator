# CaptionCraft AI — Free Social Caption & SEO Generator

Generate social media copy for Instagram, Facebook, YouTube, and LinkedIn using free open-source models that run locally in your browser. **No Anthropic key, no paid AI API, and no account with an AI provider is required.**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ManikandanP24/Social-Caption-SEO-Generator)

## Features

- **Multi-input generator:** provide an idea, paste a script/transcript, and/or upload an image.
- **Platform-aware outputs:** Instagram/Facebook hooks, captions, SEO keywords, hashtags, CTA and alt text; YouTube titles, description, tags and pinned comment; LinkedIn hook, post, hashtags and closing question.
- **Editable results:** edit generated fields, copy individual fields or a platform's content, and regenerate individual fields.
- **Image captions on device:** a local image-captioning model summarizes uploads; verify output, especially product names, prices, logos and small text.
- **Creator profile:** save brand name, niche, audience, tone, language, fixed hashtags and preferred CTA.
- **History:** search generations, mark favorites, reload and edit previous results.
- **Character warnings:** counters and warnings for key platform limits.
- **Private and keyless AI:** text generation uses Transformers.js and a quantized ONNX model in browser CPU/WASM mode. Image captions use Transformers.js in the browser. Prompts and images are not sent to a paid AI API.
- **Responsive UI:** desktop and mobile layouts.

## First use and hardware

The text generator runs through WebAssembly on the device CPU and does not require WebGPU or a dedicated GPU. This fallback is intended for computers where WebLLM cannot find a compatible GPU. CPU generation is slower, especially for long outputs and when all three platforms are selected.

The browser downloads the quantized language model and image-captioning model on first use; the downloads can total several hundred megabytes. A modern browser, enough free memory, and internet access for the initial model download are needed. The small model is less capable than hosted ChatGPT models. Check all copy, factual claims, platform limits, hashtags, links, timestamps, and alt text before publishing.

## Tech stack

- Frontend: React 18, Vite, Lucide React
- Browser-local language model: Transformers.js, onnx-community/SmolLM2-360M-Instruct-ONNX, quantized q4, CPU/WASM runtime
- Browser-local image captioning: Transformers.js, Xenova/vit-gpt2-image-captioning
- Static web server: Node.js and Express
- Local persistence: browser localStorage for brand profile and history

History and profile data are stored in the browser in use; they are not synced to a cloud account.

## Requirements

- Node.js 20 or newer recommended for local development/deployment
- A current browser supporting WebAssembly
- Internet access on first use to download the open models

**No API key or .env file is required for AI.**

## Run locally

1. Clone the repository:

       git clone https://github.com/ManikandanP24/Social-Caption-SEO-Generator.git
       cd Social-Caption-SEO-Generator

2. Install dependencies:

       npm install
       npm install --prefix client
       npm install --prefix server

3. Start both the frontend and local web server:

       npm run dev

4. Open the Vite URL shown in your terminal, usually http://localhost:5173.

## Commands

    npm run dev       # start frontend and local web server
    npm run build     # build frontend assets for production
    npm start         # serve the built frontend

## Deploy to Render

The included render.yaml deploys the frontend and server as a single Render web service. No AI provider secret is required. After approving a Blueprint deployment, Render will show the public URL. On the free Render tier, the service may spin down after inactivity; a later visit can take a while to start.

## Notes

- The image caption model generates a scene description and may not read on-image text reliably.
- Image uploads support PNG, JPEG, WebP and GIF up to 10 MB.
- Authentication, cross-device history sync, social publishing/scheduling, and cloud database storage are not included.

## License

No license has been specified yet. Add a license file before redistributing the project.
