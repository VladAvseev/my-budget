/* global console */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseFile = join(root, 'supabase', 'base.sql');
const outFile = join(root, 'supabase', 'functions.sql');

const collect = (dir) => {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collect(full));
    } else if (entry.name.endsWith('.sql')) {
      files.push(full);
    }
  }
  return files;
};

const base = readFileSync(baseFile, 'utf8');
const hookSql = collect(join(root, 'src'))
  .sort((a, b) => a.localeCompare(b))
  .map((file) => `-- Источник: ${relative(root, file).split('\\').join('/')}\n${readFileSync(file, 'utf8').trim()}`);

const header = `-- Собранный файл функций БД. Генерируется скриптом: npm run sql:collect.\n-- Не редактировать вручную — изменения вносятся в .sql рядом с хуками и в supabase/base.sql.\n`;

const parts = [
  '-- ── Инфраструктура (supabase/base.sql) ────────────────────────────────────',
  base.trim(),
  ...hookSql.map((sql) => `-- ────────────────────────────────────────────────────────────────────────────\n${sql}`),
];

writeFileSync(outFile, `${header}\n${parts.join('\n\n')}\n`, 'utf8');
console.log(`Собран supabase/functions.sql (${parts.length} блоков)`);