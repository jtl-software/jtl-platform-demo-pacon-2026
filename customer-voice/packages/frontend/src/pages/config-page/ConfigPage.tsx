import { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Text,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Separator,
} from '@jtl-software/platform-ui-react';
import { Settings } from 'lucide-react';
import { useAppBridge } from '../../common/AppBridgeContext';
import { getTenantConfig, saveTenantConfig, type TenantConfig } from '../../common/api';
import { apiUrl } from '../../common/constants';

const ConfigPage: React.FC = () => {
  const appBridge = useAppBridge();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [config, setConfig] = useState<Omit<TenantConfig, 'tenant_id'>>({
    shop_name: '',
    contact_email: '',
    greeting_text: '',
  });
  const [tenantId, setTenantId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appBridge) {
      appBridge.method.call<string>('getSessionToken').then(setSessionToken).catch(console.error);
    }
  }, [appBridge]);

  useEffect(() => {
    if (!sessionToken) return;
    setLoading(true);
    getTenantConfig(sessionToken)
      .then((data) => {
        setTenantId(data.tenant_id);
        setConfig({ shop_name: data.shop_name, contact_email: data.contact_email, greeting_text: data.greeting_text });
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [sessionToken]);

  const handleSave = async () => {
    if (!sessionToken) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveTenantConfig(sessionToken, config);
      setSaved(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const widgetUrl = tenantId
    ? `${window.location.origin}/widget/ARTICLE-ID?tenant=${encodeURIComponent(tenantId)}&customer=CUSTOMER-ID`
    : '';

  void apiUrl;

  if (!appBridge) {
    return (
      <Box className="flex justify-center p-12">
        <Card className="max-w-[480px] w-full">
          <CardHeader className="items-center">
            <Settings size={40} color="#1a56db" strokeWidth={1.5} />
            <CardTitle>Configuration</CardTitle>
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
    <Box className="flex justify-center p-6">
      <Card className="max-w-[560px] w-full">
        <CardHeader className="items-center">
          <Settings size={40} color="#1a56db" strokeWidth={1.5} />
          <CardTitle>Configuration</CardTitle>
          <CardDescription className="text-center">
            Shop settings for CustomerVoice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stack spacing="5" direction="column">
            {loading && <Text type="small" color="muted">Loading configuration…</Text>}

            {!loading && (
              <>
                <Stack spacing="3" direction="column">
                  <Stack spacing="1" direction="column">
                    <Text type="small" weight="semibold">Shop Name</Text>
                    <Input
                      value={config.shop_name}
                      placeholder="My Online Shop"
                      onChange={(val: string) => setConfig((c) => ({ ...c, shop_name: val }))}
                    />
                  </Stack>

                  <Stack spacing="1" direction="column">
                    <Text type="small" weight="semibold">Contact Email</Text>
                    <Input
                      value={config.contact_email}
                      placeholder="support@my-shop.com"
                      onChange={(val: string) => setConfig((c) => ({ ...c, contact_email: val }))}
                    />
                  </Stack>

                  <Stack spacing="1" direction="column">
                    <Text type="small" weight="semibold">Widget greeting text</Text>
                    <textarea
                      value={config.greeting_text}
                      placeholder="How satisfied are you with this product?"
                      rows={3}
                      onChange={(e) => setConfig((c) => ({ ...c, greeting_text: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid var(--base-border)',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        background: 'var(--base-background)',
                        color: 'var(--base-foreground)',
                      }}
                    />
                  </Stack>
                </Stack>

                <Stack spacing="2" direction="row" itemAlign="center">
                  <Button onClick={handleSave} label={saving ? 'Saving…' : 'Save settings'} disabled={saving} />
                  {saved && <Text type="small" color="success">Saved ✓</Text>}
                  {error && <Text type="small" color="danger">{error}</Text>}
                </Stack>

                {widgetUrl && (
                  <>
                    <Separator />
                    <Stack spacing="2" direction="column">
                      <Text type="xs" weight="semibold" color="muted">WIDGET URL (for shop integration)</Text>
                      <Text type="xs" color="muted">
                        Embed this URL in your shop for each article. Replace the two placeholders before use:
                      </Text>
                      <div
                        className="p-3 rounded-lg"
                        style={{ background: 'var(--base-muted)', fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}
                      >
                        {widgetUrl}
                      </div>
                      <Stack spacing="1" direction="column">
                        <Text type="xs" color="muted">
                          <Text type="inline-code">ARTICLE-ID</Text> — the article or product identifier from your shop
                        </Text>
                        <Text type="xs" color="muted">
                          <Text type="inline-code">CUSTOMER-ID</Text> — the ID of the logged-in customer placing the feedback
                        </Text>
                      </Stack>
                      <Text type="xs" color="muted">
                        Tenant ID: <Text type="inline-code">{tenantId}</Text>
                      </Text>
                    </Stack>
                  </>
                )}
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConfigPage;
