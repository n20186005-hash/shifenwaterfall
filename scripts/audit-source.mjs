import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const forbidden = [new RegExp('example' + '\\.' + 'com','i'), new RegExp('local' + 'host','i'), new RegExp('chrome' + '-extension:' + '\\/\\/','i')];
const textExt = new Set(['.astro','.ts','.js','.mjs','.json','.jsonc','.css','.md','.txt','.svg','.html']);
const ext = (p) => p.slice(p.lastIndexOf('.'));
const skip = new Set(['node_modules','dist','.astro','.git']);
let failures = [];

async function walk(dir) {
  for (const name of await readdir(dir)) {
    if (skip.has(name)) continue;
    const p = join(dir,name);
    const s = await stat(p);
    if (s.isDirectory()) await walk(p);
    else if (textExt.has(ext(p))) {
      const txt = await readFile(p,'utf8');
      for (const pattern of forbidden) if (pattern.test(txt)) failures.push(`${relative(root,p)}: ${pattern}`);
    }
  }
}
await walk(root);
const pkg = JSON.parse(await readFile(join(root,'package.json'),'utf8'));
for (const [group,deps] of Object.entries({dependencies:pkg.dependencies,devDependencies:pkg.devDependencies})) {
  for (const [name,v] of Object.entries(deps ?? {})) if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(v)) failures.push(`${group}.${name} 不是精確版本: ${v}`);
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('source audit: PASS');
