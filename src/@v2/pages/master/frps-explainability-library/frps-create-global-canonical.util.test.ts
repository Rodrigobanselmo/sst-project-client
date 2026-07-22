/**
 * Executar: npx tsx --test src/@v2/pages/master/frps-explainability-library/frps-create-global-canonical.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { FrpsCatalogAdminItem } from '@v2/services/forms/frps-explainability-library';

import {
  buildCreateGlobalCanonicalPayload,
  buildCreateGlobalPreview,
  canShowCreateGlobalCanonicalAction,
  FRPS_CREATE_GLOBAL_VALIDATED_BLOCK_MESSAGE,
  getCreateGlobalValidatedBlockReason,
  getEligibleLocalItemsForCreateGlobal,
  resolveCreateGlobalBaseAlias,
} from './frps-create-global-canonical.util';

function item(
  overrides: Partial<FrpsCatalogAdminItem> &
    Pick<FrpsCatalogAdminItem, 'id' | 'origin'>,
): FrpsCatalogAdminItem {
  const itemType = overrides.itemType ?? 'ADMINISTRATIVE_RECOMMENDATION';
  return {
    label: overrides.label ?? overrides.id,
    kind: overrides.kind ?? 'REC_MED',
    itemType,
    recType: itemType === 'ENGINEERING_RECOMMENDATION' ? 'ENG' : 'ADM',
    medType: null,
    riskId: overrides.riskId ?? 'risk-1',
    riskName: overrides.riskName ?? 'Risco',
    riskType: 'ERG',
    riskSubType: null,
    system: overrides.origin === 'GLOBAL',
    companyId: overrides.origin === 'GLOBAL' ? 'sys' : 'company-1',
    companyName: overrides.origin === 'GLOBAL' ? 'SimpleSST' : 'Empresa A',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    activeEquivalence: null,
    parentCanonicalId: null,
    isCanonical: false,
    aliasCount: 0,
    conceptualExplanation: {
      status: 'NEVER_GENERATED',
      explanationId: null,
      itemKey: `catalog:${itemType}:${overrides.id}`,
    },
    ...overrides,
  };
}

describe('frps-create-global-canonical util', () => {
  it('1) ação aparece com LOCAL elegível no picker manual sem canônico', () => {
    assert.equal(
      canShowCreateGlobalCanonicalAction({
        aliases: [item({ id: 'l1', origin: 'LOCAL' })],
        hasSelectedCanonical: false,
        manualPickerVisible: true,
        createFlowOpen: false,
      }),
      true,
    );
  });

  it('2) ação não aparece sem LOCAL elegível', () => {
    assert.equal(
      canShowCreateGlobalCanonicalAction({
        aliases: [item({ id: 'g1', origin: 'GLOBAL' })],
        hasSelectedCanonical: false,
        manualPickerVisible: true,
        createFlowOpen: false,
      }),
      false,
    );
  });

  it('3) múltiplos itens exigem escolha explícita do base', () => {
    const aliases = [
      item({ id: 'l1', origin: 'LOCAL', label: 'A' }),
      item({ id: 'l2', origin: 'LOCAL', label: 'B' }),
    ];
    assert.equal(
      resolveCreateGlobalBaseAlias({ aliases, selectedBaseId: null }),
      null,
    );
    assert.equal(
      resolveCreateGlobalBaseAlias({ aliases, selectedBaseId: 'l2' })?.id,
      'l2',
    );
  });

  it('4) item VALIDATED bloqueia', () => {
    const reason = getCreateGlobalValidatedBlockReason([
      item({
        id: 'l1',
        origin: 'LOCAL',
        conceptualExplanation: {
          status: 'VALIDATED',
          explanationId: 'e1',
          itemKey: 'k1',
        },
      }),
    ]);
    assert.equal(reason, FRPS_CREATE_GLOBAL_VALIDATED_BLOCK_MESSAGE);
  });

  it('5) prévia mostra texto/tipo/risco/quantidade', () => {
    const base = item({
      id: 'l1',
      origin: 'LOCAL',
      label: 'Ausência de reconhecimento',
      riskName: 'Carga mental',
      itemType: 'ADMINISTRATIVE_RECOMMENDATION',
    });
    const preview = buildCreateGlobalPreview({
      base,
      aliases: [base, item({ id: 'l2', origin: 'LOCAL' })],
    });
    assert.equal(preview.baseLabel, 'Ausência de reconhecimento');
    assert.equal(preview.riskName, 'Carga mental');
    assert.equal(preview.linkCount, 2);
    assert.equal(preview.originLabel, 'LOCAL');
  });

  it('7) payload único inclui base e demultiplexa IDs', () => {
    const base = item({ id: 'l1', origin: 'LOCAL', kind: 'GENERATE_SOURCE' });
    const payload = buildCreateGlobalCanonicalPayload({
      base,
      aliases: [
        base,
        item({ id: 'l2', origin: 'LOCAL', kind: 'GENERATE_SOURCE' }),
        item({ id: 'l2', origin: 'LOCAL', kind: 'GENERATE_SOURCE' }),
      ],
      equivalenceType: 'SEMANTIC_ALIAS',
    });
    assert.deepEqual(payload.aliasIds, ['l1', 'l2']);
    assert.equal(payload.baseAliasId, 'l1');
    assert.equal(payload.kind, 'GENERATE_SOURCE');
  });

  it('DRAFT_AI não bloqueia; elegíveis excluem já vinculados', () => {
    assert.equal(
      getCreateGlobalValidatedBlockReason([
        item({
          id: 'l1',
          origin: 'LOCAL',
          conceptualExplanation: {
            status: 'DRAFT_AI',
            explanationId: 'e1',
            itemKey: 'k1',
          },
        }),
      ]),
      null,
    );

    const eligible = getEligibleLocalItemsForCreateGlobal([
      item({ id: 'l1', origin: 'LOCAL' }),
      item({
        id: 'l2',
        origin: 'LOCAL',
        activeEquivalence: {
          equivalenceId: 'eq',
          canonicalId: 'g1',
          canonicalLabel: 'G',
          equivalenceType: 'SEMANTIC_ALIAS',
        },
        parentCanonicalId: 'g1',
      }),
    ]);
    assert.deepEqual(
      eligible.map((row) => row.id),
      ['l1'],
    );
  });

  it('um único LOCAL resolve base automaticamente', () => {
    const only = item({ id: 'solo', origin: 'LOCAL' });
    assert.equal(
      resolveCreateGlobalBaseAlias({
        aliases: [only],
        selectedBaseId: null,
      })?.id,
      'solo',
    );
  });
});
