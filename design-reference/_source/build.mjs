import fs from 'node:fs';
import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const out = process.argv[2];
const core = fs.readFileSync(path.join(here, 'core.html'), 'utf8');
const list = [
  { id: 'signature', num: '01', name: 'Signature', layout: 'signature' },
  { id: 'meridian', num: '02', name: 'Meridian', layout: 'tabs' },
  { id: 'harbor', num: '03', name: 'Harbor', layout: 'sidebar' },
  { id: 'orbit', num: '04', name: 'Orbit', layout: 'rail' },
  { id: 'atlas', num: '05', name: 'Atlas', layout: 'split' },
  { id: 'horizon', num: '06', name: 'Horizon', layout: 'float' },
].map(d => ({ ...d, file: `${d.num} ${d.name}.html` }));
for (const d of list) {
  const cfg = JSON.stringify({ ...d, list: list.map(({ id, num, name, file }) => ({ id, num, name, file })) });
  const html = core.split('__TITLE__').join(d.name).split('__LAYOUT__').join(d.layout).split('/*__CFG__*/').join(cfg);
  fs.writeFileSync(path.join(out, d.file), html);
  console.log('wrote', d.file, html.length);
}
