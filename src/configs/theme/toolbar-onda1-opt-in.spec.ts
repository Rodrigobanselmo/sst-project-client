/**
 * Onda 1: toolbars privadas reutilizam o opt-in de Funcionários.
 * npx tsx src/configs/theme/toolbar-onda1-opt-in.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (rel: string) => readFileSync(resolve(rel), 'utf8');

const cat = read('src/components/organisms/tables/CatTable/index.tsx');
assert.equal(cat.includes('identitySquareActions'), true);
assert.equal(cat.includes('onAddClick={onAddCat}'), true);

const agendaEmployees = read(
  'src/components/organisms/tables/HistoryExpiredExamCompanyTable/HistoryExpiredExamCompanyTable.tsx',
);
assert.equal(agendaEmployees.includes('identitySquareActions'), true);
assert.equal(agendaEmployees.includes('filterButtonSx={tableUtilityPillSx}'), true);
assert.equal(agendaEmployees.includes('addText="Agendar"'), true);
assert.equal(agendaEmployees.includes('onReloadClick={onRefetchThrottle}'), true);

const agendaScheduled = read(
  'src/components/organisms/tables/HistoryScheduleExamCompanyTable/HistoryScheduleExamCompanyTable.tsx',
);
assert.equal(agendaScheduled.includes('identitySquareActions'), true);
assert.equal(agendaScheduled.includes('filterButtonSx={tableUtilityPillSx}'), true);

const agendaVisit = read(
  'src/components/organisms/tables/ScheduleMedicalVisitTable/ScheduleMedicalVisitTable.tsx',
);
assert.equal(agendaVisit.includes('identitySquareActions'), true);
assert.equal(agendaVisit.includes('filterButtonSx={tableUtilityPillSx}'), true);

const agendaOrders = read(
  'src/components/organisms/tables/ScheduleAskExamTable/ScheduleAskExamTable.tsx',
);
assert.equal(agendaOrders.includes('identitySquareActions'), true);
assert.equal(agendaOrders.includes('onAddClick'), false);

const clinics = read(
  'src/components/organisms/tables/ClinicsTable/ClinicsTable.tsx',
);
assert.equal(clinics.includes('identitySquareActions: true'), true);
assert.equal(clinics.includes('pinToolbarWithFilter'), true);
assert.equal(clinics.includes('tableUtilityPillButtonProps'), true);
assert.equal(clinics.includes('filterButtonSx={tableUtilityPillSx}'), true);
assert.equal(clinics.includes('filterProps={{ filters: clinicFilterList'), true);
assert.equal(clinics.includes('<STableFilterIcon'), false);

const models = read(
  'src/@v2/pages/companies/forms/components/FormContent/components/FormModelTable/FormModelTable.tsx',
);
assert.equal(models.includes('identityFill'), true);
assert.equal(models.includes('setAddMenuAnchor'), true);
assert.equal(models.includes('Formulário em branco'), true);
assert.equal(models.includes('tableButtonProps={tableUtilityPillButtonProps}'), true);

const library = read(
  'src/@v2/pages/companies/forms/components/FormContent/components/PreliminaryLibraryContent/PreliminaryLibraryContent.tsx',
);
assert.equal((library.match(/identityFill/g) || []).length >= 2, true);
assert.equal(library.includes('TextField'), true);
assert.equal(library.includes('Todas as categorias'), true);

const addDefault = read(
  'src/@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton.tsx',
);
assert.equal(addDefault.includes('identityFill = false'), true);

const searchDefault = read(
  'src/components/atoms/STable/components/STableSearch/index.tsx',
);
assert.equal(searchDefault.includes('identitySquareActions,'), true);

console.log('toolbar-onda1-opt-in.spec.ts ok');
