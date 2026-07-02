import cors from 'cors';
import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import XLSX from 'xlsx';
import { authenticateWithAd } from './ldap-auth.js';
import { config, getSafeConfigSummary, validateConfig } from './config.js';
import { fetchLinksXmlByFaturas } from './sql-server.js';
import { generateXmlBundleZip } from './xml-bundle.js';

validateConfig();

process.on('uncaughtException', (error) => {
  console.error('[uncaughtException]', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origem não permitida pelo CORS.'));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(
  session({
    name: 'hub.uniodonto.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

const issueJwt = (user) => {
  return jwt.sign(
    {
      sub: user.username,
      username: user.username,
      preferred_username: user.username,
      name: user.displayName,
      displayName: user.displayName,
      email: user.email,
      groups: user.groups,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  );
};

const buildAuthResponse = (req, user) => {
  if (config.authMode === 'session') {
    req.session.user = user;

    return {
      token: req.sessionID,
      user,
      authMode: 'session',
    };
  }

  return {
    token: issueJwt(user),
    user,
    authMode: 'jwt',
  };
};

const tryAuthenticateWithTestUser = ({ username, password }) => {
  if (!config.testAuth.enabled) {
    return null;
  }

  const expectedUsername = config.testAuth.username;
  const expectedPassword = config.testAuth.password;

  if (!expectedUsername || !expectedPassword) {
    return null;
  }

  if (username?.trim() !== expectedUsername || password !== expectedPassword) {
    return null;
  }

  return {
    username: expectedUsername,
    displayName: config.testAuth.displayName,
    email: config.testAuth.email,
    groups: ['LOGIN_TESTE_LOCAL'],
  };
};

const readCurrentUser = (req) => {
  if (config.authMode === 'session') {
    return req.session.user || null;
  }

  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, config.jwtSecret);

    return {
      username: payload.username,
      displayName: payload.displayName || payload.name,
      email: payload.email,
      groups: Array.isArray(payload.groups) ? payload.groups : [],
    };
  } catch {
    return null;
  }
};

const requireAuth = (req, res, next) => {
  const user = readCurrentUser(req);

  if (!user) {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    return;
  }

  req.user = user;
  next();
};

const normalizeHeader = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const parseFaturasFromWorkbook = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('A planilha não possui abas para leitura.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: null,
    raw: false,
  });

  if (!rows.length) {
    throw new Error('A planilha enviada está vazia.');
  }

  const firstRow = rows[0];
  const faturaColumn = Object.keys(firstRow).find((key) => normalizeHeader(key) === 'fatura');

  if (!faturaColumn) {
    throw new Error('A coluna "fatura" não foi encontrada na planilha.');
  }

  const parsed = rows
    .map((row) => row[faturaColumn])
    .map((value) => String(value ?? '').replace(/\D/g, ''))
    .filter(Boolean)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value > 0);

  return [...new Set(parsed)];
};

const splitInChunks = (items, chunkSize) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
};

const resolveLinksFromUploadedWorkbook = async (fileBuffer) => {
  const faturas = parseFaturasFromWorkbook(fileBuffer);

  if (!faturas.length) {
    throw new Error('Não foi possível extrair valores válidos da coluna fatura.');
  }

  const chunkedFaturas = splitInChunks(faturas, 2000);
  const resultados = [];

  for (const chunk of chunkedFaturas) {
    const chunkResult = await fetchLinksXmlByFaturas(chunk);
    resultados.push(...chunkResult);
  }

  const links = resultados
    .map((item) => (typeof item.link === 'string' ? item.link.trim() : ''))
    .filter(Boolean);

  return { faturas, resultados, links };
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', authMode: config.authMode });
});

app.get('/api/health/config', (_req, res) => {
  res.json(getSafeConfigSummary());
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body ?? {};

  const testUser = tryAuthenticateWithTestUser({ username, password });

  if (testUser) {
    res.json(buildAuthResponse(req, testUser));
    return;
  }

  try {
    const user = await authenticateWithAd({ username, password });
    res.json(buildAuthResponse(req, user));
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Não foi possível autenticar com o Active Directory.',
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = readCurrentUser(req);

  if (!user) {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    return;
  }

  res.json({ user, authMode: config.authMode });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('hub.uniodonto.sid');
    res.status(204).end();
  });
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`AD auth API rodando na porta ${config.port}`);
  console.log(`Modo de autenticação: ${config.authMode}`);
});

app.post('/api/financeiro/faturas-links-xlsx', requireAuth, upload.single('arquivo'), async (req, res) => {
  if (!req.file?.buffer) {
    res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    return;
  }

  try {
    const { resultados } = await resolveLinksFromUploadedWorkbook(req.file.buffer);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(resultados, {
      header: ['resultado'],
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'resultado');

    const output = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="links_xml_${timestamp}.xlsx"`);
    res.send(output);
  } catch (error) {
    console.error('[faturas-links-xlsx]', error);
    const message = error instanceof Error ? error.message : 'Falha ao processar planilha.';
    const statusCode = /coluna "fatura"|planilha|extrair|limite/i.test(message) ? 400 : 500;

    res.status(statusCode).json({ error: message });
  }
});

app.post('/api/financeiro/faturas-links-json', requireAuth, upload.single('arquivo'), async (req, res) => {
  if (!req.file?.buffer) {
    res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    return;
  }

  try {
    const { links, faturas } = await resolveLinksFromUploadedWorkbook(req.file.buffer);
    res.json({
      totalFaturas: faturas.length,
      totalLinks: links.length,
      links,
    });
  } catch (error) {
    console.error('[faturas-links-json]', error);
    const message = error instanceof Error ? error.message : 'Falha ao processar planilha.';
    const statusCode = /coluna "fatura"|planilha|extrair|limite/i.test(message) ? 400 : 500;

    res.status(statusCode).json({ error: message });
  }
});

app.post('/api/financeiro/faturas-xml-zip', requireAuth, upload.single('arquivo'), async (req, res) => {
  if (!req.file?.buffer) {
    res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    return;
  }

  try {
    const { resultados, links } = await resolveLinksFromUploadedWorkbook(req.file.buffer);

    if (!links.length) {
      res.status(400).json({ error: 'Nenhum link XML foi encontrado para as faturas enviadas.' });
      return;
    }

    const { zipBuffer, stats } = await generateXmlBundleZip({ resultados, links });
    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('');

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('X-Total-Links', String(stats.totalLinks));
    res.setHeader('X-Successful-Downloads', String(stats.successful));
    res.setHeader('X-Failed-Downloads', String(stats.failed));
    res.setHeader('Content-Disposition', `attachment; filename="xml_notas_${timestamp}.zip"`);
    res.send(zipBuffer);
  } catch (error) {
    console.error('[faturas-xml-zip]', error);
    const message = error instanceof Error ? error.message : 'Falha ao gerar pacote XML.';
    const statusCode = /coluna "fatura"|planilha|extrair|limite|nenhum link/i.test(message) ? 400 : 500;

    res.status(statusCode).json({ error: message });
  }
});