import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Text,
  Badge,
  Button,
  Separator,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@jtl-software/platform-ui-react';
import { BarChart3, Star, Clock, CheckCircle2 } from 'lucide-react';
import { useAppBridge } from '../../common/AppBridgeContext';
import { getFeedbacks, updateFeedbackStatus, type Feedback } from '../../common/api';

const STATUS_LABELS: Record<Feedback['status'], string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  solved: 'Solved',
};

const STATUS_VARIANT: Record<Feedback['status'], 'default' | 'outline' | 'success'> = {
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

const DashboardPage: React.FC = () => {
  const appBridge = useAppBridge();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (appBridge) {
      appBridge.method.call<string>('getSessionToken').then(setSessionToken).catch(console.error);
    }
  }, [appBridge]);

  useEffect(() => {
    if (!sessionToken) return;
    setLoading(true);
    getFeedbacks(sessionToken)
      .then(setFeedbacks)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [sessionToken]);

  const stats = useMemo(() => {
    const open = feedbacks.filter((f) => f.status === 'open').length;
    const inProgress = feedbacks.filter((f) => f.status === 'in-progress').length;
    const solved = feedbacks.filter((f) => f.status === 'solved').length;
    const avg = feedbacks.length
      ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
      : '–';
    return { open, inProgress, solved, avg };
  }, [feedbacks]);

  const handleStatusChange = async (id: number, status: Feedback['status']) => {
    if (!sessionToken) return;
    setUpdatingId(id);
    try {
      await updateFeedbackStatus(sessionToken, id, status);
      setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    } catch (e) {
      setError(String(e));
    } finally {
      setUpdatingId(null);
    }
  };

  if (!appBridge) {
    return (
      <Box className="flex justify-center p-12">
        <Card className="max-w-[480px] w-full">
          <CardHeader className="items-center">
            <BarChart3 size={40} color="#1a56db" strokeWidth={1.5} />
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Text type="small" color="muted" align="center">
              This page is embedded as an ERP menu item. Open it from the JTL Cloud ERP.
            </Text>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="p-6">
      <Stack spacing="6" direction="column">
        <Stack spacing="2" direction="column">
          <Text type="h4">Feedback Dashboard</Text>
          <Text type="small" color="muted">Overview of all customer feedbacks</Text>
        </Stack>

        {/* KPI row */}
        <Stack spacing="3" direction="row">
          <KpiCard icon={Clock} label="Open" value={stats.open} color="#f59e0b" />
          <KpiCard icon={BarChart3} label="In Progress" value={stats.inProgress} color="#1a56db" />
          <KpiCard icon={CheckCircle2} label="Solved" value={stats.solved} color="#10b981" />
          <KpiCard icon={Star} label="Avg. Rating" value={stats.avg} color="#f59e0b" />
        </Stack>

        <Separator />

        {loading && <Text type="small" color="muted">Loading feedbacks…</Text>}
        {error && <Text type="small" color="danger">{error}</Text>}

        {!loading && !error && feedbacks.length === 0 && (
          <Text type="small" color="muted">No feedbacks yet.</Text>
        )}

        {!loading && feedbacks.length > 0 && (
          <Box className="w-full overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  {['Date', 'Article', 'Customer', 'Rating', 'Comment', 'Status', 'Action'].map((col) => (
                    <th
                      key={col}
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderBottom: '1px solid var(--base-border)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((fb) => (
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
                          <Button
                            variant="outline"
                            label="In Progress"
                            disabled={updatingId === fb.id}
                            onClick={() => handleStatusChange(fb.id, 'in-progress')}
                          />
                        )}
                        {fb.status !== 'solved' && (
                          <Button
                            variant="outline"
                            label="Resolve"
                            disabled={updatingId === fb.id}
                            onClick={() => handleStatusChange(fb.id, 'solved')}
                          />
                        )}
                        {fb.status === 'solved' && (
                          <Button
                            variant="outline"
                            label="Reopen"
                            disabled={updatingId === fb.id}
                            onClick={() => handleStatusChange(fb.id, 'open')}
                          />
                        )}
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default DashboardPage;
