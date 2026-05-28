import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Text,
  Stack,
  Separator,
  Box,
  Link,
  Badge,
  Button,
} from '@jtl-software/platform-ui-react';
import { Rocket, ExternalLink, MonitorSmartphone, BarChart3, Star, Clock, CheckCircle2 } from 'lucide-react';

const manifestMapping = [{ field: 'capabilities.hub.appLauncher.redirectUrl', description: 'Opens this page in a new browser tab' }];

// ---- dummy standalone mode ----

const isDummyStandalone = new URLSearchParams(window.location.search).get('dummy-standalone') === 'true';

type FeedbackStatus = 'open' | 'in-progress' | 'solved';

type DummyFeedback = {
  id: number;
  article_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  status: FeedbackStatus;
  created_at: string;
};

const INITIAL_FEEDBACKS: DummyFeedback[] = [
  { id: 1, article_id: 'ART-001', customer_id: 'CUST-0421', rating: 5, comment: 'Absolutely love this product!', status: 'solved', created_at: '2026-05-20T10:23:00Z' },
  { id: 2, article_id: 'ART-003', customer_id: 'CUST-0117', rating: 2, comment: 'Delivery took way too long.', status: 'in-progress', created_at: '2026-05-22T08:45:00Z' },
  { id: 3, article_id: 'ART-007', customer_id: 'CUST-0088', rating: 4, comment: 'Good quality, minor packaging issue.', status: 'open', created_at: '2026-05-23T14:10:00Z' },
  { id: 4, article_id: 'ART-002', customer_id: 'CUST-0305', rating: 1, comment: 'Item arrived damaged.', status: 'open', created_at: '2026-05-24T09:30:00Z' },
  { id: 5, article_id: 'ART-011', customer_id: 'CUST-0512', rating: 3, comment: null, status: 'open', created_at: '2026-05-25T16:55:00Z' },
  { id: 6, article_id: 'ART-005', customer_id: 'CUST-0249', rating: 5, comment: 'Perfect, exactly as described!', status: 'solved', created_at: '2026-05-26T11:20:00Z' },
  { id: 7, article_id: 'ART-009', customer_id: 'CUST-0073', rating: 2, comment: 'Missing accessories in the box.', status: 'in-progress', created_at: '2026-05-27T13:00:00Z' },
];

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  solved: 'Solved',
};

const STATUS_VARIANT: Record<FeedbackStatus, 'default' | 'outline' | 'success'> = {
  open: 'outline',
  'in-progress': 'default',
  solved: 'success',
};

function StarRating({ value }: { value: number }) {
  return (
    <span style={{ color: '#f59e0b', letterSpacing: 1 }}>
      {'★'.repeat(value)}{'☆'.repeat(5 - value)}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <Card className="flex-1 min-w-[140px]">
      <CardContent className="pt-4">
        <Stack spacing="2" direction="column" itemAlign="center">
          <Icon size={24} color={color} strokeWidth={1.5} />
          <Text type="h4" align="center">{String(value)}</Text>
          <Text type="xs" color="muted" align="center">{label}</Text>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DummyDashboard() {
  const [feedbacks, setFeedbacks] = useState<DummyFeedback[]>(INITIAL_FEEDBACKS);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const open = feedbacks.filter(f => f.status === 'open').length;
  const inProgress = feedbacks.filter(f => f.status === 'in-progress').length;
  const solved = feedbacks.filter(f => f.status === 'solved').length;
  const avg = (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1);

  const handleStatusChange = (id: number, status: FeedbackStatus) => {
    setUpdatingId(id);
    setTimeout(() => {
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
      setUpdatingId(null);
    }, 300);
  };

  return (
    <Box className="p-6">
      <Stack spacing="6" direction="column">
        <Stack spacing="2" direction="column">
          <Text type="h4">Feedback Dashboard</Text>
          <Text type="small" color="muted">Overview of all customer feedbacks</Text>
        </Stack>

        <Stack spacing="3" direction="row">
          <KpiCard icon={Clock} label="Open" value={open} color="#f59e0b" />
          <KpiCard icon={BarChart3} label="In Progress" value={inProgress} color="#1a56db" />
          <KpiCard icon={CheckCircle2} label="Solved" value={solved} color="#10b981" />
          <KpiCard icon={Star} label="Avg. Rating" value={avg} color="#f59e0b" />
        </Stack>

        <Separator />

        <Box className="w-full overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr>
                {['Date', 'Article', 'Customer', 'Rating', 'Comment', 'Status', 'Action'].map(col => (
                  <th key={col} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--base-border)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feedbacks.map(fb => (
                <tr key={fb.id}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--base-border)', whiteSpace: 'nowrap' }}>
                    {new Date(fb.created_at).toLocaleDateString('en-US')}
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--base-border)' }}>
                    <Text type="inline-code">{fb.article_id}</Text>
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--base-border)' }}>
                    <Text type="inline-code">{fb.customer_id}</Text>
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--base-border)', whiteSpace: 'nowrap' }}>
                    <StarRating value={fb.rating} />
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--base-border)', maxWidth: 200 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fb.comment ?? <em style={{ color: 'var(--base-muted-foreground)' }}>–</em>}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--base-border)', whiteSpace: 'nowrap' }}>
                    <Badge variant={STATUS_VARIANT[fb.status]} label={STATUS_LABELS[fb.status]} />
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--base-border)', whiteSpace: 'nowrap' }}>
                    <Stack spacing="2" direction="row">
                      {fb.status !== 'in-progress' && fb.status !== 'solved' && (
                        <Button variant="outline" label="In Progress" disabled={updatingId === fb.id} onClick={() => handleStatusChange(fb.id, 'in-progress')} />
                      )}
                      {fb.status !== 'solved' && (
                        <Button variant="outline" label="Resolve" disabled={updatingId === fb.id} onClick={() => handleStatusChange(fb.id, 'solved')} />
                      )}
                      {fb.status === 'solved' && (
                        <Button variant="outline" label="Reopen" disabled={updatingId === fb.id} onClick={() => handleStatusChange(fb.id, 'open')} />
                      )}
                    </Stack>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Stack>
    </Box>
  );
}

