import type {
  BiologicalIndicatorDetail,
  BiologicalIndicatorStatus,
} from '@v2/services/medicine/biological-indicator/service/biological-indicator.types';

export const BIOLOGICAL_INDICATOR_STATUS_LABELS: Record<BiologicalIndicatorStatus, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativo',
  DEPRECATED: 'Obsoleto',
  REVOKED: 'Revogado',
};

export const BIOLOGICAL_INDICATOR_TABLE_LABELS = {
  QUADRO_1: 'Quadro 1',
  QUADRO_2: 'Quadro 2',
} as const;

export const BIOLOGICAL_INDICATOR_TYPE_LABELS = {
  IBE_EE: 'IBE EE',
  IBE_SC: 'IBE SC',
} as const;

const NORMATIVE_SOURCE_LABELS: Record<string, string> = {
  NR_07: 'NR-07',
};

export function formatNormativeSource(source?: string | null): string {
  if (!source) return 'NR-07';
  return NORMATIVE_SOURCE_LABELS[source] ?? source.replace(/_/g, '-');
}

export function formatTechnicalObservations(
  observations?: string[] | null,
  raw?: string | null,
): string {
  if (raw?.trim()) return raw.trim();
  if (observations?.length) return observations.join(', ');
  return '—';
}

export function getStatusChipColor(
  status: BiologicalIndicatorStatus,
): 'default' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'DEPRECATED':
      return 'warning';
    case 'REVOKED':
      return 'error';
    default:
      return 'default';
  }
}

const PENDENCY_MESSAGES: Record<string, string> = {
  RISK_NOT_CONFIRMED:
    'Confirme o vínculo indicador → risco antes de ativar.',
  RISK_PRIMARY_REQUIRED:
    'Há risco confirmado, mas nenhum risco principal foi definido. Marque o risco principal que será usado como referência para aplicação futura.',
  EXAM_NOT_CONFIRMED:
    'Confirme o vínculo indicador → exame e marque o exame como padrão.',
  EXAM_DEFAULT_REQUIRED:
    'Há exame confirmado, mas nenhum exame padrão foi definido. Marque o exame padrão que será usado como referência para este indicador.',
  NORMATIVE_REVIEW_REQUIRED:
    'Este indicador pertence ao Quadro 2 ou exige revisão normativa/médica. Preencha as notas de revisão e conclua a revisão antes de ativar.',
};

export function getPendencyMessage(code: string, fallback?: string): string {
  return PENDENCY_MESSAGES[code] ?? fallback ?? code;
}

export const PRIMARY_RISK_HELPER_TEXT =
  'Marque como principal o risco que deverá ser usado como referência para aplicação futura deste indicador. Quando houver apenas um risco confirmado, ele é tratado automaticamente como principal.';

export const NORMATIVE_REVIEW_HELPER_TEXT =
  'Registre a conferência técnica do indicador com a NR-07 Anexo I, incluindo substância, CAS, indicador biológico, matriz, momento de coleta, valor de referência, observações técnicas e justificativa para ativação.';

export const NORMATIVE_REVIEW_SUGGESTION_HELPER_TEXT =
  'Texto sugerido automaticamente a partir dos dados normativos do indicador. Revise e edite livremente antes de ativar — a ativação continua dependendo do clique em "Ativar indicador".';

function formatAnnexLabel(annex?: string | null): string {
  if (!annex) return 'Anexo I';
  return annex.replace('ANNEX_', 'Anexo ');
}

/**
 * Indicadores que exigem revisão normativa/médica antes da ativação:
 * Quadro 2, IBE-SC, grupos normativos ou marcação explícita da norma.
 */
export function requiresNormativeReview(
  indicator: Pick<
    BiologicalIndicatorDetail,
    'requiresNormativeReview' | 'tableNumber' | 'indicatorType' | 'isSubstanceGroup'
  >,
): boolean {
  return (
    indicator.requiresNormativeReview ||
    indicator.tableNumber === 'QUADRO_2' ||
    indicator.indicatorType === 'IBE_SC' ||
    indicator.isSubstanceGroup
  );
}

/**
 * Monta um texto de revisão normativa/médica a partir dos próprios dados do
 * indicador (fonte, anexo, quadro, tipo, substância, CAS, indicador biológico,
 * matriz, momento de coleta, valor de referência, observações técnicas, risco
 * confirmado e exame confirmado). O texto é apenas uma sugestão editável.
 */
export function buildNormativeReviewSuggestion(
  indicator: BiologicalIndicatorDetail,
): string {
  const fonte = formatNormativeSource(indicator.normativeSource);
  const anexo = formatAnnexLabel(indicator.annex);
  const quadro = BIOLOGICAL_INDICATOR_TABLE_LABELS[indicator.tableNumber];
  const substancia = indicator.substanceName;
  const cas = indicator.casPrimary ?? indicator.casNumbers.join(', ');
  const indicadorBiologico = indicator.biologicalIndicatorOriginal;
  const matriz = indicator.biologicalMatrix;
  const momento = indicator.collectionMoment;
  const valor = `${indicator.referenceValue ?? ''} ${indicator.unit ?? ''}`.trim();
  const observacao = formatTechnicalObservations(
    indicator.technicalObservations,
    indicator.technicalObservationsRaw,
  );

  const confirmedRisk = indicator.riskLinks.find((link) => link.isConfirmed);
  const confirmedExam = indicator.examLinks.find((link) => link.isConfirmed);

  const sentences: string[] = [];

  sentences.push(
    `Revisão normativa/médica realizada com base na ${fonte}, ${anexo}, ${quadro}.`,
  );

  const detailParts = [
    `com matriz ${matriz}`,
    `momento de coleta ${momento}`,
  ];
  if (valor) detailParts.push(`valor de referência ${valor}`);
  if (observacao && observacao !== '—') {
    detailParts.push(`observação técnica ${observacao}`);
  }
  const detailText =
    detailParts.length > 1
      ? `${detailParts.slice(0, -1).join(', ')} e ${detailParts[detailParts.length - 1]}`
      : detailParts[0];

  sentences.push(
    `Indicador biológico “${indicadorBiologico}” conferido para a substância ` +
      `“${substancia}”${cas ? `, CAS ${cas}` : ''}, ${detailText}.`,
  );

  sentences.push(
    confirmedRisk
      ? 'Vínculo com o fator de risco confirmado considerado compatível.'
      : 'Vínculo com o fator de risco ainda pendente de confirmação na curadoria.',
  );

  sentences.push(
    confirmedExam
      ? 'Exame complementar confirmado conforme indicador biológico normativo.'
      : 'Exame complementar ainda pendente de confirmação na curadoria.',
  );

  if (indicator.indicatorType === 'IBE_SC') {
    sentences.push(
      'Por se tratar de IBE/SC, a utilização deve permanecer sob avaliação do médico responsável pelo PCMSO.',
    );
  } else if (indicator.isSubstanceGroup && indicator.substanceGroup) {
    sentences.push(
      `Por se tratar de grupo normativo (“${indicator.substanceGroup.name}”), a aplicação deve ser avaliada pelo médico responsável pelo PCMSO.`,
    );
  } else if (indicator.tableNumber === 'QUADRO_2') {
    sentences.push(
      'Por se tratar de indicador do Quadro 2, a utilização deve permanecer sob avaliação do médico responsável pelo PCMSO.',
    );
  }

  return sentences.join(' ');
}
