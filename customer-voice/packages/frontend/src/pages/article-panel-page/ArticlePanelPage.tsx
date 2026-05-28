import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Stack, Text, Badge, Separator } from '@jtl-software/platform-ui-react';
import { Package } from 'lucide-react';
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

const ArticlePanelPage: React.FC = () => {
  const appBridge = useAppBridge();
  const { id: urlId } = useParams<{ id: string }>();
  const [articleId, setArticleId] = useState<string | undefined>(urlId);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appBridge) return;
    appBridge.method.call<string>('getSessionToken').then(setSessionToken).catch(console.error);

    const unsub = appBridge.event.subscribe('ItemChanged', (data: unknown) => {
      return new Promise<void>((resolve) => {
        const d = data as { itemId?: string; sku?: string };
        setArticleId(d.itemId ?? d.sku ?? undefined);
        resolve();
      });
    });

    appBridge.method.call<string>('getCurrentItemId').then(setArticleId).catch(() => {});

    return () => { unsub(); };
  }, [appBridge]);

  useEffect(() => {
    if (!sessionToken || !articleId) return;
    setLoading(true);
    setError(null);
    getFeedbacks(sessionToken, { article_id: articleId })
      .then(setFeedbacks)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [sessionToken, articleId]);

  return (
    <Box className="p-4">
      <Stack spacing="4" direction="column">
        <Stack spacing="2" direction="column" itemAlign="center">
          <Package size={28} color="#1a56db" strokeWidth={1.5} />
          <Text type="h4" align="center">Article Feedbacks</Text>
          {articleId ? (
            <Text type="xs" color="muted" align="center">
              Article: <Text type="inline-code">{articleId}</Text>
            </Text>
          ) : (
            <Text type="xs" color="muted" align="center">Waiting for article context…</Text>
          )}
        </Stack>

        <Separator />

        {loading && <Text type="small" color="muted" align="center">Loading…</Text>}
        {error && <Text type="small" color="danger">{error}</Text>}
        {!loading && !error && articleId && feedbacks.length === 0 && (
          <Text type="small" color="muted" align="center">No feedbacks for this article.</Text>
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
                Customer: <Text type="inline-code">{fb.customer_id}</Text> ·{' '}
                {new Date(fb.created_at).toLocaleDateString('en-US')}
              </Text>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ArticlePanelPage;
