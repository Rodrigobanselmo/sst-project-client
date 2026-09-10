/**
 * Executar com: npx tsx --test src/core/utils/helpers/consulting-user-companies.helper.spec.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  resolveConsultingEditCompanies,
  resolveInitialConsultingEditCompanies,
  shouldBlockConsultingUserSave,
} from './consulting-user-companies.helper';

const consulting = { id: 'eco', name: 'ECOVISAO', isGroup: false } as any;
const groupCompany = {
  id: 'group-synth',
  name: '(GRUPO EMPRESARIAL) Madeireira Brotas',
  isGroup: true,
} as any;

describe('consulting-user-companies.helper', () => {
  it('uses fetched access including isGroup companies', () => {
    const result = resolveConsultingEditCompanies({
      fetchedCompanies: [consulting, groupCompany],
      fallbackCompany: consulting,
    });

    assert.deepEqual(
      result.map((company) => company.id),
      ['eco', 'group-synth'],
    );
  });

  it('falls back to current company only when the API returns nothing', () => {
    const result = resolveConsultingEditCompanies({
      fetchedCompanies: [],
      fallbackCompany: consulting,
    });

    assert.deepEqual(
      result.map((company) => company.id),
      ['eco'],
    );
  });

  it('does not treat the current company as a complete consulting edit seed', () => {
    const result = resolveInitialConsultingEditCompanies({
      isConsultingEdit: true,
      fallbackCompany: consulting,
    });

    assert.deepEqual(result, []);
  });

  it('keeps an explicit companies list when the caller already provided one', () => {
    const result = resolveInitialConsultingEditCompanies({
      isConsultingEdit: true,
      initialCompanies: [consulting, groupCompany],
      fallbackCompany: consulting,
    });

    assert.equal(result.length, 2);
  });

  it('blocks save until consulting links are hydrated', () => {
    assert.equal(
      shouldBlockConsultingUserSave({
        isEdit: true,
        isConsulting: true,
        hasHydratedConsultingLinks: false,
      }),
      true,
    );
    assert.equal(
      shouldBlockConsultingUserSave({
        isEdit: true,
        isConsulting: true,
        hasHydratedConsultingLinks: true,
      }),
      false,
    );
    assert.equal(
      shouldBlockConsultingUserSave({
        isEdit: true,
        isConsulting: false,
        hasHydratedConsultingLinks: false,
      }),
      false,
    );
  });
});
