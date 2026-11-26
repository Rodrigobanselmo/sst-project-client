import { normalizeReportSnapshotProperty } from './campaign-report.html-style';
import DOMPurify from 'dompurify';
import { campaignReportPrintCss } from './campaign-report.print';
import { REPORT_HTML_RUNTIME } from './campaign-report.html-runtime';

const VISUAL_PROPERTIES = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'opacity',
  'width',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'display',
  'flex-direction',
  'flex-wrap',
  'align-items',
  'justify-content',
  'gap',
  'grid-template-columns',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'white-space',
  'color',
  'background-color',
  'border-top',
  'border-bottom',
  'border-left',
  'border-right',
  'border-radius',
  'padding',
  'margin',
  'max-width',
  'min-height',
  'box-shadow',
  'vertical-align',
  'list-style-type',
  'overflow-wrap',
];
const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );

async function embeddedImage(
  src: string,
  illustration: boolean,
): Promise<string> {
  const url = new URL(src, window.location.href);
  if (!['https:', 'http:', 'blob:', 'data:'].includes(url.protocol))
    throw new Error('Imagem com endereço inválido.');
  // Use the existing Next image pipeline for the public brand store, whose
  // browser image response does not allow CORS reads. Never proxy arbitrary URLs.
  const imageUrl =
    url.protocol === 'https:' && url.hostname === 'simplesst.s3.amazonaws.com'
      ? `/_next/image?url=${encodeURIComponent(url.href)}&w=1200&q=75`
      : url.href;
  const response = await fetch(imageUrl, {
    credentials: url.origin === location.origin ? 'same-origin' : 'omit',
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(
      'Não foi possível incorporar uma imagem. Atualize o relatório e tente novamente.',
    );
  const blob = await response.blob();
  if (!blob.type.startsWith('image/') || blob.size > 20 * 1024 * 1024)
    throw new Error('Uma imagem não pôde ser incorporada ao HTML.');
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const canvas = document.createElement('canvas');
    const scale = Math.min(
      1,
      1600 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível preparar a imagem.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return illustration
      ? canvas.toDataURL('image/jpeg', 0.9)
      : canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function createCampaignReportHtml(
  article: HTMLElement,
  title: string,
) {
  const clone = article.cloneNode(true) as HTMLElement;
  const sourceNodes = [article, ...article.querySelectorAll('*')];
  const copiedNodes = [clone, ...clone.querySelectorAll('*')];
  const rules = new Map<string, string>();
  sourceNodes.forEach((source, i) => {
    const copy = copiedNodes[i];
    const style = getComputedStyle(source);
    const visual =
      VISUAL_PROPERTIES.map((key) => {
        return (
          key +
          ':' +
          normalizeReportSnapshotProperty(key, style.getPropertyValue(key), {
            html: source instanceof HTMLElement,
            inlineWidth:
              source instanceof HTMLElement ? source.style.width : '',
          })
        );
      }).join(';') +
      (source.tagName === 'DIV' && !source.textContent?.trim()
        ? ';height:' + style.height
        : '');
    let className = rules.get(visual);
    if (!className) {
      className = 'r' + rules.size;
      rules.set(visual, className);
    }
    // Keep semantic print hooks, but no application styling or event attributes.
    copy.setAttribute(
      'class',
      [
        className,
        ...[...source.classList].filter((c) =>
          c.startsWith('campaign-report-'),
        ),
      ].join(' '),
    );
    copy.removeAttribute('style');
    copy.removeAttribute('id');
    copy.removeAttribute('name');
    [...copy.attributes].forEach((attr) => {
      if (
        /^on/i.test(attr.name) ||
        ['srcset', 'sizes', 'formaction', 'action', 'ping'].includes(attr.name)
      )
        copy.removeAttribute(attr.name);
    });
    if (copy instanceof SVGSVGElement && !copy.hasAttribute('viewBox')) {
      const r = source.getBoundingClientRect();
      if (r.width && r.height)
        copy.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    }
  });
  clone
    .querySelectorAll(
      '[data-radar-controls],[data-comparison-controls],script,style,link,iframe,object,embed,form,input,select,button',
    )
    .forEach((el) => el.remove());
  clone.querySelectorAll('[href]').forEach((el) => {
    if (!el.getAttribute('href')?.startsWith('#')) el.removeAttribute('href');
  });
  const images = [...clone.querySelectorAll('img')];
  const cache = new Map<string, Promise<string>>();
  for (const img of images) {
    const src = img.getAttribute('src');
    if (!src) throw new Error('Uma imagem do relatório ainda não carregou.');
    if (!cache.has(src))
      cache.set(
        src,
        embeddedImage(src, img.alt.startsWith('Ilustração conceitual:')),
      );
    img.src = await cache.get(src)!;
    img.removeAttribute('loading');
    img.removeAttribute('crossorigin');
  }
  const content = DOMPurify.sanitize(clone.outerHTML, {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
    FORBID_TAGS: [
      'script',
      'style',
      'link',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'select',
      'button',
    ],
    FORBID_ATTR: ['srcset', 'formaction', 'action', 'ping'],
  });
  const css = [...rules]
    .map(([style, name]) => '.' + name + '{' + style + '}')
    .join('\n');
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(REPORT_HTML_RUNTIME),
  );
  const hash = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'sha256-${hash}'; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>${escape(title)}</title><style>
${css}
html{scroll-behavior:smooth;color-scheme:dark}body{margin:0;background:#111827;color:#e5e7eb;font:16px Arial,sans-serif}*{box-sizing:border-box}main{position:relative;max-width:1600px;margin:auto;padding:24px 24px 100px}article{width:100%;max-width:100%!important}article img{max-width:100%;height:auto;object-fit:contain}article svg{max-width:100%;height:auto}article table{max-width:100%;overflow-wrap:anywhere}article summary{cursor:pointer}article h2,article h3{scroll-margin-top:90px}article div,article section,article details{min-width:0;max-width:100%}article details:not([open])>:not(summary){display:none}#bar{position:sticky;top:0;z-index:8;background:#111827f5;border-bottom:1px solid #374151;padding:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}button,summary,input{font:inherit}#bar button,.floating button,.floating>summary{border:1px solid #64748b;border-radius:8px;background:#1f2937;color:#f9fafb;padding:8px 12px;cursor:pointer}button:focus-visible,summary:focus-visible{outline:3px solid #facc15;outline-offset:2px}button[aria-pressed=true]{outline:2px solid #facc15}#message{font-size:13px;color:#cbd5e1}#ink{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:3}.floating{position:fixed;bottom:16px;z-index:9;background:#1f2937;border:1px solid #475569;border-radius:12px;padding:10px;max-width:calc(100vw - 24px)}.floating>summary{list-style:none}#navigation{left:12px}#annotations{right:12px}#contents,#tools{max-height:60vh;overflow:auto;width:320px;max-width:calc(100vw - 48px);padding:10px 0;display:flex;gap:8px;flex-wrap:wrap}#contents{display:block}#contents button{display:block;width:100%;text-align:left;margin-bottom:4px}#tools label{display:flex;align-items:center;gap:8px}#tools p{font-size:12px;margin:4px}#print-copy{display:none}@media(max-width:700px){main{padding:12px 12px 90px}article{font-size:16px}article [data-illustrated-slide]{display:block!important}article [data-slide-image]{max-width:100%!important}article [data-slide-text]{max-width:100%!important}article table{display:block;overflow-x:auto}}

/* Grid children must fill their track, not reuse the width measured in the app. */
article [data-export-distribution]{width:auto!important;max-width:100%!important;min-width:0!important}
article [data-distribution-row]{display:grid!important;grid-template-columns:minmax(120px,28%) minmax(0,1fr) 104px!important;column-gap:16px!important;row-gap:6px!important;align-items:center!important;width:100%!important;min-width:0!important}
article [data-distribution-row]>div{width:auto!important;min-width:0!important;max-width:100%!important;grid-column:auto!important;grid-row:auto!important}
article [data-distribution-label]{overflow-wrap:anywhere!important}
article [data-distribution-plot]{height:auto!important}
article [data-distribution-plot] svg{display:block!important;width:100%!important;max-width:100%!important;height:30px!important;overflow:hidden!important}
article [data-distribution-value]{text-align:right!important;white-space:nowrap!important}
article [data-distribution-axis]{width:auto!important;margin-left:calc(28% + 16px)!important;margin-right:120px!important}
article [data-distribution-axis] span{width:auto!important;white-space:nowrap!important}
@media screen and (max-width:600px){article [data-distribution-row]{grid-template-columns:minmax(0,1fr) 104px!important}article [data-distribution-plot]{grid-column:1 / -1!important;grid-row:2!important}article [data-distribution-value]{grid-column:2!important;grid-row:1!important}article [data-distribution-axis]{margin-left:0!important;margin-right:0!important}}

@media print { ${campaignReportPrintCss('portrait')} #bar,main,.floating{display:none!important}#print-copy{display:block!important} }
</style><style id="orientation" media="print"></style></head><body><header id="bar"><button id="fullscreen" title="Entrar em tela cheia; Esc para sair">Tela cheia</button><button data-print="portrait">PDF em retrato</button><button data-print="landscape">PDF em paisagem</button><span id="message">Apresentação independente · Clique em Tela cheia; Esc para sair. Na impressão, escolha “Salvar como PDF”.</span></header><main>${content}<svg id="ink" aria-hidden="true"></svg></main><details id="navigation" class="floating"><summary>☰ Sumário</summary><nav id="contents" aria-label="Sumário do relatório"></nav></details><details id="annotations" class="floating"><summary>✎ Anotar</summary><div id="tools" role="group" aria-label="Ferramentas de anotação"><button data-tool="pointer" title="Navegar e clicar no relatório">Navegar</button><button data-tool="pen" title="Desenhar à mão livre">Caneta</button><button data-tool="marker" title="Destacar com transparência">Marca-texto</button><button data-tool="eraser" title="Clique ou arraste sobre uma marca para apagá-la">Borracha</button><label>Cor <input id="color" type="color" value="#facc15"></label><label>Espessura <input id="size" type="range" min="1" max="12" value="4"></label><button id="undo">Desfazer</button><button id="clear">Limpar</button><p>Marcas temporárias, fora do PDF. Reabrir o arquivo ou mudar o layout limpa as marcas. Use Navegar para clicar no conteúdo.</p></div></details><script>${REPORT_HTML_RUNTIME}</script></body></html>`;
}
