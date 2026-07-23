/**
 * Executar: npx tsx --test src/@v2/pages/master/frps-explainability-library/frps-library-conceptual-validate.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { FrpsCatalogAdminItem } from '@v2/services/forms/frps-explainability-library';

import { FRPS_GLOBAL_COMPANY_DISPLAY_NAME } from './frps-catalog-admin-equivalence.util';
import { mapFrpsLibraryItemToTableRow } from './frps-explainability-library-filters.util';
import {
  FRPS_VALIDATE_CONCEPTUAL_BUTTON_LABEL,
  FRPS_VALIDATE_CONCEPTUAL_CONFIRM_BODY,
  FRPS_VALIDATE_CONCEPTUAL_CONFIRM_TITLE,
  FRPS_VALIDATE_CONCEPTUAL_SUCCESS_MESSAGE,
} from './frps-explainability-library-ux.constants';
import {
  canShowFrpsLibraryConceptualValidateAction,
  formatFrpsValidatedAtLabel,
} from './frps-library-conceptual-validate.util';

function buildGlobalSimpleSstDraftItem(
  overrides: Partial<FrpsCatalogAdminItem> = {},
): FrpsCatalogAdminItem {
  return {
    id: 'gs-simplesst-canonical',
    label: 'Fonte canônica SimpleSST',
    kind: 'GENERATE_SOURCE',
    itemType: 'SOURCE',
    recType: null,
    medType: null,
    riskId: 'risk-1',
    riskName: 'Risco FRPS',
    riskType: 'ERG',
    riskSubType: null,
    system: true,
    companyId: 'system-company',
    companyName: 'SimpleSST',
    status: 'ACTIVE',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-22T00:00:00.000Z',
    origin: 'GLOBAL',
    activeEquivalence: null,
    parentCanonicalId: null,
    // API: isCanonical === aliasCount > 0 — canônico sem aliases fica false.
    isCanonical: false,
    aliasCount: 0,
    catalogUsability: 'USABLE',
    generateable: true,
    conceptualExplanation: {
      status: 'DRAFT_AI',
      explanationId: 'exp-simplesst-draft',
      itemKey: 'catalog:SOURCE:gs-simplesst-canonical',
    },
    ...overrides,
  };
}

describe('FRPS library conceptual validate UX', () => {
  it('SimpleSST GLOBAL draft without aliases shows Validar explicação (MASTER)', () => {
    const item = buildGlobalSimpleSstDraftItem();
    const row = mapFrpsLibraryItemToTableRow(item);

    assert.equal(row.companyName, FRPS_GLOBAL_COMPANY_DISPLAY_NAME);
    assert.equal(row.origin, 'GLOBAL');
    assert.equal(row.isAliasRow, false);
    assert.equal(row.isCanonical, false); // payload real: sem aliases
    assert.equal(row.status, 'DRAFT_AI');
    assert.equal(row.conceptualExplanationId, 'exp-simplesst-draft');
    assert.equal(row.raw.system, true);

    assert.equal(
      canShowFrpsLibraryConceptualValidateAction({
        isMaster: true,
        origin: row.origin,
        isAliasRow: row.isAliasRow,
        conceptualExplanationId: row.conceptualExplanationId,
        validationStatus: row.status,
      }),
      true,
    );
    assert.equal(FRPS_VALIDATE_CONCEPTUAL_BUTTON_LABEL, 'Validar explicação');
  });

  it('GLOBAL with aliases (isCanonical true) still shows validate when DRAFT', () => {
    assert.equal(
      canShowFrpsLibraryConceptualValidateAction({
        isMaster: true,
        origin: 'GLOBAL',
        isAliasRow: false,
        conceptualExplanationId: 'exp-1',
        validationStatus: 'DRAFT_AI',
      }),
      true,
    );
  });

  it('VALIDATED hides validate action', () => {
    assert.equal(
      canShowFrpsLibraryConceptualValidateAction({
        isMaster: true,
        origin: 'GLOBAL',
        isAliasRow: false,
        conceptualExplanationId: 'exp-1',
        validationStatus: 'VALIDATED',
      }),
      false,
    );
  });

  it('alias local hides validate action', () => {
    const alias = buildGlobalSimpleSstDraftItem({
      id: 'local-alias',
      system: false,
      origin: 'LOCAL',
      companyName: 'Empresa Local',
      isCanonical: false,
      activeEquivalence: {
        equivalenceId: 'eq-1',
        canonicalId: 'gs-simplesst-canonical',
        canonicalLabel: 'Fonte canônica SimpleSST',
        equivalenceType: 'SEMANTIC_ALIAS',
      },
      parentCanonicalId: 'gs-simplesst-canonical',
      conceptualExplanation: {
        status: 'DRAFT_AI',
        explanationId: 'exp-alias',
        itemKey: 'catalog:SOURCE:local-alias',
      },
    });
    const row = mapFrpsLibraryItemToTableRow(alias);
    assert.equal(row.isAliasRow, true);
    assert.equal(
      canShowFrpsLibraryConceptualValidateAction({
        isMaster: true,
        origin: row.origin,
        isAliasRow: row.isAliasRow,
        conceptualExplanationId: row.conceptualExplanationId,
        validationStatus: row.status,
      }),
      false,
    );
  });

  it('non-MASTER hides action', () => {
    assert.equal(
      canShowFrpsLibraryConceptualValidateAction({
        isMaster: false,
        origin: 'GLOBAL',
        isAliasRow: false,
        conceptualExplanationId: 'exp-1',
        validationStatus: 'DRAFT_AI',
      }),
      false,
    );
  });

  it('without explanationId hides action', () => {
    assert.equal(
      canShowFrpsLibraryConceptualValidateAction({
        isMaster: true,
        origin: 'GLOBAL',
        isAliasRow: false,
        conceptualExplanationId: null,
        validationStatus: 'DRAFT_AI',
      }),
      false,
    );
  });

  it('copy and audit formatting helpers', () => {
    assert.equal(
      FRPS_VALIDATE_CONCEPTUAL_CONFIRM_TITLE,
      'Validar esta explicação conceitual?',
    );
    assert.match(FRPS_VALIDATE_CONCEPTUAL_CONFIRM_BODY, /não será copiado/i);
    assert.equal(
      FRPS_VALIDATE_CONCEPTUAL_SUCCESS_MESSAGE,
      'Explicação validada com sucesso.',
    );
    assert.ok(formatFrpsValidatedAtLabel('2026-07-22T12:00:00.000Z'));
    assert.equal(formatFrpsValidatedAtLabel(null), null);
  });
});
