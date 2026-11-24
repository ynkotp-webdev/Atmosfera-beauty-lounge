// Страховка от «ретуши ИИ»: цвет, свет и формы берём из оригинала, из результата ИИ только мелкую детализацию.
// out = ИИ − blur(ИИ) + blur(оригинал, растянутый до размера ИИ). Так модель не может сдвинуть тон кожи или цвет глаз.
// node scripts/merge.mjs <src> <enhanced> <out.jpg> <ar> [gravity=center] [k=1.5]   (sigma = k × коэффициент увеличения)
import sharp from 'sharp';
const [src, enh, out, ar, gravity = 'center', k = '1.5'] = process.argv.slice(2);
const [aw, ah] = ar.split(':').map(Number);
const m = await sharp(src).rotate().metadata();
const cw = Math.min(m.width, Math.round((m.height * aw) / ah)), ch = Math.min(m.height, Math.round((cw * ah) / aw));
const em = await sharp(enh).metadata();
const sigma = Math.max(1, +k * (em.width / cw));
const raw = (s) => s.removeAlpha().raw().toBuffer();
const up = await sharp(src).rotate().resize(cw, ch, { fit: 'cover', position: gravity }).resize(em.width, em.height, { kernel: 'lanczos3' }).toBuffer();
const [E, lowE, lowO] = await Promise.all([raw(sharp(enh)), raw(sharp(enh).blur(sigma)), raw(sharp(up).blur(sigma))]);
const o = Buffer.alloc(E.length);
for (let i = 0; i < E.length; i++) o[i] = Math.max(0, Math.min(255, E[i] - lowE[i] + lowO[i]));
await sharp(o, { raw: { width: em.width, height: em.height, channels: 3 } }).jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toFile(out);
console.log(out, `${em.width}x${em.height}`, 'sigma', sigma.toFixed(1));
