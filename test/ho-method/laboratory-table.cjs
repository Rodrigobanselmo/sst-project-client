const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const path = require('node:path');
function load(file) {
 const source = fs.readFileSync(file, 'utf8');
 const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
 const result = { exports: {} };
 new Function('exports', 'module', 'require', code)(result.exports, result, name => load(path.resolve(path.dirname(file), name + '.ts')));
 return result.exports;
}
const result = { exports: load('src/@v2/pages/companies/ho-methods/utils/ho-laboratory-table.ts') };
const { laboratoryRows, laboratoryLimits } = result.exports;
const agent = { id: 'a', riskFactorId: 'a', agentName: 'Agente A', evaluationConditions: [] };
const other = { ...agent, id: 'b', riskFactorId: 'b' };
test('laboratory scope never leaks one agent parameters to another', () => {
 const method = { agents: [agent, other], laboratories: [{ id: 'l', laboratoryId: 'lab', riskFactorId: 'a' }] };
 assert.deepEqual(laboratoryRows([method], 'lab').map(row => row.agent.id), ['a']);
 assert.equal(laboratoryRows([method], 'another').length, 0);
});
test('legacy method-wide laboratory applies to each linked agent', () => {
 assert.equal(laboratoryRows([{ agents: [agent, other], laboratories: [{ laboratoryId: 'lab' }] }], 'lab').length, 2);
});
test('NR15 jornada, TWA, teto and VMP remain distinct', () => {
 const limits = laboratoryLimits({ ...agent, riskFactor: { nr15lt: '8', twa: '10', acgihCeiling: '20', unit: 'ppm' }, evaluationConditions: [{ evaluationType: 'VMP', limitValue: '16', limitUnit: 'ppm' }] });
 assert.equal(limits[0], 'ACGIH: 10 ppm'); assert.equal(limits[1], '');
 assert.equal(limits[2], 'ACGIH: 20 ppm'); assert.equal(limits[3], 'NR-15: 8 ppm');
 assert.equal(limits[4], 'Condição cadastrada: 16 ppm');
});
test('missing values remain unknown and numeric NR15 LT derives VMP', () => {
 assert.deepEqual(laboratoryLimits(agent), ['', '', '', '', '']);
 assert.equal(laboratoryLimits({ ...agent, riskFactor: { nr15lt: '8', unit: 'ppm' } })[4], 'NR-15: LT: 8 ppm × FD 2 = VMP 16 ppm');
});

test('deviation bands and decimal values use the existing NR15 calculation', () => {
 for (const [lt, expected] of [['0,5', '1,5'], ['1', '3'], ['10', '20'], ['100', '150'], ['1000', '1250'], ['1001', '1101,1']]) {
  const result = laboratoryLimits({ ...agent, riskFactor: { nr15lt: lt, unit: 'ppm' } });
  assert.ok(result[4].includes(`= VMP ${expected} ppm`));
 }
});
test('ceiling, invalid, absent and formula limits do not derive a VMP', () => {
 for (const nr15lt of ['8 T', '-', '', '0', '-2', '10 a 20', '8 + 2', 'Asfixiante simples']) {
  assert.equal(laboratoryLimits({ ...agent, riskFactor: { nr15lt, unit: 'ppm' } })[4], '');
 }
 const ceiling = laboratoryLimits({ ...agent, riskFactor: { nr15lt: '8 T', unit: 'ppm' } });
 assert.equal(ceiling[3], ''); assert.ok(ceiling[2].includes('8 T'));
});

const { samplerDisplay } = load('src/@v2/pages/companies/ho-methods/utils/ho-sampler-display.ts');
test('generic XAD-7 aliases preserve masses without assuming chemical treatment', () => {
 for (const name of ['XAD7-80/40', 'XAD-7 80/40']) {
  const result = samplerDisplay(name);
  assert.equal(result.code, '—');
  assert.equal(result.description, 'XAD-7 80/40');
  assert.ok(result.tooltip.includes('não foi atribuído automaticamente'));
 }
});
test('sampler identity is shared across laboratory source spellings', () => {
 for (const name of ['SKC 226-01', '226-01']) {
  const result = samplerDisplay(name);
  assert.equal(result.code, 'SKC 226-01');
  assert.equal(result.description, 'TCA 100/50');
 }
});
