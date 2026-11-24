// Остаток ключа OpenRouter и модели с выводом изображений: node --env-file=.env scripts/or-info.mjs
const h = { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` };
const key = await (await fetch('https://openrouter.ai/api/v1/key', { headers: h })).json();
const { label, ...safe } = key.data ?? key; // label содержит кусок ключа, не печатаем
console.log('key:', JSON.stringify(safe));
const models = (await (await fetch('https://openrouter.ai/api/v1/models')).json()).data;
for (const m of models.filter((m) => m.architecture?.output_modalities?.includes('image')))
  console.log(m.id, '|', m.architecture.input_modalities.join('+'), '→', m.architecture.output_modalities.join('+'), '|', JSON.stringify(m.pricing));
