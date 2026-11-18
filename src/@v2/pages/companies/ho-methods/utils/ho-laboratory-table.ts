import {
  calculateNr15Vmp,
  hasNr15TetoMarker,
  formatVmpHelperText,
} from './ho-method-nr15-vmp.util';
import type {
  HoMethodAgentRecord,
  HoMethodRecord,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

export function laboratoryRows(
  methods: HoMethodRecord[],
  laboratoryId: string,
) {
  return methods
    .flatMap((method) =>
      method.laboratories
        .filter((lab) => lab.laboratoryId === laboratoryId)
        .flatMap((lab) => {
          const agents = method.agents.length
            ? method.agents
            : [
                {
                  id: method.id,
                  riskFactorId: method.riskFactorId ?? '',
                  agentName: method.agentName,
                  cas: method.cas,
                  riskFactor: method.riskFactor,
                  evaluationConditions: method.evaluationConditions,
                } as HoMethodAgentRecord,
              ];
          return agents
            .filter(
              (agent) =>
                !lab.riskFactorId || agent.riskFactorId === lab.riskFactorId,
            )
            .map((agent) => ({ method, lab, agent }));
        }),
    )
    .sort((left, right) =>
      (left.agent.agentName ?? '').localeCompare(
        right.agent.agentName ?? '',
        'pt-BR',
      ),
    );
}

// Columns express evaluation types. Sources remain attached to each value;
// NR-15 jornada is not silently recategorized as TWA or VMP.
export function laboratoryLimits(agent: HoMethodAgentRecord): string[] {
  const groups = [
    new Set<string>(),
    new Set<string>(),
    new Set<string>(),
    new Set<string>(),
    new Set<string>(),
  ];
  const risk = agent.riskFactor;
  const add = (index: number, source: string, value?: string | null) => {
    if (value?.trim() && !/^[—–-]+$/.test(value.trim()))
      groups[index].add(
        `${source}: ${value}${risk?.unit ? ` ${risk.unit}` : ''}`,
      );
  };
  if (risk) {
    add(0, 'ACGIH', risk.twa);
    add(0, 'NIOSH REL', risk.nioshRel);
    add(0, 'OSHA PEL', risk.oshaPel);
    add(0, 'AIHA WEEL', risk.aihaWeel);
    add(1, 'ACGIH', risk.stel);
    add(1, 'NIOSH', risk.nioshStel);
    add(1, 'OSHA', risk.oshaStel);
    add(1, 'AIHA', risk.aihaWeelStel);
    add(2, 'ACGIH', risk.acgihCeiling);
    add(2, 'NIOSH', risk.nioshCeiling);
    add(2, 'OSHA', risk.oshaCeiling);
    add(2, 'AIHA', risk.aihaWeelCeiling);
    add(hasNr15TetoMarker(risk.nr15lt) ? 2 : 3, 'NR-15', risk.nr15lt);
  }
  for (const condition of agent.evaluationConditions ?? []) {
    const index = (
      {
        TWA: 0,
        STEL: 1,
        CEILING: 2,
        NR15_TETO: 2,
        ACGIH_CEILING: 2,
        CMPT: 3,
        VMP: 4,
      } as Record<string, number>
    )[condition.evaluationType];
    if (index == null) continue;
    if (condition.limitValue)
      groups[index].add(
        `Condição cadastrada: ${condition.limitValue}${condition.limitUnit ? ` ${condition.limitUnit}` : ''}`,
      );
  }
  // Derive only from a single positive numeric NR-15 jornada limit, never
  // from ceiling markers, formulae, ranges, or another reference's TWA.
  const rawLt = risk?.nr15lt?.trim();
  const numericLt =
    rawLt && /^\d+(?:[.,]\d+)?(?:\s*(?:ppm|mg\/m[³3]))?$/i.test(rawLt)
      ? Number(rawLt.replace(/\s*(?:ppm|mg\/m[³3])$/i, '').replace(',', '.'))
      : null;
  if (numericLt != null && numericLt > 0 && !groups[4].size) {
    const { vmp } = calculateNr15Vmp(numericLt);
    if (Number.isFinite(vmp))
      groups[4].add(`NR-15: ${formatVmpHelperText(numericLt, risk?.unit)}`);
  }
  return groups.map((group) => [...group].join('\n'));
}
