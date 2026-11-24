// Контуры вордмарка для сайта: Montserrat Regular (OFL) → SVG path в src/data/wordmark.json. Шрифт на сайт не грузится.
// Разовый инструмент. Запуск из временной папки: npm i opentype.js @fontsource/montserrat, затем node wordmark.mjs <out.json>
import opentype from 'opentype.js';
import fs from 'node:fs';
const buf = fs.readFileSync('node_modules/@fontsource/montserrat/files/montserrat-latin-400-normal.woff');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const S = 1000;
const d = (p, dx, dy) => p.commands.map((c) => c.type + ['x1', 'y1', 'x2', 'y2', 'x', 'y'].filter((k) => k in c).map((k) => Math.round(c[k] + (k[0] === 'x' ? dx : dy))).join(' ')).join('');
const word = (text, size = S, track = -0.02) => {
  const p = font.getPath(text, 0, 0, size, { letterSpacing: track });
  const b = p.getBoundingBox();
  return { w: Math.round(b.x2 - b.x1), h: Math.round(-b.y1), p, b };
};
const out = {};
for (const [key, text] of [['main', 'ATMOSFERA'], ['atmo', 'ATMO'], ['sfera', 'SFERA']]) {
  const { w, h, p, b } = word(text);
  out[key] = { viewBox: `0 0 ${w} ${h + 12}`, d: d(p, -b.x1, h + 6) }; // 6 ед. запаса на выносы O и S
}
// полный знак: ATMOSFERA + BEAUTY LOUNGE вразрядку по центру, как на стене и визитке
const m = word('ATMOSFERA'), s = word('BEAUTY LOUNGE', 0.2 * S, 0.42);
const gap = 0.2 * S;
out.full = { viewBox: `0 0 ${m.w} ${m.h + gap + s.h + 12}`, d: d(m.p, -m.b.x1, m.h + 6) + d(s.p, -s.b.x1 + (m.w - s.w) / 2, m.h + 6 + gap + s.h) };
fs.writeFileSync(process.argv[2], JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => `${k} ${v.viewBox} (${v.d.length} симв.)`).join('\n'));
