import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3001);
const model = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      callback(new Error('Unsupported image type. Upload PNG, JPEG, WebP, or GIF.'));
      return;
    }
    callback(null, true);
  },
});

let systemPrompt;
try {
  systemPrompt = await fs.readFile(path.join(__dirname, 'system-prompt.txt'), 'utf8');
} catch (error) {
  console.error('Could not load system-prompt.txt:', error.message);
  process.exit(1);
}

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const error = new Error('Anthropic API key is not configured. Add ANTHROPIC_API_KEY to server/.env and restart the server.');
    error.status = 503;
    throw error;
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function parseJsonResponse(rawText) {
  const stripped = String(rawText || '').trim()
    .replace(/^\x60\x60\x60(?:json)?\s*/i, '')
    .replace(/\s*\x60\x60\x60$/, '')
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const firstBrace = stripped.indexOf('{');
    const lastBrace = stripped.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(stripped.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('AI response was not valid JSON. Please try again.');
  }
}

function parsePlatforms(value) {
  let platforms = value;
  if (typeof platforms === 'string') {
    try { platforms = JSON.parse(platforms); } catch { platforms = platforms.split(','); }
  }
  const allowed = new Set(['instagram_facebook', 'youtube', 'linkedin']);
  const result = Array.isArray(platforms) ? platforms.filter((item) => allowed.has(item)) : [];
  if (!result.length) {
    const error = new Error('Choose at least one supported platform.');
    error.status = 400;
    throw error;
  }
  return result;
}

function serializeInputs(body) {
  const safe = (v, max = 6000) => String(v ?? '').trim().slice(0, max);
  const profile = typeof body.brandProfile === 'string'
    ? (() => { try { return JSON.parse(body.brandProfile); } catch { return {}; } })()
    : (body.brandProfile || {});
  return {
    platforms: parsePlatforms(body.platforms),
    niche: safe(body.niche, 300),
    tone: safe(body.tone, 100),
    language: safe(body.language, 100),
    audience: safe(body.audience, 500),
    context: safe(body.context, 6000),
    script: safe(body.script, 12000),
    brandProfile: {
      name: safe(profile.name, 200),
      fixedHashtags: safe(profile.fixedHashtags, 500),
      cta: safe(profile.cta, 500),
    },
  };
}

function buildUserText(inputs) {
  const platformNames = {
    instagram_facebook: 'Instagram / Facebook',
    youtube: 'YouTube',
    linkedin: 'LinkedIn',
  };
  return `PLATFORMS REQUESTED: ${inputs.platforms.map((p) => platformNames[p]).join(', ')}
NICHE: ${inputs.niche || 'Not specified'}
TONE: ${inputs.tone || 'Professional'}
LANGUAGE: ${inputs.language || 'English'}
AUDIENCE: ${inputs.audience || 'Not specified'}
BRAND NAME: ${inputs.brandProfile.name || 'Not specified'}
FIXED HASHTAGS: ${inputs.brandProfile.fixedHashtags || 'None supplied'}
CTA PREFERENCE: ${inputs.brandProfile.cta || 'Use a relevant CTA'}
CONTEXT: ${inputs.context || 'Not supplied'}
SCRIPT / TRANSCRIPT: ${inputs.script || 'Not supplied'}

Return valid JSON only. Include analysis plus output objects only for requested platforms.`;
}

async function callClaude({ content, maxTokens = 5000 }) {
  const client = getClient();
  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content }],
  });
  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock?.text) throw new Error('The AI provider returned an empty response. Please try again.');
  return textBlock.text;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: Boolean(process.env.ANTHROPIC_API_KEY), model });
});

app.post('/api/generate', upload.single('image'), async (req, res, next) => {
  try {
    const inputs = serializeInputs(req.body);
    const content = [];
    if (req.file) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: req.file.mimetype,
          data: req.file.buffer.toString('base64'),
        },
      });
    }
    content.push({ type: 'text', text: buildUserText(inputs) });
    const raw = await callClaude({ content });
    const result = parseJsonResponse(raw);
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error('AI response did not match the expected output format. Please try again.');
    }
    res.json({ result, model, inputs: { ...inputs, imageName: req.file?.originalname || '' } });
  } catch (error) {
    next(error);
  }
});

app.post('/api/regenerate-field', async (req, res, next) => {
  try {
    const { field, platformKey, currentValue, existingResult } = req.body || {};
    const inputs = req.body?.inputs || {};
    if (!field || !platformKey || !['instagram_facebook', 'youtube', 'linkedin'].includes(platformKey)) {
      return res.status(400).json({ error: 'A valid platform and field are required.' });
    }
    const request = `Regenerate exactly one field from this social media content project. Return ONLY the new value as valid JSON (a JSON string if the field is text; a JSON array if the field is an array). Do not return an object or markdown.

Platform key: ${platformKey}
Field: ${field}
Current value: ${JSON.stringify(currentValue)}
Creator inputs: ${JSON.stringify(inputs)}
Existing output for context: ${JSON.stringify(existingResult || {})}

Keep the requested language/tone and platform character limits. Avoid inventing facts. Produce a noticeably improved alternative while preserving the original meaning.`;
    const raw = await callClaude({ content: [{ type: 'text', text: request }], maxTokens: 1500 });
    const cleaned = String(raw).trim().replace(/^\x60\x60\x60(?:json)?\s*/i, '').replace(/\s*\x60\x60\x60$/, '').trim();
    let value;
    try { value = JSON.parse(cleaned); } catch { value = cleaned.replace(/^"|"$/g, ''); }
    res.json({ value });
  } catch (error) {
    next(error);
  }
});

// Serve the built Vite frontend from this same service in production.
const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use((err, _req, res, _next) => {
  console.error(err?.stack || err);
  if (err instanceof multer.MulterError) {
    return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
      error: err.code === 'LIMIT_FILE_SIZE' ? 'Image exceeds the 10 MB upload limit.' : err.message,
    });
  }
  const status = Number(err.status) || 500;
  const message = status >= 500 && !(err.message || '').includes('API key is not configured')
    ? 'Generation failed. Check your API key, model access, and server logs, then try again.'
    : (err.message || 'Something went wrong.');
  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`CaptionCraft API listening on http://localhost:${port}`);
  console.log(`Claude model: ${model}`);
});
