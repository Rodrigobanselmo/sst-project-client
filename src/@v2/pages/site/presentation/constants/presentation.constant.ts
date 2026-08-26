import { SITE_JOURNEY, SITE_PILLARS } from '../../constants/site-content.constant';

export const PRESENTATION_PATH = '/apresentacao';

export const PRESENTATION_CARDS = [
  { id: '01', slug: 'capa', title: 'Capa', status: 'ready' },
  { id: '02', slug: 'problema', title: 'O problema atual das empresas', status: 'ready' },
  { id: '03', slug: 'o-que-e', title: 'O que é o SimpleSST', status: 'ready' },
  { id: '04', slug: 'como-funciona', title: 'Como funciona', status: 'ready' },
  { id: '05', slug: 'modulos', title: 'Entregas da plataforma', status: 'ready' },
  { id: '06', slug: 'beneficios', title: 'Por que o SimpleSST', status: 'ready' },
  { id: '07', slug: 'vamos-conversar', title: 'Vamos conversar', status: 'ready' },
] as const;

export type PresentationCardStatus = (typeof PRESENTATION_CARDS)[number]['status'];
export type PresentationCardDefinition = (typeof PRESENTATION_CARDS)[number];
export type PresentationCardId = PresentationCardDefinition['id'];
export type PresentationCardSlug = PresentationCardDefinition['slug'];

export const PRESENTATION_COVER = {
  kicker: 'Plataforma integrada de SST',
  headline: 'Do campo ao documento, em minutos.',
  lead: 'Do inventário de riscos ao PGR: conecte dados, documentos, plano de ação e fatores psicossociais em uma plataforma feita para SST.',
  support:
    'Inventário, plano de ação, evidências e revisões no mesmo fluxo — para demonstrar que o PGR está implementado, rastreável e em evolução.',
  footer: 'Gestão de SST com clareza, rastreabilidade e respeito ao trabalho técnico.',
  visualSrc: '/site/presentation-cover-devices.png',
  visualAlt: 'Notebook e smartphone com o SimpleSST: visão geral do PGR e coleta de evidências',
  pillars: SITE_PILLARS.map((pillar) => pillar.title),
  journey: SITE_JOURNEY.map((phase) => phase.step),
} as const;

export const PRESENTATION_PROBLEM = {
  kicker: 'O problema atual das empresas',
  headlineBefore: 'Como está a gestão de SST',
  headlineAfter: 'na sua empresa',
  headlineAccent: 'hoje?',
  lead: 'Muitas empresas ainda operam com documentos, planilhas e rotinas que não conversam entre si.',
  chain: ['Informação dispersa', 'Retrabalho', 'Perda de rastreabilidade', 'Risco operacional'],
  closing:
    'Informação dispersa gera retrabalho, reduz a rastreabilidade e aumenta o risco operacional.',
  issues: [
    {
      id: '01',
      title: 'PGR em Word/PDF parado',
      description: 'Documentos estáticos, desatualizados e sem gestão contínua.',
    },
    {
      id: '02',
      title: 'Planilhas paralelas',
      description: 'Informações dispersas, retrabalho e maior risco de inconsistências.',
    },
    {
      id: '03',
      title: 'Riscos sem rastreabilidade',
      description: 'Dificuldade para identificar, avaliar e acompanhar os riscos corretamente.',
    },
    {
      id: '04',
      title: 'Plano de ação sem gestão',
      description: 'Ações sem responsáveis claros, prazos, acompanhamento efetivo e comprovação da eficácia das medidas.',
    },
    {
      id: '05',
      title: 'Dificuldade para integrar',
      description: 'SST, medicina ocupacional e demais áreas operando de forma desconectada.',
    },
    {
      id: '06',
      title: 'Requisitos legais complexos',
      description: 'Mudanças e requisitos que exigem acompanhamento contínuo para manter conformidade.',
    },
  ],
} as const;

