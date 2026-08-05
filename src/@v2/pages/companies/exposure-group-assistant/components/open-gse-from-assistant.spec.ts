import assert from 'node:assert/strict';
import { StatusEnum } from 'project/enum/status.enum';

import {
  buildOpenGseModalPayload,
  resolveImplementedProposalCopy,
} from './open-gse-from-assistant';

const payload = buildOpenGseModalPayload({
  companyId: 'company-1',
  gho: {
    id: 'gse-coseg-id',
    name: 'GSE de Frota — COSEG',
    description: 'desc',
    status: StatusEnum.ACTIVE,
    workspaceIds: ['ws-1'],
    workspaces: [],
  },
});

assert.equal(payload.id, 'gse-coseg-id', 'Abrir GSE must use homogeneousGroupId');
assert.equal(payload.companyId, 'company-1');
assert.equal(payload.layout, 'modal');
assert.equal(payload.name, 'GSE de Frota — COSEG');

assert.equal(resolveImplementedProposalCopy('EXACT_CREATED_PROPOSAL').badge, 'GSE criado');
assert.equal(
  resolveImplementedProposalCopy('EXACT_EXISTING_GSE').badge,
  'Atendida por GSE existente',
);

console.log('open-gse-from-assistant.spec.ts: ok');
