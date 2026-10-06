/**
 * Executar:
 * npx tsx src/components/organisms/characterization-content-editor/characterization-content.adapter.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ParagraphEnum } from 'project/enum/paragraph.enum';

import {
  characterizationContentToTiptap,
  indentCharacterizationItem,
  roundTripCharacterizationContent,
  setCharacterizationItemType,
  tiptapToCharacterizationContent,
  toggleBoldRange,
  toggleSuperscriptRange,
} from './characterization-content.adapter';

const dir = dirname(fileURLToPath(import.meta.url));

function assertRoundTrip(values: string[]) {
  assert.deepEqual(roundTripCharacterizationContent(values), values);
}

function textNodes(raw: string) {
  const doc = characterizationContentToTiptap([raw]);
  return doc.content?.[0]?.content || [];
}

function boldText(raw: string): string[] {
  return textNodes(raw)
    .filter((node) => node.marks?.some((mark) => mark.type === 'bold'))
    .map((node) => node.text || '');
}

function superscriptText(raw: string): string[] {
  return textNodes(raw)
    .filter((node) => node.marks?.some((mark) => mark.type === 'superscript'))
    .map((node) => node.text || '');
}

assertRoundTrip(['Texto simples.{type}=PARAGRAPH']);

assertRoundTrip([
  'Primeira atividade{type}=BULLET-0',
  'Subatividade{type}=BULLET-1',
  'Detalhamento{type}=BULLET-2',
]);

const boldItem = 'Este é um **texto importante**.{type}=PARAGRAPH';
assert.deepEqual(boldText(boldItem), ['texto importante']);
assert.equal(
  textNodes(boldItem).some((node) => node.text?.includes('**')),
  false,
);
assertRoundTrip([boldItem]);

const mixed = 'normal **negrito** normal{type}=PARAGRAPH';
assert.deepEqual(boldText(mixed), ['negrito']);
assert.deepEqual(
  textNodes(mixed).map((node) => node.text),
  ['normal ', 'negrito', ' normal'],
);
assertRoundTrip([mixed]);

const multiple = 'um **dois** tres **quatro** cinco{type}=BULLET-0';
assert.deepEqual(boldText(multiple), ['dois', 'quatro']);
assertRoundTrip([multiple]);

assertRoundTrip(['conteúdo antigo{type}=BULLET-3']);
assertRoundTrip(['outro legado{type}=BULLET-4']);
assert.equal(
  indentCharacterizationItem('conteúdo antigo{type}=BULLET-3', 'in'),
  'conteúdo antigo{type}=BULLET-3',
);
assert.equal(
  indentCharacterizationItem('outro legado{type}=BULLET-4', 'in'),
  'outro legado{type}=BULLET-4',
);

const mixedArray = [
  'Texto introdutório normal.{type}=PARAGRAPH',
  'Primeira atividade{type}=BULLET-0',
  'Subatividade{type}=BULLET-1',
  'Detalhamento{type}=BULLET-2',
  'Outro parágrafo com uma **parte em negrito**.{type}=PARAGRAPH',
  'legado três{type}=BULLET-3',
  'legado quatro{type}=BULLET-4',
];
assertRoundTrip(mixedArray);
assert.deepEqual(roundTripCharacterizationContent(mixedArray), mixedArray);

let leveled = 'tarefa{type}=PARAGRAPH';
leveled = indentCharacterizationItem(leveled, 'in');
assert.equal(leveled, 'tarefa{type}=BULLET-0');
leveled = indentCharacterizationItem(leveled, 'in');
assert.equal(leveled, 'tarefa{type}=BULLET-1');
leveled = indentCharacterizationItem(leveled, 'in');
assert.equal(leveled, 'tarefa{type}=BULLET-2');
leveled = indentCharacterizationItem(leveled, 'in');
assert.equal(leveled, 'tarefa{type}=BULLET-2');
leveled = indentCharacterizationItem(leveled, 'out');
assert.equal(leveled, 'tarefa{type}=BULLET-1');

assert.equal(
  setCharacterizationItemType('tarefa **fixa**{type}=BULLET-1', ParagraphEnum.PARAGRAPH),
  'tarefa **fixa**{type}=PARAGRAPH',
);
assert.equal(
  indentCharacterizationItem('item{type}=BULLET-0', 'out'),
  'item{type}=PARAGRAPH',
);

assert.equal(
  toggleBoldRange('inicio meio fim{type}=PARAGRAPH', 7, 11),
  'inicio **meio** fim{type}=PARAGRAPH',
);
assert.equal(
  toggleBoldRange('abcdef{type}=PARAGRAPH', 2, 4),
  'ab**cd**ef{type}=PARAGRAPH',
);
assert.equal(
  toggleBoldRange('ab**cd**ef{type}=PARAGRAPH', 2, 4),
  'abcdef{type}=PARAGRAPH',
);
assert.equal(
  toggleBoldRange('aa **bb** cc{type}=BULLET-0', 6, 8),
  'aa **bb** **cc**{type}=BULLET-0',
);

const malformed = [
  '**sem fechar{type}=PARAGRAPH',
  'fecha**{type}=BULLET-0',
  'a ** b ** c ** d{type}=PARAGRAPH',
  'texto com ** no meio{type}=BULLET-1',
  '**{type}=PARAGRAPH',
  '****{type}=PARAGRAPH',
  '**a****b**{type}=PARAGRAPH',
  '  espaços  {type}=PARAGRAPH',
  'veja {type}= dentro{type}=BULLET-2',
  'linha 1\nlinha 2{type}=PARAGRAPH',
  '{type}=PARAGRAPH',
  '{type}=BULLET-3',
];
malformed.forEach((item) => assertRoundTrip([item]));

assert.equal(
  toggleBoldRange('abc ** def{type}=PARAGRAPH', 0, 3),
  '**abc** ** def{type}=PARAGRAPH',
);
assert.equal(
  indentCharacterizationItem('conteúdo antigo{type}=BULLET-3', 'out'),
  'conteúdo antigo{type}=BULLET-2',
);
assert.equal(
  indentCharacterizationItem('outro legado{type}=BULLET-4', 'out'),
  'outro legado{type}=BULLET-3',
);

assert.equal(
  toggleSuperscriptRange('m2{type}=PARAGRAPH', 1, 2),
  'm^^2^^{type}=PARAGRAPH',
);
assert.equal(
  toggleSuperscriptRange('m3{type}=BULLET-0', 1, 2),
  'm^^3^^{type}=BULLET-0',
);
assert.equal(
  toggleSuperscriptRange('cm2{type}=BULLET-1', 2, 3),
  'cm^^2^^{type}=BULLET-1',
);

for (const item of ['m^^2^^{type}=PARAGRAPH', 'm^^3^^{type}=BULLET-2', 'cm^^2^^{type}=BULLET-4']) {
  assert.deepEqual(superscriptText(item), [item.includes('cm') ? '2' : item.includes('3') ? '3' : '2']);
  assert.equal(textNodes(item).some((node) => node.text?.includes('^^')), false);
  assertRoundTrip([item]);
}

const severalSuperscripts = 'm^^2^^ e cm^^3^^{type}=PARAGRAPH';
assert.deepEqual(superscriptText(severalSuperscripts), ['2', '3']);
assertRoundTrip([severalSuperscripts]);

const malformedSuperscript = 'm^^2{type}=PARAGRAPH';
assert.deepEqual(superscriptText(malformedSuperscript), []);
assert.equal(textNodes(malformedSuperscript).map((node) => node.text).join(''), 'm^^2');
assertRoundTrip([malformedSuperscript]);

assertRoundTrip(['m²{type}=PARAGRAPH', 'm³{type}=BULLET-0', 'H₂S{type}=PARAGRAPH']);
assert.deepEqual(superscriptText('m²{type}=PARAGRAPH'), []);

assertRoundTrip(['**negrito antigo**{type}=PARAGRAPH']);
assert.deepEqual(boldText('**negrito antigo**{type}=PARAGRAPH'), ['negrito antigo']);

const separateMarks = [
  '**negrito**{type}=PARAGRAPH',
  'm^^2^^{type}=BULLET-0',
];
assertRoundTrip(separateMarks);
assert.deepEqual(boldText(separateMarks[0]), ['negrito']);
assert.deepEqual(superscriptText(separateMarks[1]), ['2']);

const sideBySide = '**negrito** e m^^2^^{type}=PARAGRAPH';
assert.deepEqual(boldText(sideBySide), ['negrito']);
assert.deepEqual(superscriptText(sideBySide), ['2']);
assert.equal(textNodes(sideBySide).some((node) => node.text?.includes('^^')), false);
assertRoundTrip([sideBySide]);

const nestedMarks = '**m^^2^^**{type}=PARAGRAPH';
assertRoundTrip([nestedMarks]);
assert.equal(
  textNodes(nestedMarks).map((node) => node.text).join(''),
  '**m^^2^^**',
);
assert.deepEqual(superscriptText(nestedMarks), []);
assert.deepEqual(boldText(nestedMarks), []);

for (const level of ['BULLET-0', 'BULLET-1', 'BULLET-2', 'BULLET-3', 'BULLET-4']) {
  assertRoundTrip([`item m^^2^^{type}=${level}`]);
}

const untouched = [
  'm^^2^^{type}=PARAGRAPH',
  'vizinho{type}=BULLET-3',
];
const editedDoc = characterizationContentToTiptap(untouched);
const second = editedDoc.content?.[1];
if (!second?.attrs) throw new Error('missing second paragraph');
second.attrs.sourceItem = null;
second.content = [{ type: 'text', text: 'vizinhoX' }];
const edited = tiptapToCharacterizationContent(editedDoc);
assert.equal(edited[0], untouched[0]);
assert.equal(edited[1], 'vizinhoX{type}=BULLET-3');

assert.deepEqual(roundTripCharacterizationContent([]), []);
assert.deepEqual(
  tiptapToCharacterizationContent(characterizationContentToTiptap([])),
  [],
);

const adapterSource = readFileSync(join(dir, 'characterization-content.adapter.ts'), 'utf8');
assert.doesNotMatch(adapterSource, /@tiptap/);

const modalSource = readFileSync(
  join(
    dir,
    '../modals/ModalAddCharacterization/components/ModalCharacterizationContent/index.tsx',
  ),
  'utf8',
);
assert.match(modalSource, /CharacterizationContentEditor/);
assert.doesNotMatch(modalSource, /SDisplaySimpleArray/);

const dialogSource = readFileSync(
  join(
    dir,
    '../../../@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationTechnicalContentArrayEditorDialog.tsx',
  ),
  'utf8',
);
assert.match(dialogSource, /CharacterizationContentEditor/);
assert.doesNotMatch(dialogSource, /\.trim\(/);

console.log('characterization-content.adapter.spec: ok');
