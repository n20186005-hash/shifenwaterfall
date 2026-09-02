# 交付狀態

已包含：Astro/Tailwind/TypeScript 原始碼、Cloudflare Workers 設定、pnpm lockfile、Logo/Favicon、隱私權政策、服務條款、Cookie 設定、SEO/JSON-LD/FAQ、地圖與資料來源文件。

已完成的本地靜態檢查：
- `node scripts/audit-source.mjs`：PASS
- `node scripts/audit-language.mjs`：PASS
- 原始碼未發現 `example.com`、`localhost`、`chrome-extension://`
- 頁面沒有外部 `<img src="https://…">` hotlink

環境限制：
- 執行環境拒絕對外下載 Wikimedia Commons 二進位 JPG，因此 `public/images/` 中的 5 張真實照片尚未能寫入；沒有以假 JPG 或生成圖替代。
- 執行環境也拒絕連線 npm registry，因此無法在本次環境誠實完成 `CI=1 corepack pnpm install --frozen-lockfile`、`pnpm check`、`pnpm build` 的最終 CI 閘門。

真實圖片作者、授權與原始頁面均記錄在 `IMAGE-LICENSES.md`。
