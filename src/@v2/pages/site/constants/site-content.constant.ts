import { SITE_IMAGES } from './site-images.constant';

export const SITE_NAV_LINKS = [
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Psicossocial', href: '#psicossocial' },
  { label: 'Para quem é', href: '#para-quem-e' },
  { label: 'Contato', href: '#contato' },
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
  { title: 'Artigos', description: 'Em breve' },
  { title: 'E-books', description: 'Em breve' },
  { title: 'Metodologia', description: 'Em breve' },
] as const;
