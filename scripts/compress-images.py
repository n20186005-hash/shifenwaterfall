"""壓縮 public/images 的實景照片，並額外產生 WebP 版本以加快載入。

處理流程：
1. 原圖備份至 .image-originals/（僅第一次；該目錄不部署、建議加入 .gitignore）
2. 依各圖實際展示尺寸限制長邊（LANCZOS 重採樣）
3. 覆蓋寫回 JPEG（quality=80、optimize、progressive）
4. 同尺寸輸出 WebP（quality=78），由前端 <picture> 優先使用

用法：python -X utf8 scripts/compress-images.py
"""
import os
import shutil

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "public", "images")
BACKUP_DIR = os.path.join(ROOT, ".image-originals")

# 檔案 -> 最大長邊（依網站實際展示尺寸決定，約 2 倍於最大顯示寬度）
TARGETS = {
    "shifen-waterfall-hero.jpg": 2000,       # 首屏全幅背景
    "shifen-waterfall-wide.jpg": 2000,       # gallery 16:7 寬幅
    "shifen-waterfall-pool.jpg": 1600,       # about 區 4:3 + 政策頁 OG image
    "shifen-waterfall-viewpoint.jpg": 1600,  # about 區 4:3
    "shifen-waterfall-front.jpg": 1600,      # gallery 4:3
}

JPEG_QUALITY = 80
WEBP_QUALITY = 78


def human(n):
    if n >= 1024 * 1024:
        return "{:.2f} MB".format(n / 1024 / 1024)
    return "{:.0f} KB".format(n / 1024)


def main():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    total_before = 0
    total_jpeg = 0
    total_webp = 0

    for name, max_edge in TARGETS.items():
        src = os.path.join(IMG_DIR, name)
        if not os.path.exists(src):
            print("[skip] {} not found".format(name))
            continue

        # 1) 備份原圖（只做一次，之後都以備份檔為來源，避免二次壓縮）
        backup = os.path.join(BACKUP_DIR, name)
        if not os.path.exists(backup):
            shutil.copy2(src, backup)

        before = os.path.getsize(src)

        with Image.open(backup) as raw:
            im = raw.convert("RGB")
            w, h = im.size
            scale = min(1.0, max_edge / float(max(w, h)))
            new_size = (max(1, round(w * scale)), max(1, round(h * scale)))
            if new_size != (w, h):
                im = im.resize(new_size, Image.LANCZOS)

            # 2) 壓縮 JPEG 並覆蓋原檔
            im.save(
                src,
                "JPEG",
                quality=JPEG_QUALITY,
                optimize=True,
                progressive=True,
                subsampling=1,
            )

            # 3) 輸出 WebP
            webp_path = os.path.join(IMG_DIR, name.replace(".jpg", ".webp"))
            im.save(webp_path, "WEBP", quality=WEBP_QUALITY, method=6)

        after = os.path.getsize(src)
        webp_size = os.path.getsize(webp_path)
        total_before += before
        total_jpeg += after
        total_webp += webp_size

        print(
            "{}\n   {}x{} -> {}x{} | jpg {} -> {} | webp {}".format(
                name,
                w,
                h,
                new_size[0],
                new_size[1],
                human(before),
                human(after),
                human(webp_size),
            )
        )

    print("")
    print("JPEG total : {} -> {}".format(human(total_before), human(total_jpeg)))
    print("WebP total : {} -> {}".format(human(total_before), human(total_webp)))
    print(
        "saved (webp vs original): {:.0f}%".format(
            (1 - total_webp / float(total_before)) * 100 if total_before else 0
        )
    )


if __name__ == "__main__":
    main()
