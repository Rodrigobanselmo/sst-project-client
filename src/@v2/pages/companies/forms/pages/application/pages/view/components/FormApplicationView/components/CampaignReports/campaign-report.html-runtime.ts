// Trusted, fixed runtime. Report content is never interpolated into JavaScript.
export const REPORT_HTML_RUNTIME = String.raw`
(() => {
  const main = document.querySelector('main');
  const article = main.querySelector('article');
  article.addEventListener('click', event => {
    const trigger = event.target.closest('[data-table-expand], [data-report-table-preview] tbody tr:nth-child(n+5)');
    if (!trigger) return;
    const container = trigger.closest('[data-report-table-preview]');
    if (!container) return;
    event.preventDefault();
    const disclosure = container.querySelector(':scope > details');
    if (disclosure) disclosure.open = true;
  });
  article.addEventListener('keydown', event => {
    if (event.key === ' ' && event.target.matches('[data-table-expand]')) { event.preventDefault(); event.target.click(); }
  });
  const svg = document.querySelector('#ink');
  const tools = document.querySelector('#tools');
  const ns = 'http://www.w3.org/2000/svg';
  let tool = 'pointer', color = '#facc15', size = 4, active = null, history = [];
  const remember = () => { history.push(svg.innerHTML); history = history.slice(-20); };
  const clear = () => { svg.replaceChildren(); active = null; history = []; };
  const select = value => {
    tool = value;
    svg.style.pointerEvents = value === 'pointer' ? 'none' : 'auto';
    svg.style.touchAction = value === 'pointer' ? 'auto' : 'none';
    svg.style.cursor = value === 'eraser' ? 'cell' : 'crosshair';
    tools.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === value)));
  };
  tools.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => select(b.dataset.tool)));
  document.querySelector('#color').addEventListener('input', e => { color = e.target.value; });
  document.querySelector('#size').addEventListener('input', e => { size = Number(e.target.value); });
  document.querySelector('#undo').addEventListener('click', () => { if(history.length) svg.innerHTML = history.pop(); });
  document.querySelector('#clear').addEventListener('click', () => { if(svg.children.length) { remember(); svg.replaceChildren(); } });
  const point = e => { const r = svg.getBoundingClientRect(); return [e.clientX-r.left,e.clientY-r.top]; };
  const erase = p => {
    [...svg.children].forEach(path => {
      const length = path.getTotalLength(), radius = Math.max(12, Number(path.getAttribute('stroke-width'))/2+6);
      for(let d=0; d<=length; d+=4) {
        const q = path.getPointAtLength(d);
        if(Math.hypot(q.x-p[0],q.y-p[1])<=radius) { path.remove(); break; }
      }
    });
  };
  svg.addEventListener('pointerdown', e => {
    if(e.button!==0 || tool==='pointer') return;
    e.preventDefault(); remember(); svg.setPointerCapture(e.pointerId);
    const p=point(e); active={id:e.pointerId, points:[p], path:null};
    if(tool==='eraser') { erase(p); return; }
    const path=document.createElementNS(ns,'path');
    Object.entries({d:'M'+p.join(',')+' l0.1,0',fill:'none',stroke:color,'stroke-width':tool==='marker'?size*5:size,'stroke-opacity':tool==='marker'?0.3:1,'stroke-linecap':'round','stroke-linejoin':'round'}).forEach(([k,v])=>path.setAttribute(k,v));
    svg.append(path); active.path=path;
    if(svg.children.length>300) svg.firstElementChild.remove();
  });
  svg.addEventListener('pointermove', e => {
    if(!active || active.id!==e.pointerId) return;
    e.preventDefault(); const p=point(e);
    if(tool==='eraser') { erase(p); return; }
    if(active.points.length>=2000) return;
    active.points.push(p); active.path.setAttribute('d',active.points.map((q,i)=>(i?'L':'M')+q.join(',')).join(' '));
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(event=>svg.addEventListener(event,()=>{active=null;}));
  let dimensions='';
  new ResizeObserver(() => {
    const r=article.getBoundingClientRect(), next=r.width+':'+r.height;
    if(dimensions && dimensions!==next) clear();
    dimensions=next; svg.style.height=main.scrollHeight+'px';
  }).observe(article);
  const nav=document.querySelector('#contents');
  const top=document.createElement('button'); top.textContent='Início do relatório';
  top.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});nav.parentElement.open=false;}); nav.append(top);
  const seen=new Set();
  article.querySelectorAll('h2,h3,[data-report-nav-heading]').forEach((heading,i)=>{
    const text=(heading.dataset.reportNavHeading || heading.textContent).trim();
    if(!/^\d+\./.test(text) || seen.has(text)) return; seen.add(text);
    heading.id='section-'+i;
    const button=document.createElement('button');button.textContent=text;
    button.style.paddingLeft=(8+Math.max(0,(text.match(/^([\d.]+)/)[1].split('.').filter(Boolean).length-1))*14)+'px';
    button.addEventListener('click',()=>{
      select('pointer'); let parent=heading.parentElement;
      while(parent && parent!==article){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
      heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});heading.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});nav.parentElement.open=false;
    }); nav.append(button);
  });
  document.querySelector('#fullscreen').addEventListener('click',async()=>{
    try {if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
    catch {document.querySelector('#message').textContent='Tela cheia indisponível neste navegador. A apresentação continua nesta janela.';}
  });
  document.addEventListener('fullscreenchange',()=>{document.querySelector('#fullscreen').textContent=document.fullscreenElement?'Sair da tela cheia':'Tela cheia';});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){select('pointer');document.querySelectorAll('.floating[open]').forEach(el=>el.open=false);}});
  let printCopy=null;
  function preparePrint(){
    if(printCopy)return;
    printCopy=article.cloneNode(true);printCopy.id='print-copy';
    printCopy.querySelectorAll('details').forEach(el=>el.open=true);
    printCopy.querySelectorAll('.campaign-report-theme').forEach(theme=>{
      const first=theme.querySelector('.campaign-report-question'), heading=theme.querySelector(':scope > details > summary, :scope > h3');
      if(first && heading){const title=document.createElement('h3');title.textContent=heading.textContent;first.prepend(title);heading.remove();}
    });document.body.append(printCopy);
  }
  window.addEventListener('beforeprint',preparePrint);
  window.addEventListener('afterprint',()=>{printCopy?.remove();printCopy=null;});
  document.querySelectorAll('[data-print]').forEach(button=>button.addEventListener('click',async()=>{
    if(document.fullscreenElement)await document.exitFullscreen();
    document.querySelector('#orientation').textContent='@page { size: A4 '+button.dataset.print+'; margin: '+(button.dataset.print==='landscape'?'12mm 16mm':'18mm 16mm')+'; }';
    preparePrint(); await document.fonts.ready;
    await Promise.all([...printCopy.images].map(img=>img.decode().catch(()=>{})));window.print();
  }));
  select('pointer');
})();`;
