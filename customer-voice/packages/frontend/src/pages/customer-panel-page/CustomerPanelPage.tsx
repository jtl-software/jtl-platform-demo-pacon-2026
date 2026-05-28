import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Stack, Text, Badge, Separator } from '@jtl-software/platform-ui-react';
import { UserCircle } from 'lucide-react';
import { useAppBridge } from '../../common/AppBridgeContext';
import { getFeedbacks, type Feedback } from '../../common/api';

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
  return <span style={{ color: '#f59e0b' }}>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>;
}

const CustomerPanelPage: React.FC = () => {
  const appBridge = useAppBridge();
  const { id: urlId } = useParams<{ id: string }>();
  const [customerId, setCustomerId] = useState<string | undefined>(urlId);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appBridge) return;
    appBridge.method.call<string>('getSessionToken').then(setSessionToken).catch(console.error);

    const unsub = appBridge.event.subscribe('CustomerChanged', (data: unknown) => {
      return new Promise<void>((resolve) => {
        setCustomerId((data as { customerId: string }).customerId);
        resolve();
      });
    });

    appBridge.method.call<string>('getCurrentCustomerId').then(setCustomerId).catch(() => {});

    return () => { unsub(); };
  }, [appBridge]);

  useEffect(() => {
    if (!sessionToken || !customerId) return;
    setFeedbacks([]);
    setLoading(true);
    setError(null);
    getFeedbacks(sessionToken, { customer_id: customerId })
      .then(setFeedbacks)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [sessionToken, customerId]);

  return (
    <Box className="p-4">
      <Stack spacing="4" direction="column">
        <Stack spacing="2" direction="column" itemAlign="center">
          <UserCircle size={28} color="#1a56db" strokeWidth={1.5} />
          <Text type="h4" align="center">Customer Feedbacks</Text>
          {customerId ? (
            <Text type="xs" color="muted" align="center">
              Customer: <Text type="inline-code">{customerId}</Text>
            </Text>
          ) : (
            <Text type="xs" color="muted" align="center">Waiting for customer context…</Text>
          )}
        </Stack>

        <Separator />

        {loading && <Text type="small" color="muted" align="center">Loading…</Text>}
        {error && <Text type="small" color="danger">{error}</Text>}
        {!loading && !error && customerId && feedbacks.length === 0 && (
          <Text type="small" color="muted" align="center">No feedbacks from this customer.</Text>
        )}

        {feedbacks.map((fb) => (
          <Box key={fb.id} className="p-3 rounded-lg border border-[var(--base-border)]">
            <Stack spacing="2" direction="column">
              <Stack spacing="2" direction="row" itemAlign="center">
                <StarRating value={fb.rating} />
                <Badge variant={STATUS_VARIANT[fb.status]} label={STATUS_LABELS[fb.status]} />
              </Stack>
              {fb.comment && <Text type="small">{fb.comment}</Text>}
              <Text type="xs" color="muted">
                Article: <Text type="inline-code">{fb.article_id}</Text> ·{' '}
                {new Date(fb.created_at).toLocaleDateString('en-US')}
              </Text>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default CustomerPanelPage;
