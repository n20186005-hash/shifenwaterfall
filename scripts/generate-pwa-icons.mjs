// 生成 PWA 圖標（icon-192.png / icon-512.png）。
// 純 Node 實作 PNG 編碼（zlib 內建），不依賴任何第三方套件與網路下載。
// 圖案：深綠背景 + 白色圓底 + 青綠水幕與水珠，呼應十分瀑布意象。

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

// ---- PNG 編碼工具 ----
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  // compression / filter / interlace = 0
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- 繪製 ----
function inCircle(u, v, cx, cy, r) {
  const dx = u - cx;
  const dy = v - cy;
  return dx * dx + dy * dy <= r * r;
}

function draw(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const bg = [13, 43, 38, 255]; // #0d2b26 深綠
  const white = [255, 255, 255, 255];
  const teal = [28, 102, 87, 255]; // #1c6657 青綠
  const foam = [109, 213, 188, 255]; // 水花淡青

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const u = (px + 0.5) / size;
      const v = (py + 0.5) / size;
      let color = bg;

      // 白色圓底（居中偏上，留出 maskable 安全區）
      if (inCircle(u, v, 0.5, 0.46, 0.36)) color = white;

      // 青綠水幕：三道自上而下收窄的水柱
      const falls = [
        { x0: 0.415, x1: 0.475, y0: 0.30, y1: 0.55 },
        { x0: 0.475, x1: 0.525, y0: 0.27, y1: 0.60 },
        { x0: 0.525, x1: 0.585, y0: 0.31, y1: 0.55 },
      ];
      for (const f of falls) {
        if (u >= f.x0 && u <= f.x1 && v >= f.y0 && v <= f.y1) color = teal;
      }

      // 底部水波：橫向帶狀 + 半圓波紋
      if (v >= 0.585 && v <= 0.645 && u >= 0.36 && u <= 0.64) {
        const wave = 0.02 * Math.sin(((u - 0.36) / 0.28) * Math.PI * 2);
        if (v >= 0.60 + wave && v <= 0.63 + wave) color = teal;
      }

      // 水珠
      if (inCircle(u, v, 0.46, 0.70, 0.024) || inCircle(u, v, 0.55, 0.72, 0.018)) color = foam;

      const i = (py * size + px) * 4;
      rgba[i] = color[0];
      rgba[i + 1] = color[1];
      rgba[i + 2] = color[2];
      rgba[i + 3] = color[3];
    }
  }
  return rgba;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of [192, 512]) {
  const file = join(OUT_DIR, `icon-${size}.png`);
  writeFileSync(file, encodePng(size, size, draw(size)));
  console.log(`OK ${file} (${size}x${size})`);
}
