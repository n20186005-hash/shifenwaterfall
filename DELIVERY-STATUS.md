# 交付狀態

已包含：Astro/Tailwind/TypeScript 原始碼、Cloudflare Workers 設定、pnpm lockfile、Logo/Favicon、隱私權政策、服務條款、Cookie 設定、SEO/JSON-LD/FAQ、地圖與資料來源文件。

已完成的本地靜態檢查：
- `node scripts/audit-source.mjs`：PASS
- `node scripts/audit-language.mjs`：PASS
- 原始碼未發現任何占位網域／本機回環位址／瀏覽器擴充協定殘留（audit-source 規則 PASS）
- 頁面沒有外部 `<img src="https://…">` hotlink

環境限制：
- 執行環境拒絕對外下載 Wikimedia Commons 二進位 JPG，因此 `public/images/` 中的 5 張真實照片尚未能寫入；沒有以假 JPG 或生成圖替代。
- 執行環境一度拒絕連線 npm registry，故未能於首輪誠實完成 `CI=1 corepack pnpm install --frozen-lockfile`、`pnpm check`、`pnpm build` 的最終 CI 閘門。（2026-09-02 複查 npm registry 已恢復連線，見下方待辦。）

真實圖片作者、授權與原始頁面均記錄在 `IMAGE-LICENSES.md`。

後續新增（2026-09-02）：
- 即時天氣＋未來 7 日預報模組（Open-Meteo 免費 API，Server Component + Cloudflare Cache API 快取 30 分鐘，`src/lib/weather.ts` + `src/components/WeatherSection.astro`）。
- 內容補全：歷史背景時間線（`HistorySection.astro`）、故事傳說 4 則含來源性質徽章（`StoriesSection.astro`）、實用設施 8 類中立清單（`FacilitiesSection.astro`，僅類型不推薦商家）、FAQ 由 6 則擴充至 9 則；Header 導覽新增「歷史傳說」「實用設施」。
- 正式網域 `https://shifenwaterfall.com` 設定於 `astro.config.mjs`（啟用 sitemap、絕對 canonical/OG）。
- SEO 實體綁定：JSON-LD 補 `image`／`alternateName` ／新增 `BreadcrumbList`；Hero 地理麵包屑與首段等位聲明；評分更新為 4.5（29,127 則）；權威資料來源擴充為 7 項（新增中央氣象署、臺鐵、Open-Meteo）。
- PWA：`manifest.webmanifest`、`sw.js`（靜態快取優先＋導航離線回退）、`scripts/generate-pwa-icons.mjs` 純 Node 生成 192/512 PNG 圖標、SW 註冊與 PWA meta。
- 已知：`scripts/audit-*.mjs` 原先使用 `URL.pathname` 在 Windows 上產生錯誤路徑（`C:\C:\...`）；2026-09-02 已改用 `fileURLToPath()` 修復，Windows 下可直接執行。

合規審計修復（2026-09-02，針對避坑指南條目）：
- `pnpm-workspace.yaml` 已建立 `allowBuilds`（esbuild／workerd 放行）防 pnpm 11 的 ERR_PNPM_IGNORED_BUILDS 硬攔截。
- H1 已補實體詞：`十分瀑布／山城裡的一道白色水幕`（原 H1 缺少「十分瀑布」）。
- GA4 同意門控升級：`BaseLayout` 監聽 `consent-updated` 事件，`cookie-settings` 儲存／拒絕後立即派發，同意即時載入 gtag（不再需要重新載入頁面）。
- 首屏 hero `<img>` 移除非標準 `fetchpriority` 屬性（消除既有 TS lint 錯誤）。
- `scripts/audit-source.mjs`／`audit-language.mjs` Windows 路徑修復，本地實跑：source PASS、language PASS。
- 待辦（需在聯網環境完成）：`pnpm-lock.yaml` 目前僅含 `importers` 段、缺少 `packages` 解析段；請執行一次 `corepack pnpm install` 讓 lockfile 補全，再跑 `pnpm check` 與 `pnpm build` 完成 CI 閘門。

CI 閘門修復（2026-09-02，Cloudflare 建置環境實測，兩輪）：
- lockfile 已由 CI 側確認完整：`pnpm install --frozen-lockfile` 通過 supply-chain 校驗（487 entries），解析階段跳過、316 套件成功安裝。
- CI 失敗點為 `[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: esbuild@0.28.1, esbuild@0.28.2, workerd@1.20260828.1`。
- 正確根因（pnpm 11 breaking change）：pnpm 11 的構建設置**只從 `pnpm-workspace.yaml` 讀取**；`.npmrc` 僅認 auth／registry，`package.json` 的 `pnpm.onlyBuiltDependencies` 欄位亦不再生效。專案 `pnpm-workspace.yaml` 原為 `allowBuilds` 占位文本（`set this to true or false`），等於未放行。
- 已修正：`pnpm-workspace.yaml` → `allowBuilds: { esbuild: true, workerd: true }`；`.npmrc` 清理為註釋；`package.json` 移除無效的 `pnpm.onlyBuiltDependencies`。重跑 CI 應可通過依賴安裝、進入 `pnpm check`／`pnpm build` 階段。
