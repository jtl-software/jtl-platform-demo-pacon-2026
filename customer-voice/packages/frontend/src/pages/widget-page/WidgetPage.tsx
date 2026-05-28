import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Stack, Text, Button } from '@jtl-software/platform-ui-react';
import { MessageSquare, CheckCircle2 } from 'lucide-react';
import { submitFeedback, getWidgetConfig } from '../../common/api';

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <Stack spacing="1" direction="row">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '2rem',
            color: n <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            padding: '0 2px',
            lineHeight: 1,
          }}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </Stack>
  );
}

const RATING_LABELS = ['', 'Very poor', 'Poor', 'OK', 'Good', 'Excellent'];

const WidgetPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenant') ?? '';
  const customerId = searchParams.get('customer') ?? 'anonymous';

  const [greeting, setGreeting] = useState('How satisfied are you with this product?');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    getWidgetConfig(tenantId)
      .then((cfg) => { if (cfg.greeting_text) setGreeting(cfg.greeting_text); })
      .catch(() => {});
  }, [tenantId]);

  const handleSubmit = async () => {
    if (!tenantId || !articleId || rating === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitFeedback({ tenant_id: tenantId, article_id: articleId, rating, comment: comment || undefined, customer_id: customerId });
      setSubmitted(true);
    } catch (e) {
      setError('Feedback could not be saved. Please try again later.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!tenantId || !articleId) {
    return (
      <div className="flex justify-center items-center p-6" style={{ minHeight: '100vh' }}>
        <Text type="small" color="danger">Invalid widget URL – tenant and articleId are missing.</Text>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex justify-center items-center p-6" style={{ minHeight: '100vh' }}>
        <Stack spacing="3" direction="column" itemAlign="center">
          <CheckCircle2 size={48} color="#10b981" strokeWidth={1.5} />
          <Text type="h4" align="center">Thank you!</Text>
          <Text type="small" color="muted" align="center">
            Your feedback has been saved.
          </Text>
        </Stack>
      </div>
    );
  }

  return (
    <div
      className="flex justify-center items-start p-4"
      style={{ minHeight: '100vh', background: 'var(--base-background)' }}
    >
      <Box className="w-full max-w-[400px] pt-4">
        <Stack spacing="5" direction="column">
          <Stack spacing="2" direction="column" itemAlign="center">
            <MessageSquare size={32} color="#1a56db" strokeWidth={1.5} />
            <Text type="h4" align="center">Leave Feedback</Text>
            <Text type="small" color="muted" align="center">{greeting}</Text>
          </Stack>

          <Stack spacing="2" direction="column" itemAlign="center">
            <Text type="small" weight="semibold">Your Rating *</Text>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <Text type="xs" color="muted">{RATING_LABELS[rating]}</Text>
            )}
          </Stack>

          <Stack spacing="1" direction="column">
            <Text type="small" weight="semibold">Comment (optional)</Text>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike?"
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid var(--base-border)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                background: 'var(--base-background)',
                color: 'var(--base-foreground)',
                boxSizing: 'border-box',
              }}
            />
          </Stack>

          {error && <Text type="small" color="danger">{error}</Text>}

          <Button
            label={submitting ? 'Sending…' : 'Submit feedback'}
            disabled={rating === 0 || submitting}
            onClick={handleSubmit}
          />

          <Text type="xs" color="muted" align="center">
            Article: <Text type="inline-code">{articleId}</Text>
          </Text>
        </Stack>
      </Box>
    </div>
  );
};

export default WidgetPage;
