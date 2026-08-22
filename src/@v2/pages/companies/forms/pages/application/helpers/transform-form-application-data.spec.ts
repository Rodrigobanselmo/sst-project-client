/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/@v2/pages/companies/forms/pages/application/helpers/transform-form-application-data.spec.ts
 */
import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import {
  buildEditFormApplicationMutationPayload,
  isFormApplicationStructureLocked,
} from './transform-form-application-data';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const data = {
  name: 'Aplicação',
  description: 'desc',
  bannerIntroText: 'intro',
  bannerWhyText: 'why',
  bannerContactText: 'contact',
  anonymous: true,
  shareableLink: { value: 'true', label: 'Link' },
  participationGoal: 80,
  form: { id: 'form-1', name: 'Modelo' },
  workspaceIds: [{ id: 'w1' }],
  sections: [
    {
      description: 'instruções',
      items: [
        {
          id: 'q1',
          content: 'Pergunta',
          required: true,
          type: { value: 'CUSTOM', label: 'Custom' },
          detailsQuestionType: 'RADIO',
          options: [{ apiId: 'opt-1', label: 'Sim' }],
        },
      ],
    },
  ],
} as any;

run('pending application keeps identifier and workspace ids', () => {
  const payload = buildEditFormApplicationMutationPayload({
    companyId: 'c1',
    applicationId: 'a1',
    data,
    status: FormApplicationStatusEnum.PENDING,
    startedAt: null,
  });
  assert.equal(payload.formId, 'form-1');
  assert.deepEqual(payload.workspaceIds, ['w1']);
  assert.deepEqual(payload.hierarchyIds, []);
  assert.equal(payload.identifier?.questions?.length, 1);
});

run('started application omits identifier, formId and participant ids', () => {
  const payload = buildEditFormApplicationMutationPayload({
    companyId: 'c1',
    applicationId: 'a1',
    data,
    status: FormApplicationStatusEnum.PROGRESS,
    startedAt: new Date('2026-01-01'),
  });
  assert.equal('identifier' in payload, false);
  assert.equal('formId' in payload, false);
  assert.equal('workspaceIds' in payload, false);
  assert.equal('hierarchyIds' in payload, false);
  assert.equal(payload.name, 'Aplicação');
  assert.equal(payload.participationGoal, 80);
});

run('inactive with startedAt is not structure-locked', () => {
  assert.equal(
    isFormApplicationStructureLocked({
      status: FormApplicationStatusEnum.INACTIVE,
      startedAt: new Date(),
    }),
    false,
  );
});

const editSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/forms/pages/application/pages/edit/components/FormApplicationEditContent/FormApplicationEditContent.tsx',
  ),
  'utf8',
);
run('stay and exit share the same persist payload builder', () => {
  assert.equal(editSource.includes('buildEditFormApplicationMutationPayload'), true);
  assert.equal(editSource.includes('onSubmitStay'), true);
  assert.equal(editSource.includes('onSubmitExit'), true);
  assert.equal(editSource.includes('await persist(data)'), true);
});

console.log('\nAll transform-form-application-data tests passed.');
