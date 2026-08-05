/** User-facing narratives for discarded/blocked similarity pairs (0.6.0+). */

const BLOCK_CODE_LABEL: Record<string, { title: string; body: string }> = {
  MATERIAL_EXCLUSIVE_RISK: {
    title: 'Caso de riscos parcialmente diferentes',
    body:
      'Os elementos abrangem população semelhante, mas possuem riscos parcialmente diferentes. Avalie se os riscos são complementares na rotina do mesmo grupo ou se representam exposições de grupos distintos.',
  },
  INCOMPATIBLE_RISK_SETS: {
    title: 'Caso de riscos sem interseção',
    body:
      'Os elementos não compartilham riscos em comum. Avalie se as exposições são complementares no mesmo universo ocupacional ou se devem permanecer em GSEs distintos.',
  },
  INCOMPATIBLE_TYPES: {
    title: 'Tipos incompatíveis',
    body: 'Os tipos de elementos caracterizáveis são ocupacionalmente incompatíveis para consolidação automática.',
  },
  ASYMMETRIC_RISK_COVERAGE: {
    title: 'Cobertura de riscos assimétrica',
    body: 'Apenas um dos elementos possui contexto de riscos próprio ou representativo suficiente.',
  },
  INSUFFICIENT_MINIMUM_INFO: {
    title: 'Dados insuficientes',
    body: 'Não há informações mínimas de riscos para comparar os elementos com segurança.',
  },
  INACTIVE_OR_DELETED: {
    title: 'Elemento inativo ou excluído',
    body: 'Um dos elementos está inativo ou excluído e não deve entrar em proposta.',
  },
  EXISTING_TECHNICAL_GSE_CONFLICT: {
    title: 'Conflito com GSE técnico existente',
    body: 'Já existe agrupamento técnico que conflita com a consolidação destes elementos.',
  },
  INCOMPATIBLE_EXISTING_GROUPING: {
    title: 'Agrupamento existente incompatível',
    body: 'Há vínculo com GSE existente que impede a consolidação automática destes elementos.',
  },
  PURPOSE_UNKNOWN: {
    title: 'Finalidade do GSE existente indefinida',
    body: 'Há GSE técnico vinculado sem finalidade clara — revisão necessária antes de consolidar.',
  },
  DIFFERENT_COMPANY: {
    title: 'Empresas distintas',
    body: 'Os elementos pertencem a empresas diferentes e não podem formar o mesmo GSE.',
  },
  INCOMPATIBLE_WORKSPACE: {
    title: 'Estabelecimentos distintos',
    body: 'Os elementos pertencem a workspaces/estabelecimentos incompatíveis para consolidação.',
  },
};

export function resolveDiscardedPairUserNarrative(params: {
  blockCodes?: string[];
  reason?: string;
  globalScore?: number | null;
}): { title: string; body: string; technicalDetail: string } {
  const codes = params.blockCodes ?? [];
  for (const code of codes) {
    const mapped = BLOCK_CODE_LABEL[code];
    if (mapped) {
      return {
        title: mapped.title,
        body: mapped.body,
        technicalDetail: [code, params.reason, params.globalScore != null ? `score ${params.globalScore}` : null]
          .filter(Boolean)
          .join(' · '),
      };
    }
  }

  if (!codes.length && (params.globalScore == null || params.globalScore < 50)) {
    return {
      title: 'Populações ocupacionais distintas',
      body:
        'Os elementos não abrangem os mesmos cargos ou trabalhadores, reduzindo a segurança da consolidação em um único GSE.',
      technicalDetail: [params.reason, params.globalScore != null ? `score ${params.globalScore}` : null]
        .filter(Boolean)
        .join(' · '),
    };
  }

  return {
    title: 'Não consolidado automaticamente',
    body:
      params.reason ||
      'A comparação não resultou em consolidação automática. Consulte os detalhes técnicos se necessário.',
    technicalDetail: [codes.join(', '), params.reason, params.globalScore != null ? `score ${params.globalScore}` : null]
      .filter(Boolean)
      .join(' · '),
  };
}
