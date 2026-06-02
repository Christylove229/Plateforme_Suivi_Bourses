import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');
const claudePath = path.join(dataDir, 'scholarships_claude_filtered_master_cyber_info.json');
const perplexityPath = path.join(dataDir, 'scholarships_perplexity_filtered_master_cyber_info.json');
const outputPath = path.join(dataDir, 'scholarships_master_cyber_info_final.json');

const allowedStatuses = new Set(['A_POSTULER', 'EN_COURS', 'SOUMIS', 'ACCEPTE', 'REFUSE']);
const allowedPriorities = new Set(['HAUTE', 'MOYENNE', 'FAIBLE']);

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const keyFor = (item) => {
  const name = normalizeText(item.nom);

  if (name.includes('eiffel')) return 'eiffel';
  if (name.includes('cybermacs') || (name.includes('erasmus') && name.includes('cyber'))) return 'cybermacs';
  if (name.includes('aims') && name.includes('deepmind')) return 'aims-deepmind';
  if (name.includes('epfl')) return 'epfl';
  if (name.includes('anso') || name.includes('ustc')) return 'anso-ustc';
  if (name.includes('prairie')) return 'prairie';
  if (name.includes('daad')) return 'daad';
  if (name.includes('fulbright')) return 'fulbright';
  if (name.includes('psl') && !name.includes('phd')) return 'psl-master';
  if (name.includes('carnegie') || name.includes('cmu africa') || name.includes('cmua')) return 'cmu-africa';
  if (name.includes('mext')) return 'mext';
  if (name.includes('kaist')) return 'kaist';
  if (name.includes('asu')) return 'asu-mastercard';
  if (name.includes('persyval')) return 'persyval';
  if (name.includes('gs uga') || name.includes('graduate school uga')) return 'gs-uga';
  if (name.includes('paris saclay') || name.includes('idex paris')) return 'paris-saclay-idex';
  if (name.includes('smart')) return 'smarts-up';
  if (name.includes('irmia')) return 'irmia';
  if (name.includes('mint')) return 'mint';
  if (name.includes('ares')) return 'ares';
  if (name.includes('uemoa')) return 'uemoa';
  if (name.includes('eth') || name.includes('esop')) return 'eth-esop';
  if (name.includes('unige')) return 'unige';
  if (name.includes('wbi')) return 'wbi';
  if (name.includes('csc')) return 'csc';
  if (name.includes('turkiye')) return 'turkiye';
  if (name.includes('institut galilee')) return 'galilee';

  return name;
};

const normalizeScholarship = (item) => ({
  nom: String(item.nom || '').trim(),
  pays: String(item.pays || '').trim(),
  organisation: String(item.organisation || '').trim(),
  lien_officiel: String(item.lien_officiel || '').trim(),
  date_debut: String(item.date_debut || '').trim(),
  date_fin: String(item.date_fin || '').trim(),
  criteres_eligibilite: String(item.criteres_eligibilite || '').trim(),
  pieces_demandees: Array.isArray(item.pieces_demandees)
    ? [...new Set(item.pieces_demandees.map((piece) => String(piece).trim()).filter(Boolean))]
    : [],
  priorite: allowedPriorities.has(item.priorite) ? item.priorite : 'MOYENNE',
  domaine: String(item.domaine || '').trim(),
  statut: allowedStatuses.has(item.statut) ? item.statut : 'A_POSTULER',
  notes: String(item.notes || '').trim(),
});

const score = (item) => {
  let value = 0;
  if (item.priorite === 'HAUTE') value += 3;
  if (item.statut === 'EN_COURS') value += 2;
  if (item.lien_officiel && !item.lien_officiel.includes('tinyurl') && !item.lien_officiel.includes('urlr.me')) value += 2;
  if (normalizeText(item.domaine).includes('cyber')) value += 2;
  if (item.notes.length > 120) value += 1;
  return value;
};

const mergeItems = (existing, incoming) => {
  const first = score(incoming) >= score(existing) ? incoming : existing;
  const second = first === incoming ? existing : incoming;

  return normalizeScholarship({
    ...second,
    ...first,
    pieces_demandees: [...new Set([...(first.pieces_demandees || []), ...(second.pieces_demandees || [])])],
    criteres_eligibilite: first.criteres_eligibilite.length >= second.criteres_eligibilite.length
      ? first.criteres_eligibilite
      : second.criteres_eligibilite,
    notes: `${first.notes}${second.notes && second.notes !== first.notes ? `\n\nComplément autre source : ${second.notes}` : ''}`,
  });
};

const claude = JSON.parse(fs.readFileSync(claudePath, 'utf8')).map(normalizeScholarship);
const perplexity = JSON.parse(fs.readFileSync(perplexityPath, 'utf8')).map(normalizeScholarship);
const mergedByKey = new Map();

for (const item of [...claude, ...perplexity]) {
  const key = keyFor(item);
  if (!mergedByKey.has(key)) {
    mergedByKey.set(key, item);
  } else {
    mergedByKey.set(key, mergeItems(mergedByKey.get(key), item));
  }
}

const priorityRank = { HAUTE: 0, MOYENNE: 1, FAIBLE: 2 };
const statusRank = { EN_COURS: 0, A_POSTULER: 1, SOUMIS: 2, ACCEPTE: 3, REFUSE: 4 };

const merged = [...mergedByKey.values()].sort((a, b) => {
  const priorityDiff = priorityRank[a.priorite] - priorityRank[b.priorite];
  if (priorityDiff) return priorityDiff;

  const statusDiff = statusRank[a.statut] - statusRank[b.statut];
  if (statusDiff) return statusDiff;

  return a.nom.localeCompare(b.nom, 'fr');
});

fs.writeFileSync(outputPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');

console.log(`Claude: ${claude.length}`);
console.log(`Perplexity: ${perplexity.length}`);
console.log(`Final: ${merged.length}`);
console.log(`Output: ${path.relative(root, outputPath)}`);
