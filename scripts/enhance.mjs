// AI-доработка одного кадра через OpenRouter (POST /api/v1/images, image-to-image).
// node --env-file=.env scripts/enhance.mjs <src> <outName> <ar> <resolution> <model> "<prompt>" [gravity]
//   ar: 3:4 | 4:5 | 9:16 … Исходник сначала кадрируется в это соотношение, чтобы модель ничего не дорисовывала по краям.
//   gravity: north | south | east | west | center (куда прижать кадрирование), по умолчанию center.
// Результат: content/photos/enhanced/<outName>.jpg, запись о запуске в content/photos/enhanced/runs.jsonl.
// Оригиналы не меняются. Ключ не печатается.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const [src, outName, ar, resolution, model, prompt, gravity = 'center'] = process.argv.slice(2);
if (!prompt) throw new Error('usage: enhance.mjs <src> <outName> <ar> <resolution> <model> "<prompt>" [gravity]');
const OUT = 'content/photos/enhanced';
const BUDGET_STOP = 2.5; // $ от стартового usage, бриф §5
const START_USAGE = 0.1474225; // usage ключа на старте работы (2026-11-23)
const headers = { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' };

const spent = async () => (await (await fetch('https://openrouter.ai/api/v1/key', { headers })).json()).data.usage - START_USAGE;
const before = await spent();
if (before >= BUDGET_STOP) throw new Error(`бюджет исчерпан: потрачено $${before.toFixed(3)}`);

// кадрируем исходник в целевое соотношение
const [aw, ah] = ar.split(':').map(Number);
const meta = await sharp(src).rotate().metadata();
const [W, H] = meta.orientation >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
const cw = Math.min(W, Math.round((H * aw) / ah)), ch = Math.min(H, Math.round((cw * ah) / aw));
const input = await sharp(src).rotate().resize(cw, ch, { fit: 'cover', position: gravity }).jpeg({ quality: 95 }).toBuffer();

const res = await fetch('https://openrouter.ai/api/v1/images', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model, prompt, aspect_ratio: ar, resolution, n: 1, output_format: 'png',
    input_references: [{ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${input.toString('base64')}` } }],
  }),
});
const json = await res.json();
if (!res.ok || !json.data?.[0]?.b64_json) {
  console.error('ошибка', res.status, JSON.stringify(json).slice(0, 600));
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, outName + '.jpg');
const out = sharp(Buffer.from(json.data[0].b64_json, 'base64'));
const om = await out.metadata();
await out.jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toFile(file);
const after = await spent();
const run = { date: new Date().toISOString(), src, input: `${cw}x${ch}`, out: file.replace(/\\/g, '/'), size: `${om.width}x${om.height}`, model, resolution, ar, cost: json.usage?.cost ?? null, spentTotal: +after.toFixed(4), prompt };
fs.appendFileSync(path.join(OUT, 'runs.jsonl'), JSON.stringify(run) + '\n');
console.log(`${file}  ${run.input} → ${run.size}  cost $${run.cost}  всего потрачено $${run.spentTotal} из 3`);