export const PRESENTATION_WHAT = {
  kicker: 'O que é o SimpleSST',
  headlineBefore: 'Toda a gestão de SST conectada em um',
  headlineAccent: 'único fluxo.',
  lead: 'Centralize riscos, estruturas, documentos, evidências e planos de ação em uma plataforma criada para transformar a gestão de SST em um processo contínuo, rastreável e gerenciável.',
  closing: 'Da informação dispersa para uma gestão integrada, rastreável e contínua.',
  core: 'SimpleSST',
  orbit: {
    hubX: 50,
    hubY: 50,
    cx: 50,
    cy: 52.5,
    rx: 39.61,
    ry: 18.23,
    rotate: -48,
  },
  primary: [
    { label: 'Estrutura de trabalho', x: 38.8, y: 37.8, side: 'left' },
    { label: 'Inventário de riscos', x: 66.2, y: 20.9, side: 'top' },
    { label: 'Medidas de controle', x: 72.5, y: 52.8, side: 'right' },
    { label: 'Plano de ação', x: 44.4, y: 80.2, side: 'bottom' },
    { label: 'Evidências', x: 23.5, y: 81.9, side: 'left' },
    { label: 'Acompanhamento', x: 27.5, y: 52.2, side: 'top-left' },
  ],
  associated: [
    { label: 'GSE', x: 21.0, y: 67.2, side: 'left' },
    { label: 'LPP', x: 51.5, y: 27.2, side: 'top', title: 'Levantamento Preliminar de Perigos' },
    { label: 'AET / AEP', x: 79.2, y: 27.6, side: 'right' },
    {
      label: 'Psicossociais · COPSOQ III',
      x: 60.7,
      y: 67.7,
      side: 'right',
      stack: true,
    },
    { label: 'Indicadores / Relatórios', x: 54.7, y: 73.2, side: 'bottom-right' },
    { label: 'Exames', x: 26.3, y: 83.6, side: 'bottom' },
    { label: 'Programas / Laudos', x: 20.6, y: 76.7, side: 'left' },
  ],
} as const;

export const PRESENTATION_FLOW = {
  kicker: 'Como funciona',
  headlineBefore: 'Um fluxo completo para uma gestão de SST',
  headlineAccent: 'contínua e integrada.',
  lead: 'O SimpleSST conecta estrutura, riscos, medidas, evidências e acompanhamento em um processo contínuo, rastreável e gerenciável.',
  closing: 'Gestão contínua: avaliar, agir, acompanhar, comprovar e reavaliar.',
  phases: {
    entry: 'Estruturação',
    cycle: 'Gestão contínua',
  },
  returnLabel: 'Reavaliar',
  steps: [
    {
      n: '1',
      title: 'Cadastro da empresa',
      copy: 'Empresas, estabelecimentos, estrutura e acessos.',
      role: 'entry',
    },
    {
      n: '2',
      title: 'Caracterização',
      copy: 'Ambientes, cargos, atividades, processos e GSE.',
      role: 'entry',
    },
    {
      n: '3',
      title: 'Inventário de riscos',
      copy: 'Identificação, avaliação e priorização dos riscos ocupacionais.',
      role: 'hinge',
    },
    {
      n: '4',
      title: 'Plano de ação',
      copy: 'Medidas de prevenção, responsáveis, prazos e prioridades.',
      role: 'cycle',
    },
    {
      n: '5',
      title: 'Documentos',
      copy: 'Documentos técnicos, programas, laudos e registros relacionados à gestão.',
      role: 'cycle',
    },
    {
      n: '6',
      title: 'Gestão contínua',
      copy: 'Acompanhamento, indicadores, prazos e evolução dos riscos.',
      role: 'cycle',
    },
    {
      n: '7',
      title: 'Evidências',
      copy: 'Registros e comprovações da execução e do acompanhamento.',
      role: 'cycle',
    },
  ],
} as const;

export const PRESENTATION_OUTPUTS = {
  kicker: 'Entregas da plataforma',
  headlineBefore: 'Uma origem.',
  headlineAccent: 'Todas as entregas da gestão.',
  lead: 'O SimpleSST organiza a informação e devolve programas, laudos e gestão no mesmo fluxo.',
  closing: 'Da plataforma, as entregas que a gestão de SST passa a produzir.',
  originSrc: '/site/simplesst-logo-negativo-b.png',
  aiSrc: '/site/presentation-ai-intelligence.png',
  matrixLabel: 'Matriz de risco 5×5',
  rails: [
    {
      id: 'programas',
      nodes: [
        {
          id: 'pgr',
          title: 'PGR / GRO',
          children: ['Inventário de Riscos', 'Plano de Ação'],
        },
        {
          id: 'higiene',
          title: 'Higiene Ocupacional',
          children: ['Avaliações quantitativas / qualitativas'],
        },
        {
          id: 'pcmso',
          title: 'PCMSO',
          children: ['ASO'],
        },
      ],
    },
    {
      id: 'central',
      nodes: [
        {
          id: 'psico',
          title: 'Fatores de Risco Psicossociais · NR-1',
          children: [
            'COPSOQ III',
            {
              id: 'adesao',
              title: 'Gestão de adesão',
              actions: [
                { id: 'banner', label: 'Banner' },
                { id: 'email', label: 'E-mail inicial' },
                { id: 'reforcos', label: 'Reforços' },
                { id: 'whatsapp', label: 'WhatsApp' },
                { id: 'acompanhamento', label: 'Acompanhamento' },
              ],
            },
            'Indicadores / relatórios psicossociais',
          ],
        },
        {
          id: 'laudos',
          title: 'Laudos',
          children: [
            { id: 'insalubridade', title: 'Laudo de Insalubridade' },
            { id: 'periculosidade', title: 'Laudo de Periculosidade' },
          ],
        },
        { id: 'ltcat', title: 'LTCAT' },
      ],
    },
    {
      id: 'gestao',
      nodes: [
        { id: 'os', title: 'Ordens de Serviço' },
        { id: 'absenteismo', title: 'Absenteísmo' },
        {
          id: 'documentos',
          title: 'Documentos',
          children: ['Centralização / controle de vencimentos'],
        },
        { id: 'indicadores', title: 'Indicadores / Relatórios' },
      ],
    },
  ],
} as const;

