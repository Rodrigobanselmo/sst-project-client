/**
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddRisk/components/RiskQuiContent/occupational-limit-apply.util.spec.ts
 */
import type { ChemicalOccupationalEnrichResult } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  assertNoLegacyLimitString,
  buildOccupationalFormPatch,
  buildOccupationalReviewRows,
} from './occupational-limit-apply.util';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const baseResult = {
  identity: { cas: '67-64-1', officialName: 'Acetona' },
  enabled: true,
  sourcesConsulted: ['NIOSH_POCKET_GUIDE', 'OSHA_OCCUPATIONAL_CHEMICAL_DB'],
  prefill: {
    nioshRel: '250',
    nioshStel: null,
    nioshCeiling: null,
    ipvs: '2500',
    oshaPel: '1000',
    oshaStel: null,
    oshaCeiling: null,
    unit: 'ppm',
    breather: null,
    json: {
      ipvs: {
        unit: 'ppm',
        reference: 'https://www.cdc.gov/niosh/npg/npgd0004.html',
        origin: 'NIOSH Pocket Guide to Chemical Hazards',
      },
    },
  },
  occupationalData: {
    cas: '67-64-1',
    queriedName: 'Acetona',
    matchKind: 'CAS',
    matchConfidence: 'HIGH',
    niosh: null,
    osha: null,
    suggestedUnit: 'ppm',
    unitConflict: false,
    unitReviewRequired: false,
    unitConflictDetails: [],
    attempts: [],
    warnings: [],
    traces: [
      {
        riskField: 'nioshRel',
        source: 'NIOSH_POCKET_GUIDE',
        sourceName: 'NIOSH',
        sourceField: 'RELTWAppm',
        raw: '250 ppm',
        normalizedValue: '250',
        formValue: '250',
        numericValue: '250',
        unit: 'ppm',
        applyStatus: 'APPLY_SAFE',
        hasMultipleUnits: false,
        alternateRepresentations: [],
        sourceUrl: null,
      },
      {
        riskField: 'oshaPel',
        source: 'OSHA_OCCUPATIONAL_CHEMICAL_DB',
        sourceName: 'OSHA',
        sourceField: 'PELTWAppm',
        raw: '1000 ppm',
        normalizedValue: '1000',
        formValue: '1000',
        numericValue: '1000',
        unit: 'ppm',
        applyStatus: 'APPLY_SAFE',
        hasMultipleUnits: false,
        alternateRepresentations: [],
        sourceUrl: null,
      },
      {
        riskField: 'ipvs',
        source: 'NIOSH_POCKET_GUIDE',
        sourceName: 'NIOSH',
        sourceField: 'IDLHppm',
        raw: '2500 ppm',
        normalizedValue: '2500',
        formValue: '2500',
        numericValue: '2500',
        unit: 'ppm',
        applyStatus: 'APPLY_SAFE',
        hasMultipleUnits: false,
        alternateRepresentations: [],
        sourceUrl: 'https://www.cdc.gov/niosh/npg/npgd0004.html',
      },
      {
        riskField: 'unit',
        source: 'OSHA_OCCUPATIONAL_CHEMICAL_DB',
        sourceName: 'Derived',
        sourceField: 'derived',
        raw: 'ppm',
        normalizedValue: 'ppm',
        formValue: 'ppm',
        numericValue: null,
        unit: 'ppm',
        applyStatus: 'APPLY_SAFE',
        hasMultipleUnits: false,
        alternateRepresentations: [],
        sourceUrl: null,
      },
    ],
    notFoundMessage: null,
    retrievedAt: '2026-01-01T00:00:00.000Z',
  },
} as ChemicalOccupationalEnrichResult;

