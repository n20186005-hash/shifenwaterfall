# 十分瀑布實景照片來源與授權

網站版面只引用 `public/images/` 內的本地圖片路徑，不以第三方圖片網址作為 `<img src>`。下列網址僅用來記錄原攝影作品、作者與授權來源。

## 目前目錄內的實際檔案（2026-09-02 更新）

已放置五張真實照片。這批檔案的 EXIF／IPTC 中繼資料已被移除，無法從檔案本身確認各張照片的作者與原始授權頁，因此網站圖說改採中性表述、未標示特定攝影者姓名，以避免錯誤署名。

| 檔案 | 像素尺寸 | 網站用途 |
| --- | --- | --- |
| `shifen-waterfall-hero.jpg` | 3648×2736（4:3） | 首屏主視覺、JSON-LD image |
| `shifen-waterfall-pool.jpg` | 4896×3264（3:2） | about 區配圖、政策頁 OG image |
| `shifen-waterfall-viewpoint.jpg` | 4533×3188 | about 區配圖（觀景台視角） |
| `shifen-waterfall-front.jpg` | 4352×3264（4:3） | gallery 圖組 |
| `shifen-waterfall-wide.jpg` | 6443×3046（2.12 寬幅） | gallery 寬幅圖（瀑布全景） |

**待辦（需人工核對）**：請逐一比對下方「原始預期來源」的 Wikimedia Commons 頁面縮圖，確認每個檔案對應的原作、攝影者與授權條款，再將作者姓名補回網站圖說。CC 授權的重製與散布以「正確署名」為條件，署名錯誤仍有侵權風險。

**圖片處理（2026-09-02）**：上述檔案已由 `scripts/compress-images.py`（Python + Pillow）壓縮以加快載入——JPEG 採 quality=80／optimize／progressive，並另存 WebP（quality=78）供前端 `<picture>` 優先使用；長邊限制為首屏與寬幅 2000px、其餘 1600px。傳輸量由約 26.4 MB 降至 WebP 約 1.85 MB（-93%）。**壓縮前的原始檔案完整保存於 `.image-originals/`（不部署，已加入 .gitignore）**，日後需要更高畫質輸出時可由原始檔重新產生。

## 原始預期來源（供核對用）

1. Shifen Shifen-Wasserfall 01.jpg
   - 作者：Zairon
   - 授權：CC BY-SA 4.0
   - 來源：https://commons.wikimedia.org/wiki/File:Shifen_Shifen-Wasserfall_01.jpg

2. Shifen Waterfall and rainbow 20170429.jpg
   - 作者：miyaiijima
   - 授權：CC BY 2.0
   - 來源：https://commons.wikimedia.org/wiki/File:Shifen_Waterfall_and_rainbow_20170429.jpg

3. Shifen Waterfall.jpeg
   - 作者：Andrewhaimerl
   - 授權：CC BY 4.0
   - 來源：https://commons.wikimedia.org/wiki/File:Shifen_Waterfall.jpeg

4. Shifen Shifen-Wasserfall 02.jpg
   - 作者：Zairon
   - 授權：CC BY-SA 4.0
   - 來源：https://commons.wikimedia.org/wiki/File:Shifen_Shifen-Wasserfall_02.jpg

5. TRA DRC1025 Shifen-Dahua 20160623.jpg
   - 作者：Cassiopeia sweet
   - 授權：公有領域
   - 來源：https://commons.wikimedia.org/wiki/File:TRA_DRC1025_Shifen-Dahua_20160623.jpg

圖片著作權與人格權仍歸原權利人所有；再利用時應遵守各原始授權頁的條件。網站中的裁切、縮放或壓縮不表示攝影者或 Wikimedia Commons 對本站背書。
