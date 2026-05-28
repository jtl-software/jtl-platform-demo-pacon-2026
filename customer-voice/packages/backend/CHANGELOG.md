# @jtl/cloud-app-template-backend-node

## 0.0.12

### Patch Changes

- [#46](https://github.com/jtl-software/cloud-apps-cli/pull/46) [`53e27ae`](https://github.com/jtl-software/cloud-apps-cli/commit/53e27ae5fa378292191a8fa30769b8275ba51ed9) Thanks [@tobilen](https://github.com/tobilen)! - Pin to newest Node LTS Version

## 0.0.11

### Patch Changes

- [#43](https://github.com/jtl-software/cloud-apps-cli/pull/43) [`90cd2f7`](https://github.com/jtl-software/cloud-apps-cli/commit/90cd2f7eb422dcb9e6870cc7ec51015941eeed7b) Thanks [@tobilen](https://github.com/tobilen)! - Warn loudly when CLIENT_ID / CLIENT_SECRET are missing. Backends print a red startup banner pointing at the env/config file, and expose `GET /health` returning `{ status, missing }`. The React frontend polls `/health` and renders a yellow banner across all routes when the backend reports a misconfiguration, so the dev sees the issue in the browser even if they missed the terminal output.

- [#43](https://github.com/jtl-software/cloud-apps-cli/pull/43) [`27055e6`](https://github.com/jtl-software/cloud-apps-cli/commit/27055e6d01e3a30e3a5de97f2e56772dbf4f0dfd) Thanks [@tobilen](https://github.com/tobilen)! - Moved the manifest.json out of the frontend package

- [#43](https://github.com/jtl-software/cloud-apps-cli/pull/43) [`36d1518`](https://github.com/jtl-software/cloud-apps-cli/commit/36d1518f8214fdee56cff202456f6b35f8912346) Thanks [@tobilen](https://github.com/tobilen)! - Add register command to generated project

## 0.0.10

### Patch Changes

- [#40](https://github.com/jtl-software/cloud-apps-cli/pull/40) [`b3b64b5`](https://github.com/jtl-software/cloud-apps-cli/commit/b3b64b58d734fe8ba564f929da112c41d6178199) Thanks [@Mr-Malomz](https://github.com/Mr-Malomz)! - Hardcode production API and Auth URLs in backend templates, removing environment-specific logic.

## 0.0.9

### Patch Changes

- [#36](https://github.com/jtl-software/cloud-apps-cli/pull/36) [`adca670`](https://github.com/jtl-software/cloud-apps-cli/commit/adca670a52296d01b2c153b722cc3b51993125d5) Thanks [@tobilen](https://github.com/tobilen)! - Fix .env file detection & deprecated manifest fields

## 0.0.8

### Patch Changes

- [#27](https://github.com/jtl-software/cloud-apps-cli/pull/27) [`5ef9ce5`](https://github.com/jtl-software/cloud-apps-cli/commit/5ef9ce57a8162b4a5d4cc19899ee993937dd0eb9) Thanks [@tobilen](https://github.com/tobilen)! - Fix typescript errors and minor styling issues

## 0.0.7

### Patch Changes

- [#22](https://github.com/jtl-software/cloud-apps-cli/pull/22) [`b8b4d63`](https://github.com/jtl-software/cloud-apps-cli/commit/b8b4d6396095b8ae8374c124adbb0de07725dda1) Thanks [@tobilen](https://github.com/tobilen)! - Readd .env.example

## 0.0.6

### Patch Changes

- [#20](https://github.com/jtl-software/cloud-apps-cli/pull/20) [`ab20518`](https://github.com/jtl-software/cloud-apps-cli/commit/ab20518f077cb18d8aca24944ca182e3142d16a6) Thanks [@tobilen](https://github.com/tobilen)! - Add GraphQL example implementation

## 0.0.5

### Patch Changes

- [#14](https://github.com/jtl-software/cloud-apps-cli/pull/14) [`1fc1644`](https://github.com/jtl-software/cloud-apps-cli/commit/1fc1644d4bfaf38974e23db482f06449a952af1b) Thanks [@tobilen](https://github.com/tobilen)! - update dependencies

## 0.0.4

### Patch Changes

- [#12](https://github.com/jtl-software/cloud-apps-cli/pull/12) [`3eb5574`](https://github.com/jtl-software/cloud-apps-cli/commit/3eb5574d24ee8485939bc22ce1e9c8be9e343ccc) Thanks [@tobilen](https://github.com/tobilen)! - repair deployment, install all dependencies during npm install step

## 0.0.3

### Patch Changes

- [#9](https://github.com/jtl-software/cloud-apps-cli/pull/9) [`5697636`](https://github.com/jtl-software/cloud-apps-cli/commit/5697636be8f917639539f72fbffb9165a2de01b1) Thanks [@tobilen](https://github.com/tobilen)! - Add required meta information, merge \_package.json and add readme for templates

## 0.0.2

### Patch Changes

- [`d7c698c`](https://github.com/jtl-software/cloud-apps-cli/commit/d7c698c311ed8d8ecf093ddf056d9b91cc7ba008) Thanks [@tobilen](https://github.com/tobilen)! - publish templates separately

## 0.0.1

### Patch Changes

- [`845f751`](https://github.com/jtl-software/cloud-apps-cli/commit/845f751930774ebbd0af55abcba505443494befe) Thanks [@tobilen](https://github.com/tobilen)! - initial
