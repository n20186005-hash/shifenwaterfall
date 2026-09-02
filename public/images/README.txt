十分瀑布實景照片說明

本目錄放置本站所用的五張真實照片（皆為 Wikimedia Commons 公開授權作品；檔案 EXIF 中不含作者資訊，需以人工方式對照授權頁逐一核對）。

每張照片都有 JPEG 與 WebP 兩種格式，前端以 <picture> 優先載入 WebP，不支援時自動回退 JPEG：

- shifen-waterfall-hero.jpg / .webp        2000×1500  首屏主視覺（瀑布正面）
- shifen-waterfall-pool.jpg / .webp        1600×1067  瀑布與綠色瀑潭（about 區、政策頁 OG image）
- shifen-waterfall-viewpoint.jpg / .webp   1600×1125  觀景台望向水幕與山林（about 區配圖）
- shifen-waterfall-front.jpg / .webp       1600×1200  瀑布正面近觀（gallery 圖組）
- shifen-waterfall-wide.jpg / .webp        2000×946   瀑布全景，兩岸森林與基隆河峽谷（gallery 寬幅圖）

壓縮：由 scripts/compress-images.py（Python + Pillow）處理，JPEG 採 quality=80／optimize／progressive，WebP 採 quality=78，長邊限制為首屏與寬幅 2000px、其餘 1600px。整體傳輸量由約 26.4 MB 降至 WebP 約 1.85 MB（-93%）。

壓縮前的原始檔案保存於專案根目錄 .image-originals/（不部署，已加入 .gitignore）。

授權、原作名稱、攝影者與 Wikimedia Commons 來源頁詳見專案根目錄 IMAGE-LICENSES.md。
本目錄不以佔位圖、生成圖或非本站景點照片冒充實景照片。
