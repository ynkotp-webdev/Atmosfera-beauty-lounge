// Поиск по отзывам Google: node scripts/reviews-find.mjs "<regex>" [макс. длина текста]
import fs from 'node:fs';
const raw = fs.readFileSync(new URL('../content/google/reviews-raw.md', import.meta.url), 'utf8');
let loc = '';
const out = [];
for (const block of raw.split(/\n(?=#{1,3} )/)) {
  const h1 = block.match(/^# (.+)/);
  if (h1) { loc = h1[1].includes('Залізнична') ? 'Nail Bar' : 'Lounge'; continue; }
  const m = block.match(/^### (.+?) — (.+?) — (\d) зіроч/);
  if (!m) continue;
  out.push({ loc, name: m[1], when: m[2], stars: +m[3], text: block.split('\n').slice(1).join('\n').trim() });
}
const [, , re, max = '100000'] = process.argv;
const rx = new RegExp(re, 'i');
for (const r of out.filter((r) => rx.test(r.text) && r.text.length <= +max && r.stars >= 4))
  console.log(`[${r.loc}] ${r.name} — ${r.when} — ${r.stars}★\n${r.text}\n`);
