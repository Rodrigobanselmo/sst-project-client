/**
 * Executar:
 * npx tsx --test src/@v2/pages/companies/forms/pages/consolidated/components/FormConsolidatedRiskAnalysisSection/consolidated-risk-analysis.utils.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { ConsolidatedViewRiskAnalysisItemModel } from '@v2/models/enterprise/company-group/consolidated-view-risk-analysis.model';
import { FRPS_OCCUPATIONAL_FILTER_LEVELS } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/frps-occupational-summary.util';

import {
  buildConsolidatedRiskFactorGroups,
  buildConsolidatedRiskViewSections,
  filterConsolidatedRiskItems,
  toConsolidatedRiskLevelFilterLabel,
} from './consolidated-risk-analysis.utils';

const here = dirname(fileURLToPath(import.meta.url));
const allLevels = new Set<number>(FRPS_OCCUPATIONAL_FILTER_LEVELS);

const baseFilters = {
  search: '',
  companyFilter: '',
  applicationFilter: '',
  statusFilter: '',
};

function item(
  partial: Partial<ConsolidatedViewRiskAnalysisItemModel> &
    Pick<
      ConsolidatedViewRiskAnalysisItemModel,
      'id' | 'riskFactorId' | 'riskLevel' | 'occupationalRisk'
    >,
): ConsolidatedViewRiskAnalysisItemModel {
  return {
    riskAnalysisId: null,
    formApplicationId: 'app-1',
    applicationName: 'Aplicação',
    companyId: 'company-1',
    companyName: 'Empresa',
    establishmentId: null,
    establishmentName: null,
    sectorId: partial.id,
    sectorName: partial.id,
    hierarchyId: partial.id,
    hierarchyName: partial.id,
    hierarchyType: 'sector',
    riskFactor: 'Fator',
    riskCategory: null,
    riskType: 'FRPS',
    probability: null,
    probabilityLabel: '',
    severity: null,
    severityLabel: '',
    generatingSources: [],
    recommendations: [],
    aiAnalysis: null,
    status: null,
    inInventory: false,
    createdAt: null,
    updatedAt: null,
    origin: {
      formApplicationId: 'app-1',
      companyId: 'company-1',
      riskAnalysisId: null,
    },
    ...partial,
  };
}

describe('filtro de nível do consolidado', () => {
  it('com os cinco níveis ativos não restringe, inclusive sem classificação', () => {
    const items = [
      item({ id: 'a', riskFactorId: 'f', riskLevel: 2, occupationalRisk: 'Baixo' }),
      item({
        id: 'b',
        riskFactorId: 'f',
        riskLevel: null,
        occupationalRisk: 'Não informado',
      }),
      item({
        id: 'c',
        riskFactorId: 'f',
        riskLevel: 6,
        occupationalRisk: 'Interromper',
      }),
    ];

    const visible = filterConsolidatedRiskItems(items, {
      ...baseFilters,
      selectedRiskLevels: allLevels,
    });

    assert.deepEqual(
      visible.map((entry) => entry.id),
      ['a', 'b', 'c'],
    );
    assert.equal(toConsolidatedRiskLevelFilterLabel(allLevels), '');
  });

  it('com menos de cinco níveis compara riskLevel numérico e ignora o texto', () => {
    const items = [
      item({
        id: 'alto-texto-errado',
        riskFactorId: 'f',
        riskLevel: 5,
        occupationalRisk: 'Muito alto',
      }),
      item({
        id: 'texto-muito-alto-nivel-baixo',
        riskFactorId: 'f',
        riskLevel: 2,
        occupationalRisk: 'Muito Alto',
      }),
      item({
        id: 'sem-numero',
        riskFactorId: 'f',
        riskLevel: null,
        occupationalRisk: 'Baixo',
      }),
    ];

    const visible = filterConsolidatedRiskItems(items, {
      ...baseFilters,
      selectedRiskLevels: new Set([5]),
    });

    assert.deepEqual(
      visible.map((entry) => entry.id),
      ['alto-texto-errado'],
    );
    assert.equal(toConsolidatedRiskLevelFilterLabel(new Set([5])), 'Muito Alto');
    assert.equal(
      toConsolidatedRiskLevelFilterLabel(new Set([2, 3])),
      'Baixo, Moderado',
    );
    assert.equal(toConsolidatedRiskLevelFilterLabel(new Set()), 'nenhum nível');
  });

  it('filtra os registros antes do agrupamento e mantém o fator com o recorte', () => {
    const moderados = Array.from({ length: 23 }, (_, index) =>
      item({
        id: `mod-${index}`,
        riskFactorId: 'fator-misto',
        riskFactor: 'Fator misto',
        riskLevel: 3,
        occupationalRisk: 'Moderado',
        companyId: `company-${index}`,
      }),
    );
    const baixo = item({
      id: 'baixo-1',
      riskFactorId: 'fator-misto',
      riskFactor: 'Fator misto',
      riskLevel: 2,
      occupationalRisk: 'Baixo',
      companyId: 'company-baixo',
      companyName: 'Empresa Baixo',
    });

    const visible = filterConsolidatedRiskItems([...moderados, baixo], {
      ...baseFilters,
      selectedRiskLevels: new Set([2]),
    });
    const sections = buildConsolidatedRiskViewSections(visible, 'none');
    const groups = buildConsolidatedRiskFactorGroups(sections[0].items);

    assert.equal(groups.length, 1);
    assert.equal(groups[0].riskFactorId, 'fator-misto');
    assert.deepEqual(
      groups[0].entries.map((entry) => entry.id),
      ['baixo-1'],
    );
    assert.equal(groups[0].stats.totalEntries, 1);
    assert.equal(groups[0].stats.highestNro, 'Baixo');
    assert.equal(groups[0].stats.nroDistribution.length, 1);
  });

  it('mantém busca, empresa, aplicação e status junto do recorte de nível', () => {
    const items = [
      item({
        id: 'certo',
        riskFactorId: 'f',
        riskLevel: 4,
        occupationalRisk: 'Alto',
        companyId: 'c1',
        formApplicationId: 'a1',
        status: 'Concluída',
        sectorName: 'Almoxarifado',
      }),
      item({
        id: 'outra-empresa',
        riskFactorId: 'f',
        riskLevel: 4,
        occupationalRisk: 'Alto',
        companyId: 'c2',
        formApplicationId: 'a1',
        status: 'Concluída',
        sectorName: 'Almoxarifado',
      }),
    ];

    const visible = filterConsolidatedRiskItems(items, {
      search: 'almox',
      companyFilter: 'c1',
      applicationFilter: 'a1',
      statusFilter: 'Concluída',
      selectedRiskLevels: new Set([4]),
    });

    assert.deepEqual(
      visible.map((entry) => entry.id),
      ['certo'],
    );
  });

  it('a seção usa só as pílulas como controle desse filtro', () => {
    const source = readFileSync(
      join(here, 'FormConsolidatedRiskAnalysisSection.tsx'),
      'utf8',
    );

    assert.match(source, /FrpsOccupationalRiskFilter/);
    assert.equal(source.includes('consolidated-risk-level-filter'), false);
    assert.equal(source.includes('setRiskLevelFilter'), false);
    assert.match(source, /toConsolidatedRiskLevelFilterLabel\(selectedRiskLevels\)/);
    assert.match(source, /selectedRiskLevels,/);
  });
});
