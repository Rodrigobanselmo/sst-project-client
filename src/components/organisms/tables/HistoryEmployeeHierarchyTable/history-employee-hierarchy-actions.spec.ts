/**
 * Executar:
 * npx tsx --tsconfig tsconfig.json src/components/organisms/tables/HistoryEmployeeHierarchyTable/history-employee-hierarchy-actions.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  EMPLOYEE_HIERARCHY_ADD_EVENT_TOOLTIP,
  EMPLOYEE_HIERARCHY_CORRECT_RECORD_TOOLTIP,
  EMPLOYEE_HIERARCHY_CORRECTION_CONFIRM_TEXT,
  EMPLOYEE_HIERARCHY_CORRECTION_CONFIRM_TITLE,
  EMPLOYEE_HIERARCHY_TRANSFER_TOOLTIP,
} from 'components/organisms/modals/ModalAddEmployeeHistoryHier/employee-hierarchy-correction.util';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';

const read = (relativePath: string) =>
  readFileSync(join(process.cwd(), relativePath), 'utf8');

const table = read(
  'src/components/organisms/tables/HistoryEmployeeHierarchyTable/HistoryEmployeeHierarchyTable.tsx',
);
const addHook = read(
  'src/components/organisms/modals/ModalAddEmployeeHistoryHier/hooks/useAddData.ts',
);
const addModal = read(
  'src/components/organisms/modals/ModalAddEmployeeHistoryHier/ModalAddEmployeeHistoryHier.tsx',
);
const transferMut = read(
  'src/core/services/hooks/mutations/manager/employee-history/useMutTransferEmployeeHisHier/useMutTransferEmployeeHisHier.ts',
);
const createMut = read(
  'src/core/services/hooks/mutations/manager/employee-history/useMutCreateEmployeeHisHier/useMutCreateEmployeeHisHier.ts',
);
const updateMut = read(
  'src/core/services/hooks/mutations/manager/employee-history/useMutUpdateEmployeeHisHier/useMutUpdateEmployeeHisHier.ts',
);
const transferHook = read(
  'src/components/organisms/modals/ModalTransferEmployeeHierarchy/hooks/useTransferEmployeeHierarchy.ts',
);

assert.equal(ApiRoutesEnum.EMPLOYEE_HISTORY_HIER, '/employee-history/hierarchy');
assert.match(transferMut, /\/transfer\/\$\{companyId\}/);
assert.match(createMut, /api\.post</);
assert.match(createMut, /ApiRoutesEnum\.EMPLOYEE_HISTORY_HIER \+ '\/' \+ companyId/);
assert.doesNotMatch(createMut, /\/transfer\//);
assert.match(updateMut, /api\.patch</);
assert.match(
  updateMut,
  /ApiRoutesEnum\.EMPLOYEE_HISTORY_HIER \+ '\/' \+ data\.id \+ '\/' \+ companyId/,
);

assert.match(table, /ModalEnum\.EMPLOYEE_HIERARCHY_TRANSFER/);
assert.match(table, /text="Alterar lotação"/);
assert.match(table, /EMPLOYEE_HIERARCHY_TRANSFER_TOOLTIP/);
assert.match(table, /brandIdentityFillSx/);
assert.match(table, /primary\.identityOn/);
assert.doesNotMatch(table, /info\.main/);
assert.doesNotMatch(table, /success\.dark/);

assert.match(table, /text="Adicionar evento"/);
assert.match(table, /EMPLOYEE_HIERARCHY_ADD_EVENT_TOOLTIP/);
assert.match(table, /outline/);
assert.match(table, /ModalEnum\.EMPLOYEE_HISTORY_HIER_ADD/);
assert.doesNotMatch(table, /Novo cargo/);

assert.match(table, />Corrigir</);
assert.match(table, /EMPLOYEE_HIERARCHY_CORRECT_RECORD_TOOLTIP/);

assert.equal(ModalEnum.EMPLOYEE_HIERARCHY_TRANSFER, 'EMPLOYEE_HIERARCHY_TRANSFER');
assert.equal(ModalEnum.EMPLOYEE_HISTORY_HIER_ADD, 'EMPLOYEE_HISTORY_HIER_ADD');

assert.match(addHook, /preventWarn\(/);
assert.match(addHook, /EMPLOYEE_HIERARCHY_CORRECTION_CONFIRM_TEXT/);
assert.match(addHook, /updateMutation/);
assert.match(addHook, /createMutation/);
assert.match(addModal, /Corrigir registro de lotação/);
assert.match(addModal, /Adicionar evento de lotação/);

assert.doesNotMatch(transferHook, /preventWarn\(/);
assert.doesNotMatch(transferHook, /Corrigir registro/);

assert.equal(
  EMPLOYEE_HIERARCHY_TRANSFER_TOOLTIP,
  'Registra uma nova movimentação de lotação (transferência, promoção ou alocação).',
);
assert.equal(
  EMPLOYEE_HIERARCHY_ADD_EVENT_TOOLTIP,
  'Adiciona manualmente um evento ao histórico de lotação. Não cria cargo na estrutura da empresa.',
);
assert.equal(
  EMPLOYEE_HIERARCHY_CORRECT_RECORD_TOOLTIP,
  'Corrige este evento. Não cria uma nova movimentação.',
);
assert.equal(
  EMPLOYEE_HIERARCHY_CORRECTION_CONFIRM_TITLE,
  'Corrigir registro de lotação',
);
assert.match(
  EMPLOYEE_HIERARCHY_CORRECTION_CONFIRM_TEXT,
  /não cria uma nova movimentação/i,
);

console.log('history-employee-hierarchy-actions.spec.ts ok');
