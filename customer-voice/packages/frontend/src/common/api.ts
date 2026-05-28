import { apiUrl } from './constants';

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

function authHeaders(sessionToken: string): Record<string, string> {
  return { 'Content-Type': 'application/json', 'X-Session-Token': sessionToken };
}

export async function getFeedbacks(
  sessionToken: string,
  filter?: { article_id?: string; customer_id?: string },
): Promise<Feedback[]> {
  const params = new URLSearchParams();
  if (filter?.article_id) params.set('article_id', filter.article_id);
  if (filter?.customer_id) params.set('customer_id', filter.customer_id);
  const res = await fetch(`${apiUrl}/feedbacks?${params}`, { headers: authHeaders(sessionToken) });
  if (!res.ok) throw new Error(`GET /feedbacks failed: ${res.status}`);
  return res.json() as Promise<Feedback[]>;
}

export async function updateFeedbackStatus(sessionToken: string, id: number, status: Feedback['status']): Promise<void> {
  const res = await fetch(`${apiUrl}/feedbacks/${id}`, {
    method: 'PATCH',
    headers: authHeaders(sessionToken),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`PATCH /feedbacks/${id} failed: ${res.status}`);
}

export async function submitFeedback(data: {
  tenant_id: string;
  article_id: string;
  rating: number;
  comment?: string;
  customer_id?: string;
}): Promise<{ id: number }> {
  const res = await fetch(`${apiUrl}/feedbacks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST /feedbacks failed: ${res.status}`);
  return res.json() as Promise<{ id: number }>;
}

export async function getTenantConfig(sessionToken: string): Promise<TenantConfig> {
  const res = await fetch(`${apiUrl}/tenants/config`, { headers: authHeaders(sessionToken) });
  if (!res.ok) throw new Error(`GET /tenants/config failed: ${res.status}`);
  return res.json() as Promise<TenantConfig>;
}

export async function saveTenantConfig(sessionToken: string, config: Omit<TenantConfig, 'tenant_id'>): Promise<void> {
  const res = await fetch(`${apiUrl}/tenants/config`, {
    method: 'PUT',
    headers: authHeaders(sessionToken),
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(`PUT /tenants/config failed: ${res.status}`);
}

export async function getWidgetConfig(tenantId: string): Promise<{ greeting_text: string }> {
  const res = await fetch(`${apiUrl}/widget/config?tenant=${encodeURIComponent(tenantId)}`);
  if (!res.ok) throw new Error(`GET /widget/config failed: ${res.status}`);
  return res.json() as Promise<{ greeting_text: string }>;
}

export async function linkTenant(sessionToken: string): Promise<{ tenantId: string; jtlTenantId: string }> {
  const res = await fetch(`${apiUrl}/tenants/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken }),
  });
  if (!res.ok) throw new Error(`POST /tenants/link failed: ${res.status}`);
  return res.json() as Promise<{ tenantId: string; jtlTenantId: string }>;
}