export const PRESENTATION_WHY = {
  kicker: 'Por que o SimpleSST',
  headlineBefore: 'Tecnologia que transforma',
  headlineAccent: 'conhecimento técnico em resultado.',
  lead: 'O SimpleSST combina experiência prática em SST, metodologia, conformidade e inteligência aplicada para reduzir esforço operacional e dar mais segurança às decisões.',
  signature: 'A tecnologia organiza. A inteligência técnica orienta.',
  closing: 'Mais eficiência. Mais segurança. Mais resultado para a gestão.',
  originSrc: '/site/simplesst-logo-negativo-b.png',
  pillars: [
    { id: 'experiencia', title: 'Experiência prática' },
    { id: 'conhecimento', title: 'Conhecimento técnico' },
    { id: 'conformidade', title: 'Conformidade' },
    { id: 'tecnologia', title: 'Tecnologia + IA' },
  ],
  results: [
    { id: 'retrabalho', title: 'Menos retrabalho' },
    { id: 'rastreabilidade', title: 'Rastreabilidade' },
    { id: 'decisoes', title: 'Decisões mais seguras' },
    { id: 'atualizada', title: 'Gestão continuamente atualizada' },
    { id: 'auditorias', title: 'Preparação para auditorias' },
  ],
} as const;

export const PRESENTATION_CLOSE = {
  kicker: 'Vamos conversar',
  headlineBefore: 'Veja o SimpleSST funcionando',
  headlineAccent: 'na sua operação.',
  lead: 'Conheça na prática como tecnologia e conhecimento técnico podem transformar a gestão de SST da sua empresa.',
  cta: 'Solicite uma demonstração',
  qrSrc: '/site/qrcode-google-play.png',
  qrTitle: 'SimpleSST também no seu celular',
  qrCaption: 'Escaneie para acessar na Google Play',
  proofLabel: 'Empresas que confiam na SimpleSST',
  closingBefore: 'SST bem gerida fortalece',
  closingAccent: 'pessoas, decisões e negócios.',
  logos: [
    { id: 'connapa', src: '/site/presentation/clients/connapa.png', alt: 'CONNAPA', fit: 'wide' },
    { id: 'toxilab', src: '/site/presentation/clients/toxilab.png', alt: 'TOXILAB', fit: 'wide' },
    { id: 'iberostar', src: '/site/presentation/clients/iberostar.png', alt: 'Iberostar Selection Praia do Forte', fit: 'tall' },
    { id: 'ecovisao', src: '/site/presentation/clients/ecovisao.png', alt: 'Ecovisão', fit: 'wide' },
    { id: 'planlink', src: '/site/presentation/clients/planlink.png', alt: 'Planlink', fit: 'wide' },
    { id: 'sefaz', src: '/site/presentation/clients/sefaz-bahia.png', alt: 'Governo do Estado da Bahia — Secretaria da Fazenda', fit: 'mark' },
  ],
} as const;

export function isPresentationPath(pathname: string) {
  return pathname === PRESENTATION_PATH || pathname.startsWith(`${PRESENTATION_PATH}/`);
}

export function isPublicMarketingPath(pathname: string) {
  return pathname === '/site' || pathname.startsWith('/site/') || isPresentationPath(pathname);
}

export function getPresentationHref(card: Pick<PresentationCardDefinition, 'slug'>) {
  return card.slug === 'capa' ? PRESENTATION_PATH : `${PRESENTATION_PATH}/${card.slug}`;
}

export function resolvePresentationCard(slug?: string | string[]) {
  const value = Array.isArray(slug) ? slug[0] : slug;
  if (!value) {
    return PRESENTATION_CARDS[0];
  }

  return (
    PRESENTATION_CARDS.find((card) => card.slug === value || card.id === value) ??
    PRESENTATION_CARDS[0]
  );
}

export function getAdjacentPresentationCards(card: PresentationCardDefinition) {
  const index = PRESENTATION_CARDS.findIndex((item) => item.id === card.id);
  const previous = index > 0 ? PRESENTATION_CARDS[index - 1] : undefined;
  const next = index < PRESENTATION_CARDS.length - 1 ? PRESENTATION_CARDS[index + 1] : undefined;

  return {
    index,
    previous,
    next,
    canGoPrevious: Boolean(previous && previous.status === 'ready'),
    canGoNext: Boolean(next && next.status === 'ready'),
  };
}
