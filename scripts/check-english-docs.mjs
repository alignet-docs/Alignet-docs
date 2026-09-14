import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const config = JSON.parse(read('docs.json'));
const pages = value => {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(item => typeof item === 'string' ? [item] : pages(item));
  return Object.entries(value).flatMap(([key, item]) => key === 'pages' || typeof item === 'object' ? pages(item) : []);
};
const spanish = pages(config.navigation.languages.find(item => item.language === 'es'));
const english = pages(config.navigation.languages.find(item => item.language === 'en'));
const errors = [];
if (spanish.length !== english.length) errors.push(`Navigation count mismatch: ${spanish.length} Spanish, ${english.length} English`);
for (const page of english) {
  if (!page.startsWith('en/')) errors.push(`English navigation points outside en/: ${page}`);
  if (!fs.existsSync(path.join(root, `${page}.mdx`))) errors.push(`Missing page: ${page}`);
}
const spec = JSON.parse(read('openapi-en.json'));
const slug = value => value.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');
const apiPages = new Set();
for (const item of Object.values(spec.paths)) for (const operation of Object.values(item)) {
  if (operation?.summary) apiPages.add(`en/api-reference/${slug(operation.tags?.[0] || '')}/${slug(operation.summary)}`);
}
const redirects = new Map((config.redirects || []).map(item => [item.source, item.destination]));
const files = fs.readdirSync(path.join(root, 'en'), { recursive: true }).filter(file => file.endsWith('.mdx'));
let links = 0;
for (const file of files) {
  const content = read(`en/${file}`);
  if (!/^---\n[\s\S]*?\btitle:\s*\S[\s\S]*?\bdescription:\s*\S[\s\S]*?\n---/.test(content)) errors.push(`Missing title/description: en/${file}`);
  for (const match of content.matchAll(/(?:href="|\]\()([^"\s)]+)/g)) {
    let target = match[1].split('#')[0];
    if (!target.startsWith('/')) continue;
    links++;
    const visited = new Set();
    while (redirects.has(target) && !visited.has(target)) { visited.add(target); target = redirects.get(target); }
    if (!target.startsWith('/en/') && !target.startsWith('/images/')) errors.push(`Non-English internal link in en/${file}: ${target}`);
    const relative = target.slice(1);
    if (!fs.existsSync(path.join(root, relative)) && !fs.existsSync(path.join(root, `${relative}.mdx`)) && !apiPages.has(relative)) errors.push(`Missing target in en/${file}: ${target}`);
  }
}
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exitCode = 1; }
else console.log(`English coverage OK: ${english.length}/${spanish.length} navigation pages, ${files.length} MDX files, ${links} internal links.`);
