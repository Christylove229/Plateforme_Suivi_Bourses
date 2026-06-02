import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node scripts/generate-scholarships-import-sql.mjs <user_id>');
  process.exit(1);
}

const dataPath = path.join(root, 'src', 'data', 'scholarships_master_cyber_info_final.json');
const outputPath = path.join(root, 'src', 'data', 'import_scholarships_for_user.sql');
const scholarships = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const sqlString = (value) => `'${String(value ?? '').replace(/'/g, "''")}'`;
const sqlArray = (values) => `ARRAY[${values.map(sqlString).join(', ')}]::text[]`;

const rows = scholarships.map((item) => `(
  ${sqlString(userId)},
  ${sqlString(item.nom)},
  ${sqlString(item.pays)},
  ${sqlString(item.organisation)},
  ${sqlString(item.lien_officiel)},
  ${sqlString(item.date_debut)}::date,
  ${sqlString(item.date_fin)}::date,
  ${sqlString(item.criteres_eligibilite)},
  ${sqlArray(item.pieces_demandees || [])},
  ${sqlString(item.priorite)},
  ${sqlString(item.domaine)},
  ${sqlString(item.statut)},
  ${sqlString(item.notes || '')}
)`).join(',\n');

const sql = `BEGIN;

INSERT INTO public.scholarships (
  user_id,
  nom,
  pays,
  organisation,
  lien_officiel,
  date_debut,
  date_fin,
  criteres_eligibilite,
  pieces_demandees,
  priorite,
  domaine,
  statut,
  notes
)
VALUES
${rows};

COMMIT;
`;

fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Generated ${scholarships.length} scholarships for user ${userId}`);
console.log(path.relative(root, outputPath));