function DummySettings() {
  return (
    <Box className="p-6 max-w-[640px]">
      <Stack spacing="6" direction="column">
        <Stack spacing="2" direction="column">
          <Text type="h4">Settings</Text>
          <Text type="small" color="muted">Manage your CustomerVoice account and preferences</Text>
        </Stack>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="4" direction="column">
              <Stack spacing="1" direction="column">
                <Text type="xs" weight="semibold" color="muted">TENANT</Text>
                <Text type="small">My Demo Tenant</Text>
              </Stack>
              <Stack spacing="1" direction="column">
                <Text type="xs" weight="semibold" color="muted">PLAN</Text>
                <Badge variant="success" label="Professional" />
              </Stack>
              <Stack spacing="1" direction="column">
                <Text type="xs" weight="semibold" color="muted">EMAIL</Text>
                <Text type="small" color="muted">admin@my-demo-tenant.com</Text>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="3" direction="column">
              <Text type="small" color="muted">Email notifications for new feedbacks are enabled.</Text>
              <Button variant="outline" label="Configure Notifications" />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="3" direction="column">
              <Stack spacing="1" direction="column">
                <Text type="xs" weight="semibold" color="muted">API KEY</Text>
                <Text type="inline-code">cv_live_••••••••••••••••</Text>
              </Stack>
              <Button variant="outline" label="Regenerate Key" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

type StandaloneTab = 'dashboard' | 'settings';

function StandaloneApp() {
  const [activeTab, setActiveTab] = useState<StandaloneTab>('dashboard');

  return (
    <Box className="min-h-screen flex flex-col">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid var(--base-border)',
          backgroundColor: 'var(--base-background)',
        }}
      >
        <Text type="h4">CustomerVoice</Text>

        <Stack spacing="1" direction="row">
          {(['dashboard', 'settings'] as StandaloneTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab ? 600 : 400,
                background: activeTab === tab ? 'var(--base-accent)' : 'transparent',
                color: activeTab === tab ? 'var(--base-accent-foreground)' : 'var(--base-muted-foreground)',
              }}
            >
              {tab === 'dashboard' ? 'Dashboard' : 'Settings'}
            </button>
          ))}
        </Stack>

        <Text type="xs" color="muted">My Demo Tenant</Text>
      </div>

      {activeTab === 'dashboard' ? <DummyDashboard /> : <DummySettings />}
    </Box>
  );
}

// ---- main page ----

const HubPage: React.FC = () => {
  if (isDummyStandalone) {
    return <StandaloneApp />;
  }

  return (
    <Box className="flex justify-center p-12">
      <Card className="max-w-[520px] w-full">
        <CardHeader className="items-center">
          <Rocket size={40} color="#1a56db" strokeWidth={1.5} />
          <CardTitle>Launched from Hub</CardTitle>
          <CardDescription className="text-center">
            This page opens when a user clicks your app card in the JTL-Cloud Hub. It runs in a full browser tab, not inside the ERP iframe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stack spacing="5" direction="column">
            <Stack spacing="3" direction="column">
              <Text type="xs" weight="semibold" color="muted">
                MANIFEST MAPPING
              </Text>
              {manifestMapping.map(mapping => (
                <Stack key={mapping.field} spacing="3" direction="row" itemAlign="start">
                  <ExternalLink size={16} color="#1a56db" className="shrink-0 mt-0.5" />
                  <Stack spacing="0" direction="column">
                    <Text type="inline-code">{mapping.field}</Text>
                    <Text type="xs" color="muted">
                      → {mapping.description}
                    </Text>
                  </Stack>
                </Stack>
              ))}
            </Stack>

            <Separator />

            <Stack spacing="3" direction="column">
              <Text type="xs" weight="semibold" color="muted">
                HOW THIS DIFFERS
              </Text>
              <Stack spacing="3" direction="row" itemAlign="start">
                <MonitorSmartphone size={16} color="#1a56db" className="shrink-0 mt-0.5" />
                <Text type="small" color="muted">
                  Unlike <Text type="inline-code">/erp</Text> and <Text type="inline-code">/pane</Text>, this page runs outside the ERP — there is no
                  AppBridge available. Use this for standalone features like dashboards, settings, or onboarding flows.
                </Text>
              </Stack>
            </Stack>

            <Separator />

            <Stack spacing="3" direction="column">
              <Text type="xs" weight="semibold" color="muted">
                NEXT STEPS
              </Text>
              <Text type="small" color="muted">
                Replace this page with your app's main standalone experience — a dashboard, configuration panel, or landing page.
              </Text>
              <Link url="https://hub.jtl-cloud.com/" target="_blank">
                Open JTL-Cloud Hub
              </Link>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HubPage;
