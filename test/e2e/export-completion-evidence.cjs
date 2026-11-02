// Copies only real, passing Playwright output. It never renders mock screens.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const argument = (name) => {
  const at = process.argv.indexOf(name);
  return at >= 0 ? process.argv[at + 1] : undefined;
};
const source = argument('--browser-dir');
const destination = argument('--out');
if (!source || !destination)
  throw new Error(
    'Use --browser-dir /absolute/browser --out /absolute/gallery. Run the real browser tests first.',
  );
const browser = path.resolve(source),
  out = path.resolve(destination);
const report = JSON.parse(
  fs.readFileSync(path.join(browser, 'results.json'), 'utf8'),
);
const definitions = [
  {
    prefix: 'SST estrutura —',
    title: 'Encerramento e restauração na origem',
    video: 'fluxo-encerramento-restauracao',
    pictures: [
      [
        'estrutura-conflito-desktop.png',
        'Conflito com rascunho preservado',
        'Outra sessão altera a origem depois da prévia. A confirmação é recusada, conservando a data e o motivo.',
      ],
      [
        'estrutura-conflito-390.png',
        'Conflito em 390px',
        'Os campos e a orientação para uma nova prévia continuam disponíveis no celular.',
      ],
      [
        'estrutura-encerramento-390.png',
        'Preenchimento do encerramento após conflito',
        'Data e motivo são preservados; confirmar fica bloqueado até atualizar a prévia. O vídeo mostra a aplicação depois da nova conferência.',
      ],
      [
        'estrutura-restauracao-desktop.png',
        'Restauração com uma nova participação',
        'O cadastro é recuperado pela listagem de encerrados na própria origem, sem reabrir o intervalo anterior.',
      ],
      [
        'estrutura-restauracao-390.png',
        'Conferência da restauração em 390px',
        'A prévia informa o impacto antes de aplicar. Esta ação não transmite ao eSocial.',
      ],
      [
        'estrutura-prazo-aceito-desktop.png',
        'Prazo do S-2240 aceito, no painel existente',
        'O card identifica a produção restrita como simulação e esclarece que o aceite não comprova cumprimento do prazo. O teste usa dados, certificado e transporte sintéticos.',
      ],
      [
        'estrutura-prazo-aceito-390.png',
        'Aviso de prazo legível em 390px',
        'A mesma conferência é apresentada no celular, sem novos campos ou etapa de aprovação. Detalhes da regra ficam recolhidos; não se presume uma data quando o contexto precisa de conferência.',
      ],
    ],
  },
  {
    prefix: 'SST eventos —',
    title: 'Origem clínica, preparação e exclusão',
    video: 'fluxo-eventos-sst',
    pictures: [
      [
        'eventos-tox-origem-desktop.png',
        'Exame toxicológico no cadastro do empregado',
        'O exame é preenchido no Histórico de Exames, pela pessoa responsável pela origem clínica. Salvar não transmite.',
      ],
      [
        'eventos-tox-origem-390.png',
        'Campos do exame em 390px',
        'Data, laboratório, código e identificação do médico são informados na origem, com espaçamento entre os campos.',
      ],
      [
        'eventos-tox-origem-acoes-390.png',
        'Respostas e ações do exame',
        'A residência no exterior exige resposta explícita. Outro exame deve ser cadastrado como um novo registro.',
      ],
      [
        'eventos-tox-conflito-desktop.png',
        'Atualização concorrente do exame',
        'O rascunho é conservado e a gravação fica bloqueada até carregar explicitamente a versão atual.',
      ],
      [
        'eventos-tox-conflito-390.png',
        'Conflito do exame em 390px',
        'Carregar o exame atual descarta o rascunho, conforme o aviso. Nenhum recibo é inventado.',
      ],
      [
        'eventos-tox-preparacao-desktop.png',
        'S-2221 preparado a partir da origem',
        'O painel utiliza os dados do exame e mostra impedimentos e XML somente para consulta.',
      ],
      [
        'eventos-tox-preparacao-390.png',
        'Conferência do evento em 390px',
        'A preparação e a transmissão são ações distintas. O ambiente restrito é identificado.',
      ],
      [
        'eventos-tox-inativacao-390.png',
        'Inativação decidida na origem clínica',
        'A pessoa informa o motivo no próprio exame. Salvar conserva os dados e exige uma exclusão separada do recibo aceito; reativar depois não restaura esse recibo.',
      ],
      [
        'eventos-exclusao-desktop.png',
        'S-3000 com o recibo aceito selecionado',
        'O servidor deriva o tipo e os dados do evento a excluir. A origem, o XML e o recibo anterior continuam preservados.',
      ],
      [
        'eventos-exclusao-390.png',
        'Exclusão em 390px',
        'A exclusão só produz efeito depois de aceita. A confirmação não apaga o cadastro do empregado.',
      ],
    ],
  },
  {
    prefix: 'SST consultoria —',
    title: 'Consultoria opera a empresa atendida pelo contrato direto',
    video: 'fluxo-consultoria-envio',
    pictures: [
      [
        'consultoria-envio-desktop.png',
        'Envio acompanhado pela sessão da consultoria',
        'O operador conserva sua associação à consultoria. Os direitos atuais e o contrato direto permitem preparar e acompanhar a empresa atendida, sem associação fictícia ao cliente.',
      ],
      [
        'consultoria-envio-390.png',
        'Acompanhamento pela consultoria em 390px',
        'A inscrição completa confirmada e o recibo sintético pertencem à empresa atendida. A interface usa o mesmo painel existente.',
      ],
    ],
  },
];
const all = [];
function visit(suite) {
  for (const spec of suite.specs || [])
    for (const test of spec.tests || [])
      all.push({
        title: spec.title,
        result: test.results?.at(-1),
        expectedStatus: test.expectedStatus,
      });
  for (const child of suite.suites || []) visit(child);
}
for (const suite of report.suites || []) visit(suite);
const selected = definitions.map((definition) => {
  const matches = all.filter((item) =>
    item.title.startsWith(definition.prefix),
  );
  if (
    matches.length !== 1 ||
    matches[0].result?.status !== 'passed' ||
    (matches[0].expectedStatus && matches[0].expectedStatus !== 'passed')
  )
    throw new Error(
      `A real passing result is required for ${definition.prefix}`,
    );
  const test = matches[0],
    video = test.result.attachments?.find(
      (item) => item.contentType === 'video/webm',
    );
  if (!video?.path || !fs.existsSync(video.path))
    throw new Error(`Missing actual recording for ${definition.prefix}`);
  const directory = path.dirname(video.path);
  for (const [file] of definition.pictures)
    if (!fs.existsSync(path.join(directory, file)))
      throw new Error(`Missing actual screenshot: ${file}`);
  return { ...definition, test, originalVideo: video.path, directory };
});
fs.mkdirSync(out, { recursive: true });
const ffmpeg =
  spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
