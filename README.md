# 十分瀑布旅遊指南

新北市平溪區「十分瀑布／十分瀑布公園」的獨立非營利繁體中文旅遊資訊網站。主頁為單頁景點指南，另有隱私政策、服務條款與 Cookie 設定三個獨立二級頁面。

## 技術固定

- Astro `7.2.9`
- `@astrojs/cloudflare` `14.2.5`
- `@astrojs/sitemap` `3.7.3`
- Tailwind CSS `4.3.3` + `@tailwindcss/vite` `4.3.3`
- TypeScript `6.0.3`
- `@astrojs/check` `0.9.10`
- Wrangler `4.127.1`
- pnpm `11.24.0`
- Node.js `24.20.0`
- GA4 `G-HXM22WWPKP`（分析同意後才載入）

所有直接相依套件均為精確版本，`pnpm-lock.yaml` 與根 importer 對齊。單包專案不建立 `pnpm-workspace.yaml`。

## 正式網域

正式網域只在 `astro.config.mjs` 的 `site` 常數設定一次。未設定時專案仍可建置：不產生絕對 canonical、絕對 Open Graph 網址或 sitemap；也不使用任何假網域作後備值。正式網域填入後，`@astrojs/sitemap` 才會啟用並由 Astro 自動產生 sitemap。

## 本地執行與乾淨驗收

```bash
corepack enable
CI=1 corepack pnpm install --frozen-lockfile
pnpm audit:source
pnpm audit:language
pnpm check
pnpm build
```

部署 Cloudflare Workers：

```bash
pnpm deploy
```

## 圖片

頁面只引用 `/images/...` 的本地 JPG，不以遠端圖片網址作為執行時來源。圖片作者、來源頁與授權記錄於 `IMAGE-LICENSES.md`。

## 主要資料來源

- 新北市政府觀光旅遊局「新北旅客」十分瀑布公園
- 新北旅客「十分遊客中心」與平溪區域旅遊資訊
- 交通部觀光署「十分風景特定區」
- 使用者提供的 Google 地圖實體資料與嵌入地圖

易變動資訊（開放、交通、停車、步道管制）在頁面中明示應以出發前官方公告為準。
