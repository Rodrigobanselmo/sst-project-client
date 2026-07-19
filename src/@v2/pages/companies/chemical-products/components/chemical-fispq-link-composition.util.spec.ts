/**
 * Testes pontuais da comparação/montagem ao vincular FISPQ a produto existente.
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-fispq-link-composition.util.spec.ts
 */
import type { ParsedFispqIngredient } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  buildCompositionCompareRows,
  buildDefaultCompositionDecisions,
  buildLinkedFispqCompositionPayload,
  type CurrentCompositionIngredient,
} from './chemical-fispq-link-composition.util';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const current = (
  partial: Partial<CurrentCompositionIngredient> & {
    id: string;
    chemicalName: string;
  },
): CurrentCompositionIngredient => ({
  cas: null,
  concentrationKind: 'EXACT',
  exactPercent: 10,
  minPercent: null,
  maxPercent: null,
  riskFactorId: null,
  riskFactor: null,
  sortOrder: 0,
  ...partial,
});

const extracted = (
  partial: Partial<ParsedFispqIngredient> & { chemicalName: string },
): ParsedFispqIngredient => ({
  cas: null,
  concentrationKind: 'EXACT',
  exactPercent: 20,
  minPercent: null,
  maxPercent: null,
  riskFactorId: null,
  ...partial,
});

// 1. match por CAS
{
  const rows = buildCompositionCompareRows({
    currentIngredients: [
      current({
        id: 'c1',
        chemicalName: 'Ácido A',
        cas: '5329-14-6',
        riskFactorId: 'rf-1',
        sortOrder: 0,
      }),
    ],
    extractedIngredients: [
      extracted({ chemicalName: 'Acido A', cas: '5329-14-6', exactPercent: 50 }),
    ],
  });
  assert(rows.length === 1, 'cas match: one row');
  assert(
    rows[0].kind === 'divergent' || rows[0].kind === 'matched',
    'cas match kind',
  );
  assert(rows[0].canPreserveRiskFactor === true, 'cas match preserves rf flag');
}

// 2. fallback por nome quando não há CAS
{
  const rows = buildCompositionCompareRows({
    currentIngredients: [
      current({
        id: 'c1',
        chemicalName: 'Ácido Sulfâmico',
        cas: null,
        riskFactorId: 'rf-name',
      }),
    ],
    extractedIngredients: [
      extracted({ chemicalName: 'acido sulfamico', cas: null }),
    ],
  });
  assert(rows.length === 1, 'name match: one row');
  assert(rows[0].current?.riskFactorId === 'rf-name', 'name match current rf');
  assert(rows[0].canPreserveRiskFactor === true, 'name match preserve flag');
}

// 3. CAS diferente não faz match
{
  const rows = buildCompositionCompareRows({
    currentIngredients: [
      current({ id: 'c1', chemicalName: 'A', cas: '111-11-1', sortOrder: 0 }),
    ],
    extractedIngredients: [
      extracted({ chemicalName: 'A', cas: '222-22-2' }),
    ],
  });
  assert(rows.length === 2, 'different cas: two rows');
  assert(
    rows.some((row) => row.kind === 'current-only'),
    'different cas: current-only',
  );
  assert(
    rows.some((row) => row.kind === 'extracted-only'),
    'different cas: extracted-only',
  );
}

// 4 + 5. componente novo não herda fator; correspondente preserva fator
{
  const rows = buildCompositionCompareRows({
    currentIngredients: [
      current({
        id: 'c1',
        chemicalName: 'Old',
        cas: '5329-14-6',
        riskFactorId: 'rf-keep',
        exactPercent: 10,
        sortOrder: 0,
      }),
    ],
    extractedIngredients: [
      extracted({
        chemicalName: 'Old renamed',
        cas: '5329-14-6',
        exactPercent: 40,
        riskFactorId: 'rf-from-parse',
      }),
      extracted({
        chemicalName: 'Brand new',
        cas: '999-99-9',
        riskFactorId: 'rf-should-not-copy',
      }),
    ],
  });
  const decisions = buildDefaultCompositionDecisions(rows);
  const matched = rows.find(
    (row) => row.kind === 'matched' || row.kind === 'divergent',
  )!;
  const novel = rows.find((row) => row.kind === 'extracted-only')!;
  decisions[matched.id] = 'apply-extracted';
  decisions[novel.id] = 'add';

  const payload = buildLinkedFispqCompositionPayload({
    mode: 'document-and-composition',
    rows,
    decisions,
  });
  const applied = payload.find((item) => item.cas === '5329-14-6');
  const added = payload.find((item) => item.cas === '999-99-9');
  assert(applied?.riskFactorId === 'rf-keep', 'matched apply preserves rf');
  assert(applied?.exactPercent === 40, 'matched apply uses extracted %');
  assert(added?.riskFactorId == null, 'new does not inherit rf');
}

