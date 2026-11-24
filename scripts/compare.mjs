// До/после рядом: node scripts/compare.mjs <src> <enhanced> <out.jpg> <ar> [gravity] [zoom: x,y,w,h в долях кадра]
// Слева оригинал (кадрирован так же, как при отправке, и растянут до размера результата), справа результат.
import sharp from 'sharp';
const [src, enh, out, ar, gravity = 'center', zoom] = process.argv.slice(2);
const [aw, ah] = ar.split(':').map(Number);
const m = await sharp(src).rotate().metadata();
const cw = Math.min(m.width, Math.round((m.height * aw) / ah)), ch = Math.min(m.height, Math.round((cw * ah) / aw));
const em = await sharp(enh).metadata();
let a = sharp(await sharp(src).rotate().resize(cw, ch, { fit: 'cover', position: gravity }).resize(em.width, em.height, { kernel: 'lanczos3' }).toBuffer());
let b = sharp(enh);
let w = em.width, h = em.height;
if (zoom) {
  const [x, y, zw, zh] = zoom.split(',').map(Number);
  const r = { left: Math.round(x * w), top: Math.round(y * h), width: Math.round(zw * w), height: Math.round(zh * h) };
  a = a.extract(r); b = b.extract(r); w = r.width; h = r.height;
} else { const k = 900 / h; w = Math.round(w * k); h = 900; a = a.resize(w, h); b = b.resize(w, h); }
await sharp({ create: { width: w * 2 + 12, height: h, channels: 3, background: '#c00' } })
  .composite([{ input: await a.jpeg({ quality: 92 }).toBuffer(), left: 0, top: 0 }, { input: await b.jpeg({ quality: 92 }).toBuffer(), left: w + 12, top: 0 }])
  .jpeg({ quality: 90 }).toFile(out);
console.log(out, `${w * 2 + 12}x${h}`);
