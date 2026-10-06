/**
 * Executar:
 * npx tsx --test src/@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/frps-occupational-distribution.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  FormAiAnalysisStatusEnum,
  type IFormQuestionsAnswersAnalysisBrowseResultModel,
} from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { buildRiskAnalysisDisplayPartitions } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildRiskAnalysisDisplayPartitions';
import { resolveOccupationalRiskLevel } from 'core/utils/helpers/occupational-risk-level.util';

import {
  aggregateFrpsOccupationalDistribution,
  type FrpsOccupationalDiagnosisRisk,
} from './frps-occupational-distribution.util';

const here = dirname(fileURLToPath(import.meta.url));

function doneAnalysis(
  riskId: string,
  hierarchyId: string,
): IFormQuestionsAnswersAnalysisBrowseResultModel {
  return {
    id: `${riskId}-${hierarchyId}`,
    companyId: 'company',
    formApplicationId: 'application',
    hierarchyId,
    riskId,
    status: FormAiAnalysisStatusEnum.DONE,
    analysis: {
      frps: 'frps',
      fontesGeradoras: [],
      medidasEngenhariaRecomendadas: [],
      medidasAdministrativasRecomendadas: [],
    },
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  };
}

function aggregate(
  risks: FrpsOccupationalDiagnosisRisk[],
  getEffectiveProbability: (entityId: string, riskId: string) => number,
  analysisResults: IFormQuestionsAnswersAnalysisBrowseResultModel[] = [],
) {
  return aggregateFrpsOccupationalDistribution({
    risks,
    analysisResults,
    getEffectiveProbability,
  });
}

function countOf(
  distribution: ReturnType<typeof aggregate>,
  level: number,
): number {
  return distribution.levels.find((entry) => entry.level === level)?.count ?? -1;
}

describe('distribuição gerencial de risco ocupacional', () => {
  it('conta o agrupamento uma vez e não reconta os setores membros', () => {
    const entityMap = {
      a: { id: 'a', name: 'Almoxarifado' },
      b: { id: 'b', name: 'Cozinha' },
      c: { id: 'c', name: 'Salão' },
      solo: { id: 'solo', name: 'Escritório' },
    };
    const partitions = buildRiskAnalysisDisplayPartitions({
      entityIds: ['a', 'b', 'c', 'solo'],
      hierarchyGroups: [
        {
          id: 'grupo',
          name: 'Operação',
          hierarchyIds: ['a', 'b', 'c'],
        },
      ],
      entityMap,
    });

    assert.deepEqual(
      partitions.groups[0].memberEntityIds,
      ['a', 'b', 'c'],
    );
    assert.deepEqual(partitions.ungrouped, ['solo']);

    const distribution = aggregate(
      [
        {
          riskId: 'frps-1',
          severity: 5,
          groups: partitions.groups.map((group) => ({
            memberEntityIds: group.memberEntityIds,
          })),
          ungroupedEntityIds: partitions.ungrouped,
        },
      ],
      () => 2,
    );

    assert.equal(resolveOccupationalRiskLevel(5, 2), 3);
    assert.equal(distribution.total, 2);
    assert.equal(distribution.classified, 2);
    assert.equal(distribution.unclassified, 0);
    assert.equal(countOf(distribution, 3), 2);
  });

  it('acumula FRPS diferentes no mesmo nível e usa o membro canônico do card', () => {
    const distribution = aggregate(
      [
        {
          riskId: 'frps-1',
          severity: 5,
          groups: [{ memberEntityIds: ['primeiro', 'canonico'] }],
          ungroupedEntityIds: [],
        },
        {
          riskId: 'frps-2',
          severity: 5,
          groups: [],
          ungroupedEntityIds: ['setor-2'],
        },
      ],
      (entityId) => (entityId === 'canonico' || entityId === 'setor-2' ? 3 : 1),
      [doneAnalysis('frps-1', 'canonico')],
    );

    assert.equal(resolveOccupationalRiskLevel(5, 1), 2);
    assert.equal(resolveOccupationalRiskLevel(5, 3), 4);
    assert.equal(distribution.total, 2);
    assert.equal(countOf(distribution, 2), 0);
    assert.equal(countOf(distribution, 4), 2);
  });

  it('deixa Não informado fora do percentual e trata zero classificados', () => {
    const mixed = aggregate(
      [
        {
          riskId: 'frps-1',
          severity: 5,
          groups: [],
          ungroupedEntityIds: ['baixo', 'moderado', 'sem-probabilidade'],
        },
      ],
      (entityId) => {
        if (entityId === 'baixo') return 1;
        if (entityId === 'moderado') return 2;
        return 0;
      },
    );

    assert.equal(mixed.total, 3);
    assert.equal(mixed.classified, 2);
    assert.equal(mixed.unclassified, 1);
    assert.equal(countOf(mixed, 2), 1);
    assert.equal(countOf(mixed, 3), 1);
    assert.equal(
      mixed.levels.find((entry) => entry.level === 2)?.percentage,
      50,
    );
    assert.equal(
      mixed.levels.find((entry) => entry.level === 3)?.percentage,
      50,
    );
    assert.equal(
      mixed.levels.find((entry) => entry.level === 1)?.percentage,
      0,
    );

    const none = aggregate(
      [
        {
          riskId: 'frps-vazio',
          severity: undefined,
          groups: [{ memberEntityIds: ['a', 'b'] }],
          ungroupedEntityIds: ['c'],
        },
      ],
      () => 4,
    );

    assert.equal(none.total, 2);
    assert.equal(none.classified, 0);
    assert.equal(none.unclassified, 2);
    assert.equal(
      none.levels.every((entry) => entry.count === 0 && entry.percentage == null),
      true,
    );
  });

  it('o resumo fica acima do filtro e as engrenagens gerais usam só o ícone', () => {
    const analysis = readFileSync(join(here, 'FormRisksAnalysis.tsx'), 'utf8');
    const narrative = readFileSync(
      join(here, 'RiskNarrativeDiagnosticSection.tsx'),
      'utf8',
    );
    const util = readFileSync(
      join(here, 'frps-occupational-distribution.util.ts'),
      'utf8',
    );
    const summaryIndex = analysis.indexOf('<FrpsOccupationalDistributionSummary');
    const filterIndex = analysis.indexOf('<FrpsOccupationalRiskFilter');
    const labelAt = analysis.indexOf('label={generalAnalyzeButtonLabel}');
    const generalButton = analysis.slice(
      Math.max(0, labelAt - 120),
      analysis.indexOf('Recuperar análises travadas'),
    );

    assert.ok(summaryIndex >= 0 && summaryIndex < filterIndex);
    assert.match(generalButton, /configureIconOnly/);
    assert.equal(generalButton.includes('selectedOccupationalLevels'), false);
    assert.match(narrative, /configureIconOnly/);
    assert.equal(util.includes('collectDistinctFrpsOccupationalLevels'), false);
    assert.equal(util.includes('selectedOccupationalLevels'), false);
    assert.match(util, /pickCanonicalGroupMemberId/);
    assert.match(util, /resolveOccupationalRiskLevel/);
  });
});