// 6. atual exclusivo mantido por padrão
{
  const rows = buildCompositionCompareRows({
    currentIngredients: [
      current({ id: 'c1', chemicalName: 'Only current', cas: '111-11-1' }),
    ],
    extractedIngredients: [],
  });
  const decisions = buildDefaultCompositionDecisions(rows);
  assert(decisions[rows[0].id] === 'keep', 'current-only default keep');
  const payload = buildLinkedFispqCompositionPayload({
    mode: 'document-and-composition',
    rows,
    decisions,
  });
  assert(payload.length === 1, 'kept current-only in payload');
  assert(payload[0].chemicalName === 'Only current', 'kept name');
}

// 7. novo extraído ignorado por padrão
{
  const rows = buildCompositionCompareRows({
    currentIngredients: [],
    extractedIngredients: [
      extracted({ chemicalName: 'Only extracted', cas: '333-33-3' }),
    ],
  });
  const decisions = buildDefaultCompositionDecisions(rows);
  assert(decisions[rows[0].id] === 'ignore', 'extracted-only default ignore');
  const payload = buildLinkedFispqCompositionPayload({
    mode: 'document-and-composition',
    rows,
    decisions,
  });
  assert(payload.length === 0, 'ignored extracted not in payload');
}

// 8. remoção só por decisão explícita
{
  const rows = buildCompositionCompareRows({
    currentIngredients: [
      current({ id: 'c1', chemicalName: 'Stay', cas: '111-11-1', sortOrder: 0 }),
      current({ id: 'c2', chemicalName: 'Drop', cas: '222-22-2', sortOrder: 1 }),
    ],
    extractedIngredients: [],
  });
  const decisions = buildDefaultCompositionDecisions(rows);
  const drop = rows.find((row) => row.current?.key === 'c2')!;
  assert(Boolean(drop), 'found current-only Drop row');
  decisions[drop.id] = 'remove';
  const payload = buildLinkedFispqCompositionPayload({
    mode: 'document-and-composition',
    rows,
    decisions,
  });
  assert(payload.length === 1, 'explicit remove only');
  assert(payload[0].chemicalName === 'Stay', 'kept Stay');
}

// 9. composição final não perde componentes mantidos
{
  const rows = buildCompositionCompareRows({
    currentIngredients: [
      current({
        id: 'c1',
        chemicalName: 'A',
        cas: '111-11-1',
        riskFactorId: 'rf-a',
        sortOrder: 0,
      }),
      current({
        id: 'c2',
        chemicalName: 'B',
        cas: '222-22-2',
        riskFactorId: 'rf-b',
        sortOrder: 1,
      }),
    ],
    extractedIngredients: [
      extracted({ chemicalName: 'A', cas: '111-11-1', exactPercent: 55 }),
    ],
  });
  const decisions = buildDefaultCompositionDecisions(rows);
  const payload = buildLinkedFispqCompositionPayload({
    mode: 'document-and-composition',
    rows,
    decisions,
  });
  assert(payload.length === 2, 'kept matched + current-only');
  assert(
    payload.some((item) => item.cas === '111-11-1'),
    'has A',
  );
  assert(
    payload.some((item) => item.cas === '222-22-2'),
    'has B',
  );
}

// 10. documento-only não gera payload de composição
{
  const rows = buildCompositionCompareRows({
    currentIngredients: [
      current({ id: 'c1', chemicalName: 'A', cas: '111-11-1' }),
    ],
    extractedIngredients: [
      extracted({ chemicalName: 'A', cas: '111-11-1' }),
    ],
  });
  const payload = buildLinkedFispqCompositionPayload({
    mode: 'document-only',
    rows,
    decisions: buildDefaultCompositionDecisions(rows),
  });
  assert(payload.length === 0, 'document-only empty payload');
}

console.log('chemical-fispq-link-composition.util.spec.ts: OK');
