import { useCallback, useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Stack,
  Text,
  Badge,
  Button,
  Separator,
} from '@jtl-software/platform-ui-react';
import { KeyRound } from 'lucide-react';
import { useAppBridge } from '../../common/AppBridgeContext';
import { linkTenant } from '../../common/api';

const steps = [
  { step: '1', text: 'Platform loads this page via ', code: 'lifecycle.configurationUrl' },
  { step: '2', text: 'App requests a session token via ', code: "appBridge.method.call('getSessionToken')" },
  { step: '3', text: 'Backend links the tenant via ', code: 'POST /tenants/link' },
];

const LoginPage: React.FC = () => {
  const appBridge = useAppBridge();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLink = useCallback(async () => {
    if (!appBridge) return;
    setLoading(true);
    setError(null);
    try {
      const sessionToken = await appBridge.method.call<string>('getSessionToken');
      const result = await linkTenant(sessionToken);
      setTenantId(result.tenantId);
      await appBridge.method.call('setupCompleted');
      setDone(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [appBridge]);

  return (
    <Box className="flex justify-center p-12">
      <Card className="max-w-[520px] w-full">
        <CardHeader className="items-center">
          <KeyRound size={40} color="#1a56db" strokeWidth={1.5} />
          <CardTitle>Tenant Setup</CardTitle>
          <CardDescription className="text-center">
            Connect your JTL Cloud tenant with CustomerVoice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stack spacing="5" direction="column">
            <Stack spacing="3" direction="column">
              <Text type="xs" weight="semibold" color="muted">HOW IT WORKS</Text>
              {steps.map((s) => (
                <Stack key={s.step} spacing="3" direction="row" itemAlign="start">
                  <Badge variant="outline" label={s.step} />
                  <Text type="small" color="muted">
                    {s.text}
                    <Text type="inline-code">{s.code}</Text>
                  </Text>
                </Stack>
              ))}
            </Stack>

            <Separator />

            <Stack spacing="3" direction="column">
              <Text type="xs" weight="semibold" color="muted">CONNECT NOW</Text>

              {!appBridge && (
                <Text type="small" color="muted">
                  No AppBridge detected – open this page from the JTL Hub.
                </Text>
              )}

              {appBridge && !done && (
                <Button
                  onClick={handleLink}
                  label={loading ? 'Connecting…' : 'Connect now'}
                  disabled={loading}
                />
              )}

              {done && (
                <Stack spacing="2" direction="column">
                  <Text type="small" color="success">
                    Successfully connected ✓
                  </Text>
                  <Text type="xs" color="muted">
                    Tenant ID: <Text type="inline-code">{tenantId}</Text>
                  </Text>
                </Stack>
              )}

              {error && <Text type="small" color="danger">{error}</Text>}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
