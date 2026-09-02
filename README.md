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

正式網域 `https://shifenwaterfall.com` 只在 `astro.config.mjs` 的 `site` 常數設定一次。`@astrojs/sitemap` 已啟用並由 Astro 自動產生 sitemap（`/sitemap-index.xml`，亦於 `public/robots.txt` 宣告）；canonical 與 Open Graph 網址均由 Astro 依 `site` 產生絕對網址。

## SEO 實體綁定（單景點落地頁）

- 首頁 `<head>` 注入三組 JSON-LD：`TouristAttraction`（含 `@id`、`image`、`alternateName`、`sameAs`、`aggregateRating` 29,127 則）、`FAQPage`（9 則，與正文 `<details>` 同步）、`BreadcrumbList`（十分瀑布 → 平溪區 → 新北市 → 臺灣）。
- Hero 區新增視覺地理麵包屑與首段等位聲明（「十分瀑布（Shifen Waterfall）＝官方園區名稱十分瀑布公園」）。
- `src/components/` 與 `src/pages/index.astro` 所有正文標題皆含實體關鍵要素（十分瀑布／平溪區／新北市／基隆河）。

## PWA 支援

- `public/manifest.webmanifest`：`display: standalone`、主題色 `#0d2b26`、192/512 安裝圖標與 maskable 圖標。
- `public/sw.js`：靜態資源 cache-first、導航 network-first（失敗回退快取，離線可用）；外站請求（Google Maps iframe、Open-Meteo、GA）不攔截。
- 圖標由 `scripts/generate-pwa-icons.mjs` 以純 Node（內建 zlib，自實作 PNG 編碼）生成，無第三方依賴、不需下載圖片；`BaseLayout.astro` 註冊 SW 並輸出 `theme-color`、`application-name`、`apple-touch-icon`。

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
- Open-Meteo 免費天氣 API（即時天氣與未來 7 日預報，無需金鑰）

易變動資訊（開放、交通、停車、步道管制、天氣）在頁面中明示應以出發前官方公告為準。

## 天氣模組

`src/components/WeatherSection.astro` 為 Server Component：於伺服器端（Cloudflare Workers）呼叫 Open-Meteo，透過 Cloudflare Cache API 快取回應 30 分鐘，避免每次頁面請求都打外部 API；本地開發無 `caches` 時自動降級為直接請求。資料取得與 WMO 天氣代碼對照集中在 `src/lib/weather.ts`。API 失敗時元件優雅降級為「資料暫時無法取得」提示，不阻塞頁面。

## 內容模組

- `src/components/HistorySection.astro`：歷史背景時間線（十分寮聚落、平溪線運煤鐵道 1919–1921、1929 收歸官營、觀瀑公園整建）＋瀑布成因與平溪線小檔案。
- `src/components/StoriesSection.astro`：故事與傳說 4 則，以「有據可考／民間傳說」徽章區分來源性質，維持中立科普立場。
- `src/components/FacilitiesSection.astro`：實用設施 8 類（衛生間、停車、餐飲、住宿、商超補給、加油充電、飲水休憩、無障礙親子），僅寫類型與所在區域，不推薦或排名任何特定商家。
- `src/components/WeatherSection.astro`：即時天氣＋未來 7 日預報（Open-Meteo）。

FAQ 共 9 則（含設施、雨天／颱風、山區加油充電等決策型問答）。
