import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildLocalAppliedAnalysisItemKey,
  resolveTargetAnalysisItemStatus,
} from './resolveTargetAnalysisItemStatus';

describe('resolveTargetAnalysisItemStatus catalogId preservation', () => {
  const sourceAnalysisId = 'analysis-source';
  const riskId = 'risk-1';
  const targetHierarchyId = 'hierarchy-target';
  const itemName =
    'Organizar a jornada de trabalho com pausas cognitivas regulares';

  const analysisInventoryStatus = {
    [sourceAnalysisId]: {
      fontesGeradoras: [],
      medidasEngenhariaRecomendadas: [],
      medidasAdministrativasRecomendadas: [
        {
          existsInInventory: false,
          existsInCatalog: true,
          catalogId: 'system-adm-1',
        },
      ],
    },
  };

  it('keeps catalogId when resolving inventory status from riskData', () => {
    const status = resolveTargetAnalysisItemStatus({
      riskId,
      targetHierarchyId,
      itemType: 'medidasAdministrativasRecomendadas',
      itemName,
      itemIndex: 0,
      sourceAnalysisId,
      results: [],
      analysisInventoryStatus,
      riskDataForHierarchy: [
        {
          id: 'rd-1',
          riskId,
        } as any,
      ],
    });

    assert.equal(status?.catalogId, 'system-adm-1');
    assert.equal(status?.existsInCatalog, true);
  });

  it('keeps catalogId on locally applied items', () => {
    const status = resolveTargetAnalysisItemStatus({
      riskId,
      targetHierarchyId,
      itemType: 'medidasAdministrativasRecomendadas',
      itemName,
      itemIndex: 0,
      sourceAnalysisId,
      results: [],
      analysisInventoryStatus,
      locallyAppliedItemKeys: new Set([
        buildLocalAppliedAnalysisItemKey({
          riskId,
          targetHierarchyId,
          itemType: 'medidasAdministrativasRecomendadas',
          itemName,
        }),
      ]),
    });

    assert.equal(status?.catalogId, 'system-adm-1');
    assert.equal(status?.existsInInventory, true);
  });

  it('keeps catalogId when falling back to source status', () => {
    const status = resolveTargetAnalysisItemStatus({
      riskId,
      targetHierarchyId,
      itemType: 'medidasAdministrativasRecomendadas',
      itemName,
      itemIndex: 0,
      sourceAnalysisId,
      results: [],
      analysisInventoryStatus,
    });

    assert.equal(status?.catalogId, 'system-adm-1');
    assert.equal(status?.existsInInventory, false);
  });
});
