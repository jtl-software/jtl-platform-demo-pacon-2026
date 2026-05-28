import { createContext, useContext } from 'react';
import type { AppBridge } from '@jtl-software/cloud-apps-core';

export const AppBridgeContext = createContext<AppBridge | null>(null);

export const useAppBridge = (): AppBridge | null => useContext(AppBridgeContext);
