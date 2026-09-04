/**
 * npx tsx src/components/organisms/tables/ExamsRiskTable/exams-risk-table-pattern.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import queryString from 'query-string';

const read = (rel: string) =>
  readFileSync(resolve(process.cwd(), rel), 'utf8');

const table = read(
  'src/components/organisms/tables/ExamsRiskTable/ExamsRiskTable.tsx',
);
const filterList = read(
  'src/components/organisms/tables/ExamsRiskTable/examRiskFilterList.ts',
);
const queryHook = read(
  'src/core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk.ts',
);
const filterBox = read(
  'src/components/atoms/STable/components/STableFilter/STableFilterBox/STableFilterBox.tsx',
);
const filterMap = read(
  'src/components/atoms/STable/components/STableFilter/constants/filter.map.ts',
);

assert.match(filterList, /FilterFieldEnum\.RISK_TYPES/);
assert.match(filterList, /FilterFieldEnum\.EXAM_RISK_NAMES/);
assert.match(filterList, /FilterFieldEnum\.EXAM_RISK_EXAM_NAMES/);
assert.match(filterList, /FilterFieldEnum\.EXAM_RISK_PERIODICITY/);
assert.match(filterList, /FilterFieldEnum\.EXAM_RISK_SEX/);
assert.match(filterList, /FilterFieldEnum\.EXAM_RISK_AGE_RANGE/);
assert.equal(filterList.includes('RISK_SEVERITIES'), false);

assert.match(filterMap, /EXAM_RISK_NAMES = 'riskNames'/);
assert.match(filterMap, /EXAM_RISK_EXAM_NAMES = 'examNames'/);
assert.match(filterMap, /EXAM_RISK_PERIODICITY = 'periodicity'/);
assert.match(filterMap, /EXAM_RISK_SEX = 'sex'/);
assert.match(filterMap, /EXAM_RISK_AGE_RANGE = 'ageRange'/);

assert.match(filterBox, /showExamRiskFilterBlock/);
assert.match(filterBox, /Nome do fator \(Enter para adicionar\)/);
assert.match(filterBox, /Periodicidade/);
assert.match(filterBox, /Faixa etária/);

const typeIndex = table.indexOf("key: 'RISK_TYPE'");
const riskIndex = table.indexOf("key: 'RISK', label: 'Fator de risco'");
const examIndex = table.indexOf("key: 'EXAM'");
assert.ok(typeIndex > 0 && typeIndex < riskIndex && riskIndex < examIndex);

assert.match(table, /lineNumber=\{2\}/);
assert.match(table, /tooltipTitle=\{riskName\}/);
assert.match(table, /tooltipProps=\{\{ minLength: 0 \}\}/);
assert.match(table, /examRiskFilters\.periodicity/);
assert.match(table, /showPendingOnly/);
assert.equal(table.includes('onToggleSort'), false);

assert.match(queryHook, /riskNames\?: string\[\]/);
assert.match(queryHook, /examNames\?: string\[\]/);
assert.match(queryHook, /periodicity\?: string\[\]/);
assert.match(queryHook, /ageRange\?: string\[\]/);

const serialized = queryString.stringify({
  companyId: 'company-1',
  riskTypes: ['QUI'],
  riskNames: ['Benzeno'],
  periodicity: ['isAdmission', 'isPeriodic'],
  sex: ['isMale'],
  ageRange: ['restricted'],
  orderBy: 'type',
  orderByDirection: 'asc',
});

assert.match(serialized, /riskTypes=QUI/);
assert.match(serialized, /riskNames=Benzeno/);
assert.match(serialized, /periodicity=isAdmission/);
assert.match(serialized, /periodicity=isPeriodic/);
assert.match(serialized, /sex=isMale/);
assert.match(serialized, /ageRange=restricted/);
assert.match(serialized, /orderBy=type/);

console.log('exams-risk-table-pattern.spec.ts ok');
console.log('query:', serialized);
