// Факти про салон. Адреси, телефони, години й рейтинги Bloknot беруться з content/bloknot/services.json (21.11.2026),
// рейтинги Google з content/google/reviews.md. Посилання, зібрані самостійно, позначені «ПЕРЕВІРИТИ».
import bloknot from '../../content/bloknot/services.json' with { type: 'json' };

const [L, N] = bloknot.locations;
const tel = (p: string) => ({ href: `tel:+38${p}`, text: `${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6, 8)} ${p.slice(8)}` });
// ПЕРЕВІРИТИ: маршрут зібрано з координат Bloknot
const route = (geo: string) => `https://www.google.com/maps/dir/?api=1&destination=${geo}`;
// Картка Google одразу на вкладці «Відгуки» (!9m1!1b1). Ідентифікатори зняті з Google Maps 24.11.2026
const greviews = (ftid: string, lat: string, lng: string, kg: string) =>
  `https://www.google.com/maps/place/${encodeURIComponent('Салон краси Атмосфера')}/@${lat},${lng},17z/data=!4m8!3m7!1s${ftid}!8m2!3d${lat}!4d${lng}!9m1!1b1!16s${encodeURIComponent(kg)}?hl=uk`;

export const salon = {
  booking: bloknot.source, // вибір закладу
  instagram: 'https://www.instagram.com/atmosfera_lv/',
  direct: 'https://ig.me/m/atmosfera_lv', // ПЕРЕВІРИТИ: зібрано з імені акаунта
  // Пн–сб 10:00–20:00, нд 10:00–18:00, записано словами, щоб у рядку не стояло чотири тире
  hours: [
    { days: 'щодня', time: 'з 10:00 до 20:00' },
    { days: 'у неділю', time: 'до 18:00' },
  ],
};

export const places = [
  {
    id: 'shevchenka', key: 'L' as const, name: L.name, short: 'Шевченка, 17', where: 'на Шевченка', to: 'на Шевченка', address: 'вул. Тараса Шевченка, 17',
    since: 'з червня 2020', phone: tel(L.phone), booking: L.url, route: route(L.geo),
    bloknot: { rating: L.rating, reviews: L.reviews }, google: { rating: 4.9, reviews: 274, url: greviews('0x473add1edf0e39d5:0xee095db91c1c2c08', '49.8441987', '24.0096542', '/g/11k74v8v8w') },
  },
  {
    id: 'zaliznychna', key: 'N' as const, name: N.name, short: 'Залізнична, 9', where: 'на Залізничній', to: 'на Залізничну', address: 'вул. Залізнична, 9',
    since: 'з жовтня 2022', phone: tel(N.phone), booking: N.url, route: route(N.geo),
    bloknot: { rating: N.rating, reviews: N.reviews }, google: { rating: 4.6, reviews: 48, url: greviews('0x473addf7337af3bd:0x26fbd0c54f9a43b7', '49.8469924', '23.9956797', '/g/11vb4f8smm') },
  },
];

// Внутрішнє посилання з урахуванням base (сайт лежить у підпапці GitHub Pages): to('/tsiny') → /Atmosfera-beauty-lounge/tsiny
export const to = (path: string) => import.meta.env.BASE_URL.replace(/\/$/, '') + path;
export const uah =(n: number) => `${n.toLocaleString('uk-UA').replace(/ | /g, ' ')} ₴`;
export const rate = (n: number) => n.toFixed(1).replace('.', ',');