const evidence = selected.map((item) => {
  const pictures = item.pictures.map(([file, title, description]) => {
    const original = path.join(item.directory, file);
    fs.copyFileSync(original, path.join(out, file));
    return {
      file,
      title,
      description,
      sha256: createHash('sha256')
        .update(fs.readFileSync(original))
        .digest('hex'),
    };
  });
  const file = item.video + (ffmpeg ? '.mp4' : '.webm');
  if (ffmpeg) {
    const result = spawnSync(
      'ffmpeg',
      [
        '-y',
        '-i',
        item.originalVideo,
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
        path.join(out, file),
      ],
      { stdio: 'ignore' },
    );
    if (result.status !== 0)
      throw new Error(
        'Recording conversion failed; original evidence is intact.',
      );
  } else fs.copyFileSync(item.originalVideo, path.join(out, file));
  return {
    title: item.title,
    scenario: item.test.title,
    status: item.test.result.status,
    durationMs: item.test.result.duration,
    video: file,
    pictures,
  };
});
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  );
const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>eSocial — encerramentos e eventos SST</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f5f8;color:#1b2939;font:16px/1.55 system-ui,sans-serif}main{max-width:1240px;padding:32px 24px 56px;margin:auto}h1{font-size:30px;line-height:1.2;margin:8px 0 16px}h2{font-size:22px;margin:32px 0 12px}h3{font-size:18px;margin:0 0 10px}p{margin:0 0 18px;color:#45546a}.eyebrow{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#405d80}.stats{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0}.stats span{padding:10px 14px;background:#e6edf7;border-radius:10px}.card{background:white;border:1px solid #dde3ec;border-radius:14px;margin:24px 0;padding:24px}.card img{display:block;max-width:100%;height:auto;margin:0 auto;border:1px solid #e0e4ec;border-radius:8px}.phone img{width:390px}video{display:block;width:100%;max-height:680px;border-radius:8px;background:#152031}footer{font-size:14px;color:#59697d}@media(max-width:600px){main{padding:24px 16px}.card{padding:16px}h1{font-size:26px}}</style><main><div class="eyebrow">API e PostgreSQL reais · dados sintéticos</div><h1>Encerramentos e eventos SST nas telas existentes</h1><p>O cadastro de origem reúne os dados, datas e revisões. O painel do eSocial prepara e acompanha os envios. Os testes usam transporte e certificado sintéticos; não são transmissões oficiais.</p><div class="stats"><span>${evidence.length} fluxos de navegador aprovados</span><span>${evidence.reduce((sum, item) => sum + item.pictures.length, 0)} capturas reais</span><span>Desktop e 390px</span></div>${evidence.map((item) => `<h2>${escape(item.title)}</h2><section class="card"><h3>Vídeo integral do fluxo</h3><p>${escape(item.scenario)} · ${(item.durationMs / 1000).toFixed(1)}s</p><video controls playsinline preload="metadata" poster="${escape(item.pictures[0].file)}"><source src="${escape(item.video)}" type="video/${item.video.endsWith('.mp4') ? 'mp4' : 'webm'}"></video></section>${item.pictures.map((picture) => `<section class="card ${picture.file.includes('390') ? 'phone' : ''}"><h3>${escape(picture.title)}</h3><p>${escape(picture.description)}</p><a href="${escape(picture.file)}" target="_blank"><img src="${escape(picture.file)}" alt="${escape(picture.title)}" loading="lazy"></a></section>`).join('')}`).join('')}<footer>Capturas copiadas exclusivamente das ${evidence.length} execuções aprovadas no relatório do Playwright. Largura de celular no Chrome; esta galeria não representa uma nova rodada de testes nativos. Sem deploy ou transmissão oficial.</footer></main></html>`;
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(
  path.join(out, 'evidence.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      report: path.join(browser, 'results.json'),
      scenarios: evidence,
    },
    null,
    2,
  ),
);
console.log(path.join(out, 'index.html'));
