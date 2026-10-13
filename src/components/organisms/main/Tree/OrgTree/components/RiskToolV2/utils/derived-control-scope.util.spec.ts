import assert from 'node:assert/strict';

import {
  filterImplementedControls,
  persistedControlIds,
} from './derived-control-scope.util';

const manual = { id: 'manual', medName: 'Treinamento manual' };
const derivedMoeve = { id: 'derivada-moeve', medName: 'Elaborar uma AEP' };
const derivedRefinaria = { id: 'derivada-refinaria', medName: 'Outra medida da Refinaria' };
const informativeOnly = { id: 'ponteiro', medName: 'Cadastro informativo' };
const moeveLink = { derivedRecMedId: 'derivada-moeve', workspaceId: 'moeve' };
const refinariaLink = {
  derivedRecMedId: 'derivada-refinaria',
  workspaceId: 'refinaria',
};

const moeve = filterImplementedControls({
  controls: [manual, derivedMoeve, informativeOnly],
  getId: (control) => control.id,
  derivedLinks: [moeveLink],
  workspaceId: 'moeve',
});
const refinaria = filterImplementedControls({
  controls: [manual, derivedMoeve, informativeOnly],
  getId: (control) => control.id,
  derivedLinks: [moeveLink],
  workspaceId: 'refinaria',
});
assert.deepEqual(
  moeve.map((control) => control.id),
  ['manual', 'derivada-moeve', 'ponteiro'],
);
assert.deepEqual(
  refinaria.map((control) => control.id),
  ['manual', 'ponteiro'],
);

const independent = [manual, derivedMoeve, derivedRefinaria];
const independentLinks = [moeveLink, refinariaLink];
assert.deepEqual(
  filterImplementedControls({
    controls: independent,
    getId: (control) => control.id,
    derivedLinks: independentLinks,
    workspaceId: 'moeve',
  }).map((control) => control.id),
  ['manual', 'derivada-moeve'],
);
assert.deepEqual(
  filterImplementedControls({
    controls: independent,
    getId: (control) => control.id,
    derivedLinks: independentLinks,
    workspaceId: 'refinaria',
  }).map((control) => control.id),
  ['manual', 'derivada-refinaria'],
);

assert.deepEqual(
  filterImplementedControls({
    controls: independent,
    getId: (control) => control.id,
    derivedLinks: independentLinks,
  }).map((control) => control.id),
  ['manual'],
);

const engs = [
  { id: 'epc-manual' },
  { id: 'epc-moeve' },
];
assert.deepEqual(
  filterImplementedControls({
    controls: engs,
    getId: (eng) => eng.id,
    derivedLinks: [{ derivedRecMedId: 'epc-moeve', workspaceId: 'moeve' }],
    workspaceId: 'refinaria',
  }).map((eng) => eng.id),
  ['epc-manual'],
);

const factorAdms = [manual, derivedMoeve];
const visible = filterImplementedControls({
  controls: factorAdms,
  getId: (control) => control.id,
  derivedLinks: [moeveLink],
  workspaceId: 'refinaria',
});
assert.deepEqual(persistedControlIds(factorAdms, ['manual']), ['derivada-moeve']);
assert.equal(factorAdms.length, 2);
assert.deepEqual(
  visible.map((control) => control.id),
  ['manual'],
);

console.log('derived-control-scope.util.spec: ok');
