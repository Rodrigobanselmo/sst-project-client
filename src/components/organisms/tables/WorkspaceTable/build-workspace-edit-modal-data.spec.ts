/**
 * Executar:
 * npx tsx --test src/components/organisms/tables/WorkspaceTable/build-workspace-edit-modal-data.spec.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { StatusEnum } from 'project/enum/status.enum';

import {
  PreferredNoiseCriterionEnum,
  normalizePreferredNoiseCriterion,
} from 'core/constants/maps/preferred-noise-criterion';
import { IWorkspace } from 'core/interfaces/api/ICompany';

import { buildWorkspaceEditModalData } from './build-workspace-edit-modal-data';

const baseRow = {
  id: 'ws-matriz',
  name: 'Matriz',
  description: 'Estabelecimento principal',
  status: StatusEnum.ACTIVE,
  created_at: new Date(),
  updated_at: new Date(),
  companyId: 'company-1',
  address: {
    number: '100',
    cep: '01310100',
    street: 'Av Paulista',
    complement: '',
    neighborhood: 'Bela Vista',
    city: 'Sao Paulo',
    state: 'SP',
  },
  logoUrl: '',
  hasFirstAidService: null,
  firstAidServiceDescription: null,
} as IWorkspace;

describe('buildWorkspaceEditModalData — preferredNoiseCriterion', () => {
  it('row com NR15_Q5 → modal mantém NR15_Q5', () => {
    const data = buildWorkspaceEditModalData({
      ...baseRow,
      preferredNoiseCriterion: PreferredNoiseCriterionEnum.NR15_Q5,
    });

    assert.equal(data.preferredNoiseCriterion, PreferredNoiseCriterionEnum.NR15_Q5);
    assert.equal(data.id, 'ws-matriz');
    assert.equal(data.name, 'Matriz');
  });

  it('row com NHO01_Q3 → modal mantém NHO01_Q3', () => {
    const data = buildWorkspaceEditModalData({
      ...baseRow,
      preferredNoiseCriterion: PreferredNoiseCriterionEnum.NHO01_Q3,
    });

    assert.equal(data.preferredNoiseCriterion, PreferredNoiseCriterionEnum.NHO01_Q3);
  });

  it('ausência → undefined no modal; hydrate existente cai no default NHO01_Q3', () => {
    const data = buildWorkspaceEditModalData(baseRow);

    assert.equal(data.preferredNoiseCriterion, undefined);
    assert.equal(
      normalizePreferredNoiseCriterion(data.preferredNoiseCriterion),
      PreferredNoiseCriterionEnum.NHO01_Q3,
    );
  });

  it('não copia o primeiro workspace de uma lista — só o row passado', () => {
    const other = {
      ...baseRow,
      id: 'ws-other',
      preferredNoiseCriterion: PreferredNoiseCriterionEnum.NR15_Q5,
    };
    const target = {
      ...baseRow,
      id: 'ws-target',
      preferredNoiseCriterion: PreferredNoiseCriterionEnum.NHO01_Q3,
    };

    const data = buildWorkspaceEditModalData(target);
    assert.equal(data.id, 'ws-target');
    assert.equal(data.preferredNoiseCriterion, PreferredNoiseCriterionEnum.NHO01_Q3);
    assert.notEqual(data.id, other.id);
  });
});
