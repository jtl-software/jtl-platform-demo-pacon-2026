import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const db = new Database(path.join(packageRoot, 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS feedbacks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id   TEXT    NOT NULL,
    customer_id TEXT    NOT NULL DEFAULT '',
    article_id  TEXT    NOT NULL DEFAULT '',
    rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment     TEXT,
    status      TEXT    NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in-progress', 'solved')),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tenant_mapping (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id     TEXT NOT NULL UNIQUE,
    jtl_tenant_id TEXT NOT NULL UNIQUE,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tenant_config (
    tenant_id     TEXT PRIMARY KEY,
    shop_name     TEXT NOT NULL DEFAULT '',
    contact_email TEXT NOT NULL DEFAULT '',
    greeting_text TEXT NOT NULL DEFAULT ''
  );
`);

export interface Feedback {
  id: number;
  tenant_id: string;
  customer_id: string;
  article_id: string;
  rating: number;
  comment: string | null;
  status: 'open' | 'in-progress' | 'solved';
  created_at: string;
}

export interface TenantConfig {
  tenant_id: string;
  shop_name: string;
  contact_email: string;
  greeting_text: string;
}

export function getTenantIdByJtlId(jtlTenantId: string): string | undefined {
  const row = db.prepare('SELECT tenant_id FROM tenant_mapping WHERE jtl_tenant_id = ?').get(jtlTenantId) as
    | { tenant_id: string }
    | undefined;
  return row?.tenant_id;
}
