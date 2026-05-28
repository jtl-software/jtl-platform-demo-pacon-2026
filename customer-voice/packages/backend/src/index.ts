import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { importJWK, jwtVerify } from 'jose';
import { db, getTenantIdByJtlId, type Feedback, type TenantConfig } from './db.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(packageRoot, '.env') });
const app = express();
const PORT = 3005;

const REQUIRED_ENV_VARS = ['CLIENT_ID', 'CLIENT_SECRET'] as const;

function getMissingCredentials(): string[] {
  return REQUIRED_ENV_VARS.filter((key) => !process.env[key] || process.env[key]?.trim() === '');
}

function printMissingCredentialsBanner(missing: string[]): void {
  const red = '\x1b[31m';
  const yellow = '\x1b[33m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';
  const line = '━'.repeat(72);
  const envPath = path.relative(process.cwd(), path.join(packageRoot, '.env'));
  console.warn(`\n${red}${bold}${line}${reset}`);
  console.warn(`${red}${bold}  ⚠  Missing credentials: ${missing.join(', ')}${reset}`);
  console.warn(`${yellow}  The backend will start, but every JTL API call will fail until you${reset}`);
  console.warn(`${yellow}  add the variables below to ${bold}${envPath}${reset}${yellow} (see ${envPath}.example):${reset}`);
  console.warn('');
  for (const key of missing) {
    console.warn(`${yellow}      ${key}=<paste from Partner Portal>${reset}`);
  }
  console.warn('');
  console.warn(`${yellow}  Get values: https://partner.jtl-cloud.com/ → your app → Client credentials${reset}`);
  console.warn(`${red}${bold}${line}${reset}\n`);
}

const missingCredentials = getMissingCredentials();
if (missingCredentials.length > 0) {
  printMissingCredentialsBanner(missingCredentials);
}

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  const missing = getMissingCredentials();
  res.json({
    status: missing.length === 0 ? 'ok' : 'misconfigured',
    missing,
  });
});

// ─── Tenant ID resolution ────────────────────────────────────────────────────

async function resolveTenantId(req: Request): Promise<string | null> {
  const sessionToken = req.headers['x-session-token'] as string | undefined;
  if (sessionToken) {
    try {
      const payload = await verifySessionTokenAndExtractPayload(sessionToken);
      return getTenantIdByJtlId(payload.tenantId) ?? `cv-${payload.tenantId}`;
    } catch {
      // fall through to demo header
    }
  }
  const demoTenantId = req.headers['x-tenant-id'] as string | undefined;
  return demoTenantId ?? null;
}

// ─── Feedback routes ─────────────────────────────────────────────────────────

app.post('/feedbacks', (req: Request, res: Response): void => {
  const { tenant_id, customer_id = 'anonymous', article_id, rating, comment } = req.body as Record<string, string>;
  if (!tenant_id || !article_id || !rating) {
    res.status(400).json({ error: 'tenant_id, article_id and rating are required' });
    return;
  }
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    return;
  }
  const result = db
    .prepare('INSERT INTO feedbacks (tenant_id, customer_id, article_id, rating, comment) VALUES (?, ?, ?, ?, ?)')
    .run(tenant_id, customer_id, article_id, ratingNum, comment ?? null);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.get('/feedbacks', async (req: Request, res: Response): Promise<void> => {
  const tenantId = await resolveTenantId(req);
  if (!tenantId) {
    res.status(401).json({ error: 'Missing tenant ID or session token' });
    return;
  }
  const { article_id, customer_id } = req.query as Record<string, string>;

  let query = 'SELECT * FROM feedbacks WHERE tenant_id = ?';
  const params: unknown[] = [tenantId];

  if (article_id) {
    query += ' AND article_id = ?';
    params.push(article_id);
  }
  if (customer_id) {
    query += ' AND customer_id = ?';
    params.push(customer_id);
  }
  query += ' ORDER BY created_at DESC';

  const feedbacks = db.prepare(query).all(...params) as Feedback[];
  res.json(feedbacks);
});

app.patch('/feedbacks/:id', async (req: Request, res: Response): Promise<void> => {
  const tenantId = await resolveTenantId(req);
  if (!tenantId) {
    res.status(401).json({ error: 'Missing tenant ID or session token' });
    return;
  }
  const { status } = req.body as { status: string };
  const validStatuses = ['open', 'in-progress', 'solved'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'status must be open, in-progress or solved' });
    return;
  }
  const result = db
    .prepare('UPDATE feedbacks SET status = ? WHERE id = ? AND tenant_id = ?')
    .run(status, req.params.id, tenantId);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Feedback not found' });
    return;
  }
  res.json({ success: true });
});

// ─── Tenant routes ───────────────────────────────────────────────────────────

app.post('/tenants/link', async (req: Request, res: Response): Promise<void> => {
  const { sessionToken } = req.body as { sessionToken: string };
  if (!sessionToken) {
    res.status(400).json({ error: 'sessionToken is required' });
    return;
  }
  try {
    const payload = await verifySessionTokenAndExtractPayload(sessionToken);
    const tenantId = `cv-${payload.tenantId}`;
    db.prepare(
      `INSERT INTO tenant_mapping (tenant_id, jtl_tenant_id)
       VALUES (?, ?)
       ON CONFLICT(jtl_tenant_id) DO UPDATE SET tenant_id = excluded.tenant_id`,
    ).run(tenantId, payload.tenantId);
    res.json({ tenantId, jtlTenantId: payload.tenantId });
  } catch (err) {
    res.status(401).json({ error: 'Invalid session token', message: String(err) });
  }
});

