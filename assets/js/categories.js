// Kategori listesi bu depodaki index.json ve packs/*.json'dan canlı okunur;
// yeni bir kategori eklendiğinde site de kendiliğinden güncellenir. Okuma
// başarısız olursa HTML'deki hazır liste kalır.
import { currentLang, t } from './lang.js';

// Uygulamadaki PremiumConfig.freeCategories ile aynı.
const FREE = new Set(['mixed']);

let packs = null;

async function load() {
  const index = await fetch('index.json', { cache: 'no-cache' }).then((r) => r.json());
  const entries = index.packs.filter((p) => p.enabled !== false);
  const loaded = await Promise.all(
    entries.map((entry) =>
      fetch(entry.file || `packs/${entry.id}.json`)
        .then((r) => r.json())
        .catch(() => null),
    ),
  );
  return loaded.filter((p) => p && Array.isArray(p.words));
}

function localized(names) {
  return names[currentLang()] ?? names.en ?? names.tr ?? '';
}

function render() {
  const list = document.getElementById('category-list');
  if (!list || !packs) return;
  const free = t('free', 'Ücretsiz');
  const lang = currentLang();

  list.replaceChildren(
    ...packs.map((pack) => {
      const li = document.createElement('li');
      li.className = `category${FREE.has(pack.id) ? ' category--free' : ''}`;
      const icon = document.createElement('span');
      icon.className = 'category__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = pack.icon ?? '🗂️';
      const name = document.createElement('span');
      name.textContent = localized(pack.name);
      const count = document.createElement('span');
      count.className = 'category__count';
      count.textContent = pack.words.length.toLocaleString(lang);
      li.append(icon, name, count);
      if (FREE.has(pack.id)) {
        const tag = document.createElement('span');
        tag.className = 'category__free';
        tag.textContent = free;
        li.append(tag);
      }
      return li;
    }),
  );

  const words = packs.reduce((sum, pack) => sum + pack.words.length, 0);
  const setStat = (name, value) => {
    const el = document.querySelector(`[data-stat="${name}"]`);
    if (el) el.textContent = value.toLocaleString(lang);
  };
  setStat('categories', packs.length);
  setStat('words', words);
}

export async function initCategories() {
  if (!document.getElementById('category-list')) return;
  document.addEventListener('langchange', render);
  try {
    packs = await load();
    if (packs.length) render();
  } catch {
    packs = null;
  }
}
