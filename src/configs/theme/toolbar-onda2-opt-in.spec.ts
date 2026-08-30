/**
 * Onda 2: toolbars privadas + filtro da Agenda + FAB de IA.
 * npx tsx src/configs/theme/toolbar-onda2-opt-in.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (rel: string) => readFileSync(resolve(rel), 'utf8');

const agendaScheduled = read(
  'src/components/organisms/tables/HistoryScheduleExamCompanyTable/HistoryScheduleExamCompanyTable.tsx',
);
assert.equal(agendaScheduled.includes('showFilterPanelActions'), true);
assert.equal(agendaScheduled.includes('hideClearAction'), true);
assert.equal(agendaScheduled.includes('identitySquareActions'), true);

const agendaClinic = read(
  'src/components/organisms/tables/HistoryScheduleExamTable/HistoryScheduleExamTable.tsx',
);
assert.equal(agendaClinic.includes('identitySquareActions'), true);
assert.equal(agendaClinic.includes('addText="Agendar"'), true);

const filterPopper = read(
  'src/components/atoms/STable/components/STableFilter/STableFilterPopper/STableFilterPopper.tsx',
);
assert.equal(filterPopper.includes('showApplyClearActions'), true);
assert.equal(filterPopper.includes('Limpar filtro'), true);
assert.equal(filterPopper.includes('Aplicar filtro'), true);
assert.equal(filterPopper.includes('filterProps.clearFilter()'), true);

const filterTags = read(
  'src/components/atoms/STable/components/STableFilter/FilterTag/FilterTagList.tsx',
);
assert.equal(filterTags.includes('hideClearAction'), true);
assert.equal(filterTags.includes('!!tagsMemo.length && !hideClearAction'), true);

const employees = read(
  'src/components/organisms/tables/EmployeesTable/EmployeesTable.tsx',
);
assert.equal(employees.includes('hideClearAction'), false);
assert.equal(employees.includes('showFilterPanelActions'), false);

const risks = read(
  'src/components/organisms/tables/RisksTable/RisksTable.tsx',
);
assert.equal(risks.includes('identitySquareActions'), true);
assert.equal(risks.includes('pinToolbarWithFilter'), true);
assert.equal(risks.includes('tableUtilityPillButtonProps'), true);
assert.equal(risks.includes('filterButtonSx={tableUtilityPillSx}'), true);
assert.equal(risks.includes('toolbarAfterAdd'), true);
assert.equal(risks.includes('risk-status-filter-label'), true);

const exams = read(
  'src/components/organisms/tables/ExamsTable/ExamsTable.tsx',
);
assert.equal(exams.includes('identityFill'), true);
assert.equal(exams.includes('Adicionar exame'), true);
assert.equal(exams.includes('tableUtilityPillButtonProps'), true);
assert.equal(exams.includes('variant="contained"'), false);
assert.equal(exams.includes('color="primary"'), false);

const epis = read(
  'src/components/organisms/tables/EpisAndCaTable/EpisAndCaTable.tsx',
);
assert.equal(epis.includes('pinToolbarWithFilter'), true);
assert.equal(epis.includes('tableUtilityPillButtonProps'), true);
assert.equal(epis.includes('Importar base CAEPI'), true);

const professionals = read(
  'src/components/organisms/tables/ProfessonalsTable/ProfessonalsTable.tsx',
);
assert.equal(professionals.includes('identitySquareActions'), true);
assert.equal(professionals.includes('onAddClick={onAddProfessional}'), true);

const fab = read(
  'src/@v2/features/ai-chat/components/ai-chat-toggle-button.tsx',
);
assert.equal(fab.includes('fill="currentColor"'), true);
assert.equal(fab.includes('theme.palette.common.black'), true);
assert.equal(fab.includes('theme.palette.common.white'), true);
assert.equal(fab.includes('theme.palette.primary.main'), false);

const searchDefault = read(
  'src/components/atoms/STable/components/STableSearch/index.tsx',
);
assert.equal(searchDefault.includes('showFilterPanelActions,'), true);
assert.equal(
  searchDefault.includes('showFilterPanelActions = true'),
  false,
);

console.log('toolbar-onda2-opt-in.spec.ts ok');