// Keep legacy endpoint so existing setup pages keep working
app.post('/connect-tenant', async (req: Request, res: Response): Promise<void> => {
  const { sessionToken } = req.body as { sessionToken: string };
  const payload = await verifySessionTokenAndExtractPayload(sessionToken);
  const tenantId = `cv-${payload.tenantId}`;
  db.prepare(
    `INSERT INTO tenant_mapping (tenant_id, jtl_tenant_id)
     VALUES (?, ?)
     ON CONFLICT(jtl_tenant_id) DO UPDATE SET tenant_id = excluded.tenant_id`,
  ).run(tenantId, payload.tenantId);
  res.json({ tenantId, jtlTenantId: payload.tenantId });
});

// ─── Tenant config routes ────────────────────────────────────────────────────

app.get('/tenants/config', async (req: Request, res: Response): Promise<void> => {
  const tenantId = await resolveTenantId(req);
  if (!tenantId) {
    res.status(401).json({ error: 'Missing tenant ID or session token' });
    return;
  }
  const config = db.prepare('SELECT * FROM tenant_config WHERE tenant_id = ?').get(tenantId) as TenantConfig | undefined;
  res.json(config ?? { tenant_id: tenantId, shop_name: '', contact_email: '', greeting_text: '' });
});

app.put('/tenants/config', async (req: Request, res: Response): Promise<void> => {
  const tenantId = await resolveTenantId(req);
  if (!tenantId) {
    res.status(401).json({ error: 'Missing tenant ID or session token' });
    return;
  }
  const { shop_name = '', contact_email = '', greeting_text = '' } = req.body as Record<string, string>;
  db.prepare(
    `INSERT INTO tenant_config (tenant_id, shop_name, contact_email, greeting_text)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(tenant_id) DO UPDATE SET
       shop_name = excluded.shop_name,
       contact_email = excluded.contact_email,
       greeting_text = excluded.greeting_text`,
  ).run(tenantId, shop_name, contact_email, greeting_text);
  res.json({ success: true });
});

// Public endpoint for widget (no auth needed)
app.get('/widget/config', (req: Request, res: Response): void => {
  const tenantId = req.query.tenant as string | undefined;
  if (!tenantId) {
    res.status(400).json({ error: 'tenant query param is required' });
    return;
  }
  const config = db.prepare('SELECT greeting_text FROM tenant_config WHERE tenant_id = ?').get(tenantId) as
    | Pick<TenantConfig, 'greeting_text'>
    | undefined;
  res.json({ greeting_text: config?.greeting_text ?? '' });
});

// ─── JTL API proxy routes ────────────────────────────────────────────────────

app.post('/graphql', async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionToken = req.headers['x-session-token'] as string;
    if (!sessionToken) {
      res.status(401).json({ error: 'Missing X-Session-Token header' });
      return;
    }
    const payload = await verifySessionTokenAndExtractPayload(sessionToken);
    const jwt = await getJwt();
    const graphqlResponse = await fetch(`https://api.jtl-cloud.com/erp/v2/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
        'X-Tenant-ID': payload.tenantId,
      },
      body: JSON.stringify(req.body),
    });
    const responseBody = await graphqlResponse.text();
    res.status(graphqlResponse.status).type('application/json').send(responseBody);
  } catch (error) {
    res.status(500).json({ error: 'Failed to proxy GraphQL request', message: error instanceof Error ? error.message : String(error) });
  }
});

app.all('/erp-info/:tenantId/:endpoint', async (req: Request, res: Response): Promise<void> => {
  try {
    const urlTenantId = req.params.tenantId;
    const urlEndpoint = req.params.endpoint;
    const method = req.method;
    let tenantId = urlTenantId;
    let endpoint = urlEndpoint;
    let bodyToSend = req.body;

    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
      if (req.body._tenantId) tenantId = req.body._tenantId;
      if (req.body._endpoint) endpoint = req.body._endpoint;
      const { _tenantId, _endpoint, ...cleanedBody } = req.body;
      void _tenantId; void _endpoint;
      bodyToSend = cleanedBody;
    }

    const jwt = await getJwt();
    const options: RequestInit = {
      method,
      headers: { 'X-Tenant-ID': String(tenantId), Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    };
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(bodyToSend);
    }
    const erpInfoResponse = await fetch(`https://api.jtl-cloud.com/erp/${endpoint}`, options);
    if (erpInfoResponse.ok) {
      const data = await erpInfoResponse.json();
      res.json(data);
    } else {
      const errorText = await erpInfoResponse.text();
      res.status(erpInfoResponse.status).send(errorText);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ERP info', message: error instanceof Error ? error.message : String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ─── JWT helpers ─────────────────────────────────────────────────────────────

type SessionTokenPayload = { userId: string; tenantId: string };

const wellKnownEndpoint = `https://api.jtl-cloud.com/account/.well-known/jwks.json`;

async function verifySessionTokenAndExtractPayload(sessionToken: string): Promise<SessionTokenPayload> {
  const jwt = await getJwt();
  const response = await fetch(wellKnownEndpoint, { headers: { Authorization: `Bearer ${jwt}` } });
  const jwks = await response.json();
  const key = jwks.keys[0];
  const publicKey = await importJWK(key, 'EdDSA');
  try {
    const { payload } = await jwtVerify(sessionToken, publicKey);
    return payload as unknown as SessionTokenPayload;
  } catch (err) {
    throw new Error(`Invalid session token: ${err}`);
  }
}

const getAuthEndpoint = () => `https://auth.jtl-cloud.com/oauth2/token`;

export async function getJwt(): Promise<string> {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('CLIENT_ID and CLIENT_SECRET must be defined in .env file');
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(getAuthEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${authString}` },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });
  const data = await response.json();
  if (response.ok) return data.access_token;
  throw new Error(`Failed to fetch JWT (${response.status}): ${data.error}`);
}
