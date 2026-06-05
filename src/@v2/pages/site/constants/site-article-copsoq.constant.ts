export const SITE_ARTICLE_COPSOQ = {
  slug: 'adaptacao-copsoq-iii-pgr',
  path: '/site/artigos/adaptacao-copsoq-iii-pgr',
  pdfUrl: '/site/materials/artigo-copsoq-iii-pgr.pdf',
  title: 'Adaptação do COPSOQ III ao PGR (NR-1)',
  subtitle:
    'Guia prático para integrar fatores de riscos psicossociais ao Gerenciamento de Riscos Ocupacionais (GRO).',
  author:
    'Alex Abreu Marins — Eng. Ambiental, Eng. de Segurança do Trabalho e Higienista Ocupacional (ABHO — HOC 0061).',
  intro:
    'Este artigo apresenta uma proposta técnica para adaptação do COPSOQ III à lógica do Programa de Gerenciamento de Riscos (PGR), convertendo dimensões psicossociais em Fatores de Riscos Psicossociais (FRPS), com critérios de severidade, probabilidade e classificação em matriz de risco 5×5.',
  highlights: [
    {
      title: 'COPSOQ III aplicado ao PGR',
      text: 'O artigo mostra como o instrumento pode ser interpretado dentro da lógica de perigos, riscos, inventário e plano de ação exigida pela NR-01.',
    },
    {
      title: '18 Fatores de Riscos Psicossociais',
      text: 'A metodologia organiza os achados em FRPS operacionalmente definidos, evitando tratar sintomas ou indicadores de saúde como perigos ocupacionais.',
    },
    {
      title: 'Probabilidade, severidade e matriz 5x5',
      text: 'A proposta utiliza critérios técnicos para conversão das respostas em probabilidade, atribuição de severidade e classificação do risco ocupacional.',
    },
    {
      title: 'Salvaguardas metodológicas',
      text: 'O material aborda anonimato, agregação mínima de resultados, confidencialidade e cuidado para evitar interpretações indevidas dos dados.',
    },
  ],
  methodology: {
    title: 'Como a metodologia transforma respostas em risco ocupacional',
    intro:
      'A adaptação do COPSOQ III ao PGR exige converter respostas psicossociais em critérios compatíveis com a lógica do GRO: identificação do fator de risco, definição da severidade, estimativa da probabilidade e classificação em matriz 5x5.',
    visuals: [
      {
        title: 'Da escala psicossocial à matriz 5x5',
        text: 'A metodologia evita uma leitura simplificada em tercis e organiza os resultados em cinco níveis, compatíveis com a classificação de severidade, probabilidade e risco ocupacional utilizada no PGR.',
        image: '/site/materials/copsoq-escala-tercis-vs-cinco-niveis.png',
        imageAlt:
          'Comparativo entre escala psicossocial em tercis e classificação em cinco níveis para matriz 5x5 do PGR',
      },
      {
        title: 'Critérios de severidade psicossocial',
        text: 'A severidade considera o potencial de dano à saúde, repercussões funcionais, possibilidade de adoecimento e necessidade de intervenção, respeitando a natureza ocupacional dos fatores psicossociais.',
        image: '/site/materials/copsoq-severidade-psicossociais.png',
        imageAlt: 'Critérios de severidade para fatores de riscos psicossociais no contexto do PGR',
      },
      {
        title: 'Critérios de probabilidade psicossocial',
        text: 'A probabilidade é estimada a partir da distribuição das respostas, intensidade dos achados e evidências psicossociais, permitindo classificar a chance de ocorrência ou agravamento do dano no contexto ocupacional.',
        image: '/site/materials/copsoq-probabilidade-psicossociais.png',
        imageAlt: 'Critérios de probabilidade para fatores de riscos psicossociais no contexto do PGR',
      },
      {
        title: 'Risco ocupacional psicossocial',
        text: 'A matriz qualitativa cruza severidade e probabilidade para apoiar a classificação do risco ocupacional e orientar a priorização das ações preventivas.',
        image: '/site/materials/copsoq-risco-ocupacional-qualitativo.png',
        imageAlt: 'Matriz qualitativa de risco ocupacional psicossocial com severidade e probabilidade',
      },
    ],
  },
} as const;
