const {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} = require('node:fs');
const {
  resolve,
  join,
  basename,
  dirname,
  relative,
  sep,
} = require('node:path');
const { spawnSync } = require('node:child_process');
function exportEvidence(browserDir) {
  const reportPath = join(browserDir, 'results.json');
  if (!existsSync(reportPath)) return;
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  const out = join(browserDir, '3.0');
  mkdirSync(out, { recursive: true });
  const available =
    spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
  const evidence = [];
  function visit(suite) {
    for (const spec of suite.specs || [])
      for (const test of spec.tests || []) {
        const result = test.results.at(-1);
        const video = result?.attachments.find(
          (a) => a.contentType === 'video/webm',
        );
        const number = String(evidence.length + 1).padStart(2, '0');
        const slug = spec.title
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 90);
        let file = video?.path;
        if (available && file && existsSync(file)) {
          const output = join(out, `${number}-${slug || 'cenario'}.mp4`);
          const converted = spawnSync(
            'ffmpeg',
            [
              '-y',
              '-i',
              file,
              '-an',
              '-c:v',
              'libx264',
              '-preset',
              'fast',
              '-crf',
              '25',
              '-pix_fmt',
              'yuv420p',
              '-movflags',
              '+faststart',
              '-threads',
              '2',
              output,
            ],
            { stdio: 'ignore' },
          );
          if (converted.status !== 0)
            throw new Error(`Video conversion failed: ${number}`);
          file = output;
        }
        evidence.push({
          title: spec.title,
          status: result?.status,
          durationMs: result?.duration,
          video: file,
        });
      }
    for (const child of suite.suites || []) visit(child);
  }
  for (const suite of report.suites || []) visit(suite);
  let completeVideo;
  if (
    available &&
    evidence.length &&
    evidence.every((e) => e.video?.endsWith('.mp4'))
  ) {
    const playlist = join(out, 'playlist.txt');
    writeFileSync(
      playlist,
      evidence.map((e) => `file '${basename(e.video)}'`).join('\n'),
    );
    completeVideo = join(out, '00-execucao-completa.mp4');
    const combined = spawnSync(
      'ffmpeg',
      [
        '-y',
        '-f',
        'concat',
        '-safe',
        '1',
        '-i',
        playlist,
        '-c',
        'copy',
        '-movflags',
        '+faststart',
        completeVideo,
      ],
      { stdio: 'ignore' },
    );
    if (combined.status !== 0)
      throw new Error('Could not combine scenario videos');
  }
  writeFileSync(
    join(out, 'index.json'),
    JSON.stringify(
      { stats: report.stats, completeVideo, scenarios: evidence },
      null,
      2,
    ),
  );
  writeFileSync(
    join(out, 'README.md'),
    '# 3.0 — Evidências do navegador\n\n' +
      evidence
        .map(
          (e) =>
            `- ${e.status}: [${e.title}](${e.video}) (${(e.durationMs / 1000).toFixed(1)}s)`,
        )
        .join('\n') +
      '\n\nVídeos completos das execuções, sem cortes. Fonte original WebM, screenshots e traces preservados em ../results; relatório em ../report.\n',
  );
  writeEvidenceGallery(browserDir);
  return evidence;
}

function writeEvidenceGallery(browserDir) {
  const out = join(browserDir, '3.0');
  const index = JSON.parse(readFileSync(join(out, 'index.json'), 'utf8'));
  const report = JSON.parse(
    readFileSync(join(browserDir, 'results.json'), 'utf8'),
  );
  const pictures = new Map();
  function visit(suite) {
    for (const spec of suite.specs || [])
      for (const test of spec.tests || []) {
        const video = test.results
          .at(-1)
          ?.attachments.find((a) => a.contentType === 'video/webm')?.path;
        if (video && existsSync(dirname(video)))
          pictures.set(
            spec.title,
            readdirSync(dirname(video))
              .filter((name) => name.endsWith('.png'))
              .map((name) => join(dirname(video), name)),
          );
      }
    for (const child of suite.suites || []) visit(child);
  }
  for (const suite of report.suites || []) visit(suite);
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );
  const url = (file) =>
    relative(out, file).split(sep).map(encodeURIComponent).join('/');
  const passed = index.scenarios.filter(
    (scenario) => scenario.status === 'passed',
  ).length;
  const sections = index.scenarios
    .map(
      (scenario) =>
        `<section><h2>${escape(scenario.title)}</h2><p class="${scenario.status === 'passed' ? 'pass' : 'fail'}">${scenario.status === 'passed' ? 'Aprovado' : escape(scenario.status)} · ${(scenario.durationMs / 1000).toFixed(1)} s</p>${scenario.video ? `<video controls preload="metadata" src="${url(scenario.video)}"></video>` : ''}<details><summary>Ver prints do cenário</summary><div class="pictures">${(pictures.get(scenario.title) || []).map((file) => `<a href="${url(file)}" target="_blank" rel="noopener"><img loading="lazy" src="${url(file)}" alt="${escape(basename(file))}"><span>${escape(basename(file))}</span></a>`).join('')}</div></details></section>`,
    )
    .join('');
  writeFileSync(
    join(out, 'index.html'),
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Testes web · eSocial SST</title><style>body{font:16px/1.5 system-ui,sans-serif;color:#192739;background:#f4f6f9;margin:0}main{max-width:1200px;padding:32px;margin:auto}h1{font-size:28px}h2{font-size:19px}section{background:white;border:1px solid #d8dfe8;border-radius:12px;padding:24px;margin:24px 0}video{width:100%;max-height:650px;background:#111;border-radius:8px}.pass{color:#137344}.fail{color:#b42525}summary{cursor:pointer;padding:16px 0;font-weight:600}.pictures{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}.pictures img{width:100%;border:1px solid #ddd}.pictures a{color:#245c91;text-decoration:none;overflow:hidden}.pictures span{display:block;font-size:13px;overflow-wrap:anywhere}</style><main><h1>Testes web · eSocial SST</h1><p><strong>${passed}/${index.scenarios.length} cenários aprovados.</strong> Navegador, autenticação, API e PostgreSQL reais; dados e certificados sintéticos. Nenhum envio ao governo nesta execução.</p>${index.completeVideo ? `<h2>Execução completa, sem cortes</h2><video controls preload="metadata" src="${url(index.completeVideo)}"></video>` : ''}${sections}<p>Os relatórios, os vídeos originais, os prints e os traces completos estão preservados na pasta desta execução.</p></main></html>`,
  );
}
module.exports = { exportEvidence, writeEvidenceGallery };
if (require.main === module) {
  if (!process.argv[2])
    throw new Error(
      'Usage: node test/e2e/export-evidence.cjs /absolute/path/to/browser',
    );
  exportEvidence(resolve(process.argv[2]));
}
