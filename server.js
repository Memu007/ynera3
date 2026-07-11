const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.set('trust proxy', true);

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.set('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; connect-src 'self'");
  next();
});

app.use(express.static(__dirname, {
  index: false,
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.html') {
      res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  const host = String(req.get('host') || '').replace(/[^a-zA-Z0-9.:-]/g, '');
  const origin = `${req.protocol}://${host || 'localhost'}`;
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
    .replace(/__PUBLIC_ORIGIN__/g, origin);
  res.type('html').send(html);
});

app.listen(PORT, () => {
  console.log(`Ynera corriendo en puerto ${PORT}`);
});
