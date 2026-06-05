import { SITE_IMAGES } from './site-images.constant';

export const SITE_NAV_LINKS = [
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Para quem é', href: '#para-quem-foi-criado' },
  { label: 'Psicossocial', href: '#psicossocial' },
  { label: 'Contato', href: '#contato' },
] as const;

/** Públicos-alvo — hero de posicionamento (6 cards) */
export const SITE_CREATED_FOR = [
  {
    title: 'Técnicos e engenheiros iniciando a carreira',
    description:
      'Transforme conhecimento técnico em processos estruturados e ganhe segurança na elaboração de documentos.',
    image: SITE_IMAGES.pillarBeginner,
    imageAlt: 'Profissional iniciante estruturando documentos de SST com apoio da plataforma',
    objectPosition: '50% 42%',
  },
  {
    title: 'Profissionais experientes',
    description:
      'Automatize tarefas repetitivas e concentre seu tempo em análises, estratégia e decisões técnicas.',
    image: SITE_IMAGES.pillarExperienced,
    imageAlt: 'Profissional experiente focado em análise técnica com automação no SimpleSST',
    objectPosition: '50% 45%',
  },
  {
    title: 'Consultorias de SST',
    description:
      'Padronize entregas, reduza retrabalho e escale operações mantendo qualidade e rastreabilidade.',
    image: SITE_IMAGES.pillarConsulting,
    imageAlt: 'Consultoria de SST padronizando entregas para múltiplos clientes',
    objectPosition: '50% 40%',
  },
  {
    title: 'SESMTs corporativos',
    description:
      'Integre riscos, documentos, planos de ação, evidências e indicadores em um único fluxo.',
    image: SITE_IMAGES.pillarCorporateSesmt,
    imageAlt: 'SESMT corporativo integrando riscos, documentos e planos de ação',
    objectPosition: '50% 48%',
  },
  {
    title: 'Psicólogos e equipes multidisciplinares',
    description:
      'Gerencie fatores de riscos psicossociais, campanhas, indicadores e planos de ação integrados ao PGR.',
    image: SITE_IMAGES.pillarPsychosocial,
    imageAlt: 'Equipe multidisciplinar gerenciando fatores psicossociais integrados ao PGR',
    objectPosition: '50% 38%',
  },
  {
    title: 'Grandes corporações',
    description:
      'Controle múltiplas unidades, equipes e processos em uma plataforma preparada para operações complexas.',
    image: SITE_IMAGES.pillarEnterprise,
    imageAlt: 'Grande corporação gerenciando múltiplas unidades e processos de SST',
    objectPosition: '50% 44%',
  },
] as const;

/** Narrativa problema → consequência → solução → benefício */
export const SITE_SOLUTION_STORIES = [
  {
    problem: 'Riscos espalhados em planilhas',
    consequence: 'Decisões sem rastreabilidade nem versão única',
    solution: 'Inventário e PGR no mesmo fluxo',
    benefit: 'Mais clareza e menos retrabalho',
    accent: 'orange' as const,
  },
  {
    problem: 'Laudos desconectados da operação',
    consequence: 'Cliente e equipe falam línguas diferentes',
    solution: 'Documentos ligados a medidas e evidências',
    benefit: 'Entrega mais confiável',
    accent: 'blue' as const,
  },
  {
    problem: 'Estrutura organizacional confusa',
    consequence: 'Setores, GSE e cargos fora de sincronia',
    solution: 'Hierarquia e ambientes integrados',
    benefit: 'Equipe e cliente alinhados',
    accent: 'violet' as const,
  },
  {
    problem: 'Psicossocial tratado à parte',
    consequence: 'NR-01 sem método unificado ao GRO',
    solution: 'FRPS e inventário conectados',
    benefit: 'Segurança técnica de ponta a ponta',
    accent: 'green' as const,
  },
] as const;

export const SITE_RELIEF_POINTS = [
  'Menos planilhas soltas',
  'Mais tranquilidade na entrega',
  'Cliente e equipe na mesma página',
] as const;

export const SITE_JOURNEY = [
  {
    step: 'Identificar',
    summary: 'Ambientes, GSE, perigos e fontes geradoras',
    modules: ['Ambientes e GSE', 'Hierarquia clara', 'Riscos mapeados'],
    color: '#2563EB',
  },
  {
    step: 'Avaliar',
    summary: 'Classifique riscos com critérios consistentes',
    modules: ['Inventário vivo', 'Critérios técnicos', 'Prioridade definida'],
    color: '#6366F1',
  },
  {
    step: 'Planejar',
    summary: 'Transforme risco em ação',
    modules: ['Plano de ação', 'Responsáveis', 'Prazos'],
    color: '#F27329',
  },
  {
    step: 'Comprovar',
    summary: 'Registre evidências e histórico',
    modules: ['Fotos e anexos', 'Versões rastreáveis', 'Medidas executadas'],
    color: '#059669',
  },
  {
    step: 'Acompanhar',
    summary: 'Monitore revisões e eficácia',
    modules: ['Indicadores', 'Histórico', 'Gestão contínua'],
    color: '#0D9488',
  },
] as const;

export const SITE_PILLARS = [
  {
    title: 'Rastreabilidade',
    description:
      'Sabe de onde veio cada decisão — e o que mudou desde a última versão. Tranquilidade para você e para quem audita.',
    image: SITE_IMAGES.pillarTraceability,
    imageAlt:
      'Plano de ação, evidências vinculadas e histórico de alterações no painel e no aplicativo',
    objectPosition: '50% 42%',
    accent: 'blue' as const,
  },
  {
    title: 'Padronização',
    description:
      'PGR, laudos, programas, riscos e evidências seguindo a mesma lógica técnica — sem documentos que se contradizem.',
    image: SITE_IMAGES.pillarStandardization,
    imageAlt:
      'GRO e PGR integrando inventário, avaliação, plano de ação, evidências e revisões em uma lógica única',
    objectPosition: '50% 48%',
    accent: 'green' as const,
  },
  {
    title: 'Inteligência com validação',
    description:
      'IA acelera o repetitivo; o profissional valida. Tecnologia a serviço do ofício, não no lugar dele.',
    image: SITE_IMAGES.pillarAiValidation,
    imageAlt: 'Análise de riscos com apoio da IA e validação do profissional responsável',
    objectPosition: '50% 38%',
    accent: 'violet' as const,
  },
] as const;

export const SITE_AUDIENCE = [
  {
    title: 'Empresas',
    description: 'Quem precisa enxergar SST em vários estabelecimentos sem perder o fio.',
  },
  {
    title: 'Consultorias',
    description: 'Quem atende muitos clientes e quer escalar sem perder qualidade.',
  },
  {
    title: 'SESMT',
    description: 'Quem une campo, documentação e plano de ação no dia a dia.',
  },
  {
    title: 'Medicina ocupacional',
    description: 'Quem alinha laudos, exames e riscos com o cliente.',
  },
  {
    title: 'Profissionais de SST',
    description: 'Quem busca ferramenta feita para o trabalho real — não para planilha.',
  },
] as const;

export const SITE_MATERIALS = [
  {
    title: 'Artigos',
    description: 'Em breve',
    href: '/site/artigos/adaptacao-copsoq-iii-pgr',
  },
  { title: 'E-books', description: 'Em breve' },
  { title: 'Metodologia', description: 'Em breve' },
] as const;
