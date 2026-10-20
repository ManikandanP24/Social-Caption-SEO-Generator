import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3001);
const clientDist = path.resolve(__dirname, '../client/dist');

app.disable('x-powered-by');
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiProvider: 'browser-local', requiresApiKey: false });
});
app.use(express.static(clientDist, { maxAge: '1h', index: false }));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found. AI generation runs locally in the browser.' });
  }
  res.sendFile(path.join(clientDist, 'index.html'), (error) => {
    if (error) next(error);
  });
});
app.use((err, _req, res, _next) => {
  console.error(err?.stack || err);
  res.status(500).send('Something went wrong while serving CaptionCraft AI.');
});
app.listen(port, () => {
  console.log(`CaptionCraft AI is running on port ${port}`);
  console.log('AI inference runs in the browser; no provider API key is required.');
});
