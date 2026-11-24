// Команда: імена, ролі, точки й напрями беруться з content/bloknot/services.json (поле staff кожної точки).
// Тут лише порядок, фото й дослівні цитати з Google (content/google/reviews-raw.md).
import type { ImageMetadata } from 'astro';
import bloknot from '../../content/bloknot/services.json' with { type: 'json' };
import olha from '../assets/team/olha.jpg';
import mariia from '../assets/team/mariia.jpg';
import olena from '../assets/team/olena.jpg';
import tetiana from '../assets/team/tetiana.jpg';
import vasylyna from '../assets/team/vasylyna.jpg';
import liliia from '../assets/team/liliia.jpg';
import ilona from '../assets/team/ilona.jpg';
import marta from '../assets/team/marta-t.jpg';

// Цитата з Google: place показує, з якої картки відгук; під цитатою це посилання на всі відгуки адреси
export type Quote = { text: string; by: string; place: 'Шевченка, 17' | 'Залізнична, 9' };
type Extra = { photo?: ImageMetadata; home?: Quote; quote?: Quote };

// Порядок: чотири майстри, яких найчастіше називають у відгуках, далі решта
const extra: Record<string, Extra> = {
  'Ольга': {
    photo: olha,
    home: { text: 'Перший майстер, який ідеально підібрав форму брів', by: 'Natalia Vidzivashets', place: 'Шевченка, 17' },
    quote: { text: 'Вона просто чарівниця: підібрала ідеальну форму брів, яка підкреслила риси обличчя, зробила корекцію та фарбування дуже природно й гармонійно.', by: 'Христина Брухаль', place: 'Шевченка, 17' },
  },
  'Марія': {
    photo: mariia,
    home: { text: 'Вже 5 років роблю манікюр тільки в Марії…', by: 'Білець Ольга', place: 'Шевченка, 17' },
    quote: { text: 'Окрема подяка Марії за завжди прекрасний манік і за терпіння з вибором кольору і за мої запізнення…', by: 'Anna Karaimchuk', place: 'Шевченка, 17' },
  },
  'Олена': {
    photo: olena,
    home: { text: 'Майстер Олена вразила бездоганною якістю роботи, професіоналізмом та уважністю до деталей.', by: 'Iryna Matvieieva', place: 'Шевченка, 17' },
    quote: { text: '…вже майже два роки роблю манікюр у майстра Олени, завжди акуратно, якісно і без шкоди для нігтів…', by: 'Natalia Vidzivashets', place: 'Шевченка, 17' },
  },
  'Тетяна': {
    photo: tetiana,
    home: { text: 'Фарбування перевершило всі мої очікування: колір вийшов ідеальним, саме таким, як я хотіла.', by: 'Ольга Штих', place: 'Шевченка, 17' },
    quote: { text: 'Дякую Тетяні, яка швиденько та гарненько мене підстригла.', by: 'Vi Rer', place: 'Шевченка, 17' },
  },
  'Василина': { photo: vasylyna, quote: { text: 'Майстер Василина топ! Швидко і дуже якісно', by: 'Katherine Lysenko', place: 'Шевченка, 17' } },
  'Лілія': { photo: liliia, quote: { text: 'Ходжу до Лілі давно, тут всі гарно роблять свою роботу, але Ліля робить це ще і швидко.', by: 'Maryna Ladzhun', place: 'Шевченка, 17' } },
  'Юлія': { quote: { text: 'Юлія — чудовий перукар, дуже уважна, професійна і завжди розуміє, який результат хочеться отримати.', by: 'Julia Martinyuk', place: 'Шевченка, 17' } },
  'Ілона': { photo: ilona, quote: { text: 'Окремо хочу відзначити Ілону за бровки: завжди ідеальна форма, акуратно, красиво та натурально.', by: 'Julia Martinyuk', place: 'Шевченка, 17' } },
  'Марта Т.': { photo: marta, quote: { text: 'Майстер Марта робить ідеальний манікюр…', by: 'Lina Miyo', place: 'Залізнична, 9' } },
  'Каріна': {},
  'Христина': {},
};

const [L, N] = bloknot.locations;
const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/ ,/g, ',').trim();
const staff = new Map<string, { role: string; at: ('L' | 'N')[]; areas: string[] }>();
for (const [key, loc] of [['L', L], ['N', N]] as const)
  for (const s of loc.staff) {
    const m = staff.get(s.name) ?? { role: clean(s.role), at: [], areas: [] };
    m.at.push(key);
    for (const c of s.categories) if (!m.areas.includes(c)) m.areas.push(c);
    staff.set(s.name, m);
  }
// Перевірка: склад у Bloknot і тут збігається
const names = Object.keys(extra);
const diff = [...staff.keys()].filter((n) => !names.includes(n)).concat(names.filter((n) => !staff.has(n)));
if (diff.length) throw new Error(`team: склад не збігається з Bloknot: ${diff.join(', ')}`);

// якорі на /komanda
const slug: Record<string, string> = { 'Ольга': 'olha', 'Марія': 'mariia', 'Олена': 'olena', 'Тетяна': 'tetiana', 'Василина': 'vasylyna', 'Лілія': 'liliia', 'Юлія': 'yuliia', 'Ілона': 'ilona', 'Марта Т.': 'marta', 'Каріна': 'karina', 'Христина': 'khrystyna' };
const where = (at: string[]) => (at.length === 2 ? 'Шевченка, 17 і Залізнична, 9' : at[0] === 'L' ? 'Шевченка, 17' : 'Залізнична, 9');
export const team = names.map((name) => {
  const s = staff.get(name)!;
  return { name, id: slug[name], role: s.role, at: s.at, where: where(s.at), cats: s.areas, areas: s.areas.join(', ').toLowerCase(), ...extra[name] };
});
export const leaders = team.slice(0, 4);