// 1) formulário vazio → FILL
{
  const rows = buildOccupationalReviewRows(baseResult, {});
  const niosh = rows.find((r) => r.field === 'nioshRel')!;
  const osha = rows.find((r) => r.field === 'oshaPel')!;
  const ipvs = rows.find((r) => r.field === 'ipvs')!;
  assert(niosh.action === 'FILL', 'nioshRel FILL');
  assert(osha.action === 'FILL', 'oshaPel FILL');
  assert(ipvs.action === 'FILL', 'ipvs FILL');
  const patch = buildOccupationalFormPatch(rows, baseResult, {});
  assert(patch.nioshRel === '250', 'patch nioshRel');
  assert(patch.oshaPel === '1000', 'patch oshaPel');
  assert(patch.ipvs === '2500', 'patch ipvs');
  assert(patch.json?.ipvs?.unit === 'ppm', 'patch json.ipvs.unit');
  assert(assertNoLegacyLimitString(patch.oshaPel), 'no legacy oshaPel');
}

// 2) valor existente igual → SKIP_EXISTING (não sobrescreve)
{
  const rows = buildOccupationalReviewRows(baseResult, {
    nioshRel: '250',
    oshaPel: '',
  });
  assert(
    rows.find((r) => r.field === 'nioshRel')!.action === 'SKIP_EXISTING',
    'existing equal skip',
  );
  assert(rows.find((r) => r.field === 'oshaPel')!.action === 'FILL', 'empty fill');
  const patch = buildOccupationalFormPatch(rows, baseResult, {
    nioshRel: '250',
  });
  assert(patch.nioshRel == null, 'não inclui nioshRel no patch');
  assert(patch.oshaPel === '1000', 'preenche oshaPel vazio');
}

// 3) divergência → SKIP_DIVERGENCE
{
  const rows = buildOccupationalReviewRows(baseResult, { oshaPel: '500' });
  const osha = rows.find((r) => r.field === 'oshaPel')!;
  assert(osha.action === 'SKIP_DIVERGENCE', 'divergence skip');
  assert(osha.divergent === true, 'marked divergent');
  const patch = buildOccupationalFormPatch(rows, baseResult, { oshaPel: '500' });
  assert(patch.oshaPel == null, 'não sobrescreve divergência');
}

// 4) UNIT_REVIEW_REQUIRED → não FILL
{
  const multi = {
    ...baseResult,
    prefill: { ...baseResult.prefill, oshaPel: null, unit: null },
    occupationalData: {
      ...baseResult.occupationalData,
      unitConflict: true,
      unitReviewRequired: true,
      suggestedUnit: null,
      traces: [
        {
          riskField: 'oshaPel',
          source: 'OSHA_OCCUPATIONAL_CHEMICAL_DB',
          sourceName: 'OSHA',
          sourceField: 'PELTWA',
          raw: '400 ppm (1200 mg/m³)',
          normalizedValue: '400',
          formValue: null,
          numericValue: '400',
          unit: null,
          applyStatus: 'UNIT_REVIEW_REQUIRED',
          hasMultipleUnits: true,
          alternateRepresentations: [
            { numeric: '400', unit: 'ppm', rawFragment: '400 ppm' },
            { numeric: '1200', unit: 'mg/m3', rawFragment: '1200 mg/m³' },
          ],
          sourceUrl: null,
        },
      ],
    },
  } as ChemicalOccupationalEnrichResult;
  const rows = buildOccupationalReviewRows(multi, {});
  const osha = rows.find((r) => r.field === 'oshaPel')!;
  assert(osha.action === 'SKIP_UNIT_REVIEW', 'unit review skip');
  assert(osha.alternateRepresentations.length === 2, 'shows alternates');
}

assert(assertNoLegacyLimitString('400') === true, 'numeric ok');
assert(assertNoLegacyLimitString('400 ppm') === false, 'legacy ppm rejected');
assert(
  assertNoLegacyLimitString('400 ppm (1200 mg/m³)') === false,
  'legacy concat rejected',
);

console.log('occupational-limit-apply.util.spec.ts OK');
