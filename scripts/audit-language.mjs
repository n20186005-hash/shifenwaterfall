import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../src/', import.meta.url));
const patterns = [
  [/设置/g,'設定'],[/信息/g,'資訊'],[/游客/g,'遊客'],[/开放/g,'開放'],[/时间/g,'時間'],[/门票/g,'門票'],[/周边/g,'周邊'],[/隐私/g,'隱私'],[/条款/g,'條款'],[/服务/g,'服務'],[/浏览/g,'瀏覽'],[/网页/g,'網頁'],[/旅游/g,'旅遊'],[/台湾/g,'臺灣'],[/台北市/g,'臺北市']
];
let failures=[];
async function walk(dir){for(const n of await readdir(dir)){const p=join(dir,n),s=await stat(p);if(s.isDirectory())await walk(p);else if(/\.(astro|ts|css)$/.test(p)){const t=await readFile(p,'utf8');for(const [r,to] of patterns){if(r.test(t))failures.push(`${relative(root,p)}: 發現非臺灣繁中用字 ${r}，建議 ${to}`);r.lastIndex=0;}}}}
await walk(root);
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('language audit: PASS');
