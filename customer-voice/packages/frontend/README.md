# React Frontend Template

React 19 + Vite + Tailwind CSS + JTL Platform UI

## App modes

| Route | Manifest field | Context |
|-------|---------------|---------|
| `/` | — | Welcome page |
| `/setup` | `lifecycle.setupUrl` | App installation |
| `/erp` | `capabilities.erp.menuItems[].url` | Main ERP view |
| `/pane` | `capabilities.erp.pane[].url` | Sidebar panel |
| `/hub` | `capabilities.hub.appLauncher.redirectUrl` | Hub launcher |

## Scripts

- `npm run dev` — Vite dev server on port 3004
- `npm run build` — production build
- `npm run test` — Vitest
