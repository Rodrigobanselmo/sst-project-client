import {
  formatChemicalScenarioQuantity,
  parseChemicalScenarioQuantity,
} from './chemical-use-scenario-quantity.util';

import type {
  ChemicalPrioritizationFactorData,
  ChemicalUseScenarioActivityRiskFactor,
  ChemicalUseScenarioBoardRow,
  ChemicalUseScenarioHomogeneousGroup,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

export type ChemicalPrioritizationGroup = {
  key: string;
  factor: ChemicalUseScenarioActivityRiskFactor;
  gse: ChemicalUseScenarioHomogeneousGroup;
  scenarios: ChemicalUseScenarioBoardRow[];
  hasPendingEvidence: boolean;
};

export type ChemicalPrioritizationDecision = {
  inventory: '' | 'include' | 'exclude';
  justification: string;
  reference: string;
};

export const emptyDecision: ChemicalPrioritizationDecision = {
  inventory: '',
  justification: '',
  reference: '',
};

export function groupChemicalScenarios(rows: ChemicalUseScenarioBoardRow[]) {
  const groups = new Map<string, ChemicalPrioritizationGroup>();
  const pending: {
    scenario: ChemicalUseScenarioBoardRow;
    reasons: string[];
  }[] = [];

  for (const scenario of rows) {
    const { homogeneousGroup: gse } = scenario;
    const factors = scenario.activityRiskFactors ?? [];
    const reasons: string[] = [];
    const validGroup =
      gse && !gse.deletedAt && gse.id === scenario.homogeneousGroupId;
    if (!validGroup) {
      reasons.push('Sem GSE ativo vinculado');
    }
    if (!factors.length) reasons.push('Sem fator de risco correlacionado');
    if (
      scenario.activityRiskResolutions?.some(
        (item) => item.status === 'UNRESOLVED',
      )
    ) {
      reasons.push('Há componentes da atividade sem correlação confirmada');
    }
    if (
      scenario.activityRiskOrigin === 'PRODUCT_COMPOSITION' &&
      scenario.product.activeComposition?.ingredients.some(
        (ingredient) => !ingredient.riskFactorId,
      )
    ) {
      reasons.push('Há ingredientes sem fator de risco vinculado');
    }
    if (
      scenario.surveyStatus !== 'LEVANTAMENTO_CONCLUIDO' &&
      scenario.surveyStatus !== 'AGUARDANDO_ANALISE_TECNICA'
    ) {
      reasons.push('Levantamento incompleto');
    }
    if (reasons.length) {
      pending.push({ scenario, reasons });
    }
    if (!validGroup) continue;

    for (const factor of new Map(
      factors.map((item) => [item.id, item]),
    ).values()) {
      const key = JSON.stringify([factor.id, gse.id]);
      const group = groups.get(key) ?? {
        key,
        factor,
        gse,
        scenarios: [],
        hasPendingEvidence: false,
      };
      group.hasPendingEvidence ||= reasons.length > 0;
      group.scenarios.push(scenario);
      groups.set(key, group);
    }
  }

  return {
    pending,
    groups: [...groups.values()].sort(
      (a, b) =>
        a.gse.name.localeCompare(b.gse.name, 'pt-BR') ||
        a.gse.id.localeCompare(b.gse.id) ||
        a.factor.name.localeCompare(b.factor.name, 'pt-BR'),
    ),
  };
}

export const CHEMICAL_SCENARIO_SCORES = [1, 2, 3, 4, 5] as const;
type Score = (typeof CHEMICAL_SCENARIO_SCORES)[number];
export type ChemicalScenarioRatings = { contact?: Score };

export type ChemicalScenarioRatingReview = {
  ratings: ChemicalScenarioRatings;
  confirmed: boolean;
};

export function confirmedChemicalScenarioRatings(
  review?: ChemicalScenarioRatingReview,
): ChemicalScenarioRatings {
  return review?.confirmed && review.ratings.contact ? review.ratings : {};
}

const quantityUnitDivisors = new Map([
  ['ml', 1000],
  ['l', 1],
  ['litro', 1],
  ['litros', 1],
  ['kg', 1],
]);

function scoreQuantity(scenario: ChemicalUseScenarioBoardRow) {
  const divisor = quantityUnitDivisors.get(
    scenario.quantityUnit?.trim().toLowerCase() ?? '',
  );
  const quantity = parseChemicalScenarioQuantity(scenario.quantity);
  return divisor && quantity !== null && quantity > 0
    ? score(quantity / divisor, [1, 10, 100, 500])
    : null;
}

export function suggestChemicalScenarioContact(
  scenario: ChemicalUseScenarioBoardRow,
) {
  const descriptions = [scenario.activityName, scenario.peakContactMoment].map(
    (value) =>
      (value ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, ''),
  );
  const directContact =
    /\b(?:contato direto|abertura de (?:tanque|recipiente)|engate de mangueiras?|troca de ibcs?|mistura manual|manipulacao manual)\b/;
  if (
    descriptions.some((text) =>
      /\b(?:sem|nao|exceto|evitar|possivel)\b/.test(text),
    ) ||
    !descriptions.some((text) => directContact.test(text))
  )
    return undefined;

  return {
    score: 4 as const,
    reason:
      'A atividade ou o momento de maior contato descreve manuseio direto ou abertura de recipiente. Confira a forma de contato e os controles registrados.',
  };
}

const occurrencesPerWeek: Record<string, number> = {
  diário: 5,
  semanal: 1,
  quinzenal: 0.5,
  mensal: 12 / 52,
  semestre: 2 / 52,
};

function score(value: number, thresholds: readonly number[]): Score {
  return (1 +
    thresholds.filter((threshold) => value > threshold).length) as Score;
}

function catalogLimits(factor: ChemicalPrioritizationFactorData) {
  const limits = [
    { source: 'NR-15', value: factor.nr15lt, dedicated: false },
    { source: 'ACGIH TWA', value: factor.twa, dedicated: false },
    { source: 'ACGIH STEL', value: factor.stel, dedicated: false },
    { source: 'ACGIH teto', value: factor.acgihCeiling, dedicated: true },
    { source: 'NIOSH REL', value: factor.nioshRel, dedicated: false },
    { source: 'NIOSH STEL', value: factor.nioshStel, dedicated: false },
    { source: 'NIOSH teto', value: factor.nioshCeiling, dedicated: true },
    { source: 'OSHA PEL', value: factor.oshaPel, dedicated: false },
    { source: 'OSHA STEL', value: factor.oshaStel, dedicated: false },
    { source: 'OSHA teto', value: factor.oshaCeiling, dedicated: true },
    { source: 'AIHA WEEL', value: factor.aihaWeel, dedicated: false },
    { source: 'AIHA WEEL STEL', value: factor.aihaWeelStel, dedicated: false },
    {
      source: 'AIHA WEEL teto',
      value: factor.aihaWeelCeiling,
      dedicated: true,
    },
  ];
  const ceiling = limits.find(
    ({ value, dedicated }) =>
      value &&
      /^(?:\s*(?:C|valor teto|ceiling)\s*[:=]?\s+)?\s*(?:[1-9]\d*(?:[.,]\d+)?|0[.,]\d*[1-9]\d*)(?=\s*(?:ppm\b|mg\b|[µμu]g\b|\(C\)|valor\s+teto\b|ceiling\b|C\s*$|$))/i.test(
        value,
      ) &&
      (dedicated ||
        /\b(?:valor\s+teto|ceiling)\b|^\s*C\s+|\(C\)|\sC\s*$/i.test(value)),
  );
  const lowLimit = limits.find(({ value }) => {
    const match = value?.match(/(?:^|[\s(])(0[.,]\d+)\s*ppm\b/i);
    return match && Number(match[1].replace(',', '.')) > 0;
  });
  return {
    ceiling,
    lowLimit,
    limits: limits.filter(
      ({ value }) => value?.trim() && !/^[\s—–-]+$/.test(value),
    ),
  };
}

export function analyzeChemicalScenario(
  factor: ChemicalUseScenarioActivityRiskFactor,
  scenario: ChemicalUseScenarioBoardRow,
  ratings: ChemicalScenarioRatings,
  matrix: (severity: number, probability: number) => number,
) {
  const catalog = factor.prioritization;
  const severity = catalog?.severity;
  const references = catalog ? catalogLimits(catalog) : null;
  const period = scenario.frequencyPeriod?.trim().toLocaleLowerCase('pt-BR');
  const frequency = scenario.frequencyCount;
  const duration = scenario.durationMinutes;
  const weekly = period && occurrencesPerWeek[period];
  const frequencyScore =
    weekly && frequency != null && Number.isFinite(frequency) && frequency > 0
      ? score(weekly * frequency, [0.25, 1, 5, 15])
      : null;
  const durationScore =
    duration != null && Number.isFinite(duration) && duration > 0
      ? score(duration, [5, 15, 60, 240])
      : null;
  const quantityScore = scoreQuantity(scenario);
  const contactScore = ratings.contact ?? null;
  const baseProbability =
    frequencyScore && durationScore && quantityScore
      ? Math.max(Math.ceil((frequencyScore + durationScore) / 2), quantityScore)
      : null;
  const probability =
    baseProbability && contactScore
      ? Math.max(baseProbability, contactScore)
      : null;
  const validSeverity =
    severity != null &&
    Number.isInteger(severity) &&
    severity >= 1 &&
    severity <= 5;
  const level =
    validSeverity && probability ? matrix(severity, probability) : null;
  const evidence = {
    severity,
    frequencyScore,
    durationScore,
    quantityScore,
    contactScore,
    probability,
    priorityWithoutContact:
      !contactScore &&
      !references?.ceiling &&
      (severity === 3 || severity === 4) &&
      baseProbability !== null &&
      CHEMICAL_SCENARIO_SCORES.every(
        (contact) => matrix(severity, Math.max(baseProbability, contact)) >= 4,
      ),
    level,
    references,
  };
  const severityReason = 'Severidade 5, independentemente da probabilidade.';
  if (references?.ceiling)
    return {
      ...evidence,
      outcome: 'include',
      reason: `Valor teto cadastrado · ${references.ceiling.source}: ${references.ceiling.value}.${severity === 5 ? ` ${severityReason}` : ''}`,
    } as const;
  if (severity === 5)
    return {
      ...evidence,
      outcome: 'include',
      reason: severityReason,
    } as const;
  if (severity === 1 || severity === 2)
    return {
      ...evidence,
      outcome: 'exclude',
      reason: `Severidade ${severity}, dentro da faixa excluída pelo critério de priorização.`,
    } as const;
  if (!validSeverity)
    return {
      ...evidence,
      outcome: 'pending',
      reason: 'Severidade do fator indisponível ou não informada.',
    } as const;
  if (!probability || level == null)
    return {
      ...evidence,
      outcome: 'pending',
      reason:
        'Complete a frequência, a duração e a quantidade do cenário e confirme a nota de contato.',
    } as const;
  return {
    ...evidence,
    outcome: level >= 4 ? 'include' : 'exclude',
    reason:
      level >= 4
        ? `Severidade ${severity}/5 e probabilidade ${probability}/5: resultado alto ou muito alto na matriz SimpleSST.`
        : `Severidade ${severity}/5 e probabilidade ${probability}/5: resultado moderado ou inferior na matriz SimpleSST.`,
  } as const;
}

export type ChemicalScenarioAssessment = ReturnType<
  typeof analyzeChemicalScenario
>;

export function areChemicalAssessmentsComplete(
  assessments: ChemicalScenarioAssessment[],
) {
  return (
    assessments.length > 0 &&
    assessments.every(({ outcome }) => outcome !== 'pending')
  );
}

export function summarizeChemicalAssessments(
  assessments: ChemicalScenarioAssessment[],
) {
  if (assessments.some(({ outcome }) => outcome === 'include'))
    return 'include';
  return areChemicalAssessmentsComplete(assessments) ? 'exclude' : 'pending';
}

export function canReportExclusion(decision: ChemicalPrioritizationDecision) {
  return (
    decision.inventory === 'exclude' && Boolean(decision.justification.trim())
  );
}

export function describeChemicalScenario(
  scenario: ChemicalUseScenarioBoardRow,
) {
  return [
    scenario.product.tradeName,
    scenario.activityName || 'Atividade não informada',
    `Setor: ${scenario.sectorSnapshot || 'não informado'}`,
    `Frequência: ${scenario.frequencyCount ?? 'não informada'} ${scenario.frequencyPeriod ?? ''}`.trim(),
    `Duração: ${scenario.durationMinutes == null ? 'não informada' : `${scenario.durationMinutes} min`}`,
    `Quantidade: ${scenario.quantity ? [formatChemicalScenarioQuantity(scenario.quantity), scenario.quantityUnit].filter(Boolean).join(' ') : 'não informada'}`,
    `Maior contato: ${scenario.peakContactMoment || 'não informado'}`,
    `Controles existentes: ${scenario.controlMeasures || 'não informados'}`,
    scenario.sourceRows.length
      ? `Linhas de origem: ${scenario.sourceRows.join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

export function buildChemicalExclusionReport(
  groups: ChemicalPrioritizationGroup[],
  decisions: Partial<Record<string, ChemicalPrioritizationDecision>>,
) {
  return groups.flatMap(
    ({ key, factor, gse, scenarios, hasPendingEvidence }) => {
      const decision = decisions[key];
      if (hasPendingEvidence || !decision || !canReportExclusion(decision))
        return [];
      return [
        {
          key,
          title: `${factor.name}${factor.cas ? ` (CAS ${factor.cas})` : ''} · ${gse.name}`,
          scenarios: scenarios.map(describeChemicalScenario),
          justification: decision.justification.trim(),
          reference: decision.reference.trim(),
        },
      ];
    },
  );
}

export function formatChemicalExclusionChapter(
  entries: ReturnType<typeof buildChemicalExclusionReport>,
) {
  return [
    'Justificativas de fatores químicos não priorizados',
    ...entries.map((entry) =>
      [
        entry.title,
        ...entry.scenarios,
        `Justificativa: ${entry.justification}`,
        entry.reference
          ? `Limite, método ou referência: ${entry.reference}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  ].join('\n\n');
}
