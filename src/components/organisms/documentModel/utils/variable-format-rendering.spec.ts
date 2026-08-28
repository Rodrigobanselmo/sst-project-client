/**
 * Variable placeholder formatting — generic marks on ??VAR?? tokens.
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/utils/variable-format-rendering.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { InlineStyleTypeEnum } from 'project/enum/document-model.enum';

import {
  extractParagraphContent,
  lineToInlineContent,
} from '../editor-v2/tiptap/inline-ranges';
import { replaceAllVariables } from './replaceAllVariables';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const catalog = [
  { type: 'NOME_DA_EMPRESA', label: 'Nome da Empresa' },
  { type: 'CNPJ_EMPRESA', label: 'CNPJ da Empresa' },
];

function roundtripLine(
  text: string,
  styles: Array<{ offset: number; length: number; style: InlineStyleTypeEnum }>,
) {
  const content = lineToInlineContent(text, styles, [], catalog);
  return extractParagraphContent(content);
}

function marksOf(content: ReturnType<typeof lineToInlineContent>, type: string) {
  const node = content.find((item) => item.type === 'docVariable' && item.attrs?.type === type);
  return node?.marks || [];
}

run('1. variável sem mark → roundtrip sem ranges', () => {
  const text = 'Texto ??NOME_DA_EMPRESA?? fim';
  const restored = roundtripLine(text, []);
  assert.equal(restored.text, text);
  assert.deepEqual(restored.inlineStyleRangeBlock[0], []);
});

run('2. variável com bold → mark bold no docVariable e range no token', () => {
  const token = '??NOME_DA_EMPRESA??';
  const text = `AA${token}BB`;
  const restored = roundtripLine(text, [
    { offset: 2, length: token.length, style: InlineStyleTypeEnum.BOLD },
  ]);
  const bold = restored.inlineStyleRangeBlock[0].find(
    (item) => item.style === InlineStyleTypeEnum.BOLD,
  );
  assert.ok(bold);
  assert.equal(bold?.offset, 2);
  assert.equal(bold?.length, token.length);
  const content = lineToInlineContent(text, restored.inlineStyleRangeBlock[0], [], catalog);
  assert.equal(
    marksOf(content, 'NOME_DA_EMPRESA').some((mark) => mark.type === 'bold'),
    true,
  );
});

run('3. variável com italic → italic preservado', () => {
  const token = '??CNPJ_EMPRESA??';
  const text = `x${token}y`;
  const restored = roundtripLine(text, [
    { offset: 1, length: token.length, style: InlineStyleTypeEnum.ITALIC },
  ]);
  const italic = restored.inlineStyleRangeBlock[0].find(
    (item) => item.style === InlineStyleTypeEnum.ITALIC,
  );
  assert.ok(italic);
  const content = lineToInlineContent(text, restored.inlineStyleRangeBlock[0], [], catalog);
  assert.equal(
    marksOf(content, 'CNPJ_EMPRESA').some((mark) => mark.type === 'italic'),
    true,
  );
});

run('4. variável bold + italic → ambos preservados', () => {
  const token = '??NOME_DA_EMPRESA??';
  const text = token;
  const restored = roundtripLine(text, [
    { offset: 0, length: token.length, style: InlineStyleTypeEnum.BOLD },
    { offset: 0, length: token.length, style: InlineStyleTypeEnum.ITALIC },
  ]);
  const content = lineToInlineContent(text, restored.inlineStyleRangeBlock[0], [], catalog);
  const marks = marksOf(content, 'NOME_DA_EMPRESA');
  assert.equal(marks.some((mark) => mark.type === 'bold'), true);
  assert.equal(marks.some((mark) => mark.type === 'italic'), true);
});

run('5. texto comum + variável formatada + texto comum → sem vazamento', () => {
  const token = '??NOME_DA_EMPRESA??';
  const text = `comum ${token} fim`;
  const tokenOffset = text.indexOf(token);
  const restored = roundtripLine(text, [
    { offset: tokenOffset, length: token.length, style: InlineStyleTypeEnum.BOLD },
  ]);
  const bold = restored.inlineStyleRangeBlock[0].filter(
    (item) => item.style === InlineStyleTypeEnum.BOLD,
  );
  assert.equal(bold.length, 1);
  assert.equal(bold[0].offset, tokenOffset);
  assert.equal(bold[0].length, token.length);
  assert.equal(restored.text.startsWith('comum '), true);
});

run('6. duas variáveis diferentes com bold independente', () => {
  const first = '??NOME_DA_EMPRESA??';
  const second = '??CNPJ_EMPRESA??';
  const text = `${first} e ${second}`;
  const restored = roundtripLine(text, [
    { offset: 0, length: first.length, style: InlineStyleTypeEnum.BOLD },
    {
      offset: first.length + 3,
      length: second.length,
      style: InlineStyleTypeEnum.ITALIC,
    },
  ]);
  const bold = restored.inlineStyleRangeBlock[0].find(
    (item) => item.style === InlineStyleTypeEnum.BOLD,
  );
  const italic = restored.inlineStyleRangeBlock[0].find(
    (item) => item.style === InlineStyleTypeEnum.ITALIC,
  );
  assert.equal(bold?.offset, 0);
  assert.equal(italic?.offset, first.length + 3);
  const content = lineToInlineContent(text, restored.inlineStyleRangeBlock[0], [], catalog);
  assert.equal(
    marksOf(content, 'NOME_DA_EMPRESA').some((mark) => mark.type === 'bold'),
    true,
  );
  assert.equal(
    marksOf(content, 'CNPJ_EMPRESA').some((mark) => mark.type === 'italic'),
    true,
  );
});

run('7. replaceAllVariables repassa segmentStyle e preserva azul', () => {
  const result = replaceAllVariables('AA??NOME_DA_EMPRESA??BB', {}, {
    wrapper: true,
    beforeWrapper: '{{',
    afterWrapper: '}}',
    addSpan: true,
    segmentStyle: { fontWeight: 'bold', fontStyle: 'italic', color: 'red' },
  });
  assert.equal(Array.isArray(result.text), true);
  const variableSpan = (result.text as Array<{ props: { style: Record<string, string> } }>).find(
    (node) => node?.props?.style?.fontWeight === 'bold',
  );
  assert.ok(variableSpan);
  assert.equal(variableSpan?.props?.style?.fontStyle, 'italic');
  assert.equal(variableSpan?.props?.style?.color, 'blue');
});

function hasStyleAt(
  ranges: Array<{ offset: number; length: number; style: InlineStyleTypeEnum }>,
  offset: number,
  style: InlineStyleTypeEnum,
) {
  return ranges.some(
    (range) =>
      range.style === style &&
      offset >= range.offset &&
      offset < range.offset + range.length,
  );
}

run('gate vazamento: normal + variável bold + normal → bold só no token', () => {
  const token = '??NOME_DA_EMPRESA??';
  const text = `normal ${token} after`;
  const tokenOffset = text.indexOf(token);
  const restored = roundtripLine(text, [
    { offset: tokenOffset, length: token.length, style: InlineStyleTypeEnum.BOLD },
  ]);
  const ranges = restored.inlineStyleRangeBlock[0];
  assert.equal(hasStyleAt(ranges, 0, InlineStyleTypeEnum.BOLD), false);
  assert.equal(hasStyleAt(ranges, tokenOffset, InlineStyleTypeEnum.BOLD), true);
  assert.equal(hasStyleAt(ranges, tokenOffset + token.length, InlineStyleTypeEnum.BOLD), false);
  assert.equal(hasStyleAt(ranges, text.length - 1, InlineStyleTypeEnum.BOLD), false);
});

run('gate vazamento: bold prefix + variável bold + normal → normal não herda', () => {
  const token = '??NOME_DA_EMPRESA??';
  const text = `bold ${token} normal`;
  const tokenOffset = text.indexOf(token);
  const boldEnd = tokenOffset + token.length;
  const restored = roundtripLine(text, [
    { offset: 0, length: boldEnd, style: InlineStyleTypeEnum.BOLD },
  ]);
  const ranges = restored.inlineStyleRangeBlock[0];
  assert.equal(hasStyleAt(ranges, 0, InlineStyleTypeEnum.BOLD), true);
  assert.equal(hasStyleAt(ranges, tokenOffset, InlineStyleTypeEnum.BOLD), true);
  assert.equal(hasStyleAt(ranges, boldEnd, InlineStyleTypeEnum.BOLD), false);
  assert.equal(hasStyleAt(ranges, text.length - 1, InlineStyleTypeEnum.BOLD), false);
});

run('gate vazamento: variável italic/bold+italic não vaza para vizinhos', () => {
  const token = '??CNPJ_EMPRESA??';
  const text = `a ${token} b`;
  const tokenOffset = text.indexOf(token);
  const italicOnly = roundtripLine(text, [
    { offset: tokenOffset, length: token.length, style: InlineStyleTypeEnum.ITALIC },
  ]).inlineStyleRangeBlock[0];
  assert.equal(hasStyleAt(italicOnly, 0, InlineStyleTypeEnum.ITALIC), false);
  assert.equal(hasStyleAt(italicOnly, tokenOffset, InlineStyleTypeEnum.ITALIC), true);
  assert.equal(hasStyleAt(italicOnly, tokenOffset + token.length, InlineStyleTypeEnum.ITALIC), false);

  const both = roundtripLine(text, [
    { offset: tokenOffset, length: token.length, style: InlineStyleTypeEnum.BOLD },
    { offset: tokenOffset, length: token.length, style: InlineStyleTypeEnum.ITALIC },
  ]).inlineStyleRangeBlock[0];
  assert.equal(hasStyleAt(both, 0, InlineStyleTypeEnum.BOLD), false);
  assert.equal(hasStyleAt(both, tokenOffset, InlineStyleTypeEnum.BOLD), true);
  assert.equal(hasStyleAt(both, tokenOffset, InlineStyleTypeEnum.ITALIC), true);
  assert.equal(hasStyleAt(both, tokenOffset + token.length, InlineStyleTypeEnum.ITALIC), false);
});

run('gate headings: TITLE/H1–H6 passam inlineStyleRangeBlock do item', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../DocumentModelContent/TypeSectionItem/TypeSectionItem.tsx'),
    'utf8',
  );
  assert.equal(source.includes('inlineStyleRange={[]}'), false);
  assert.equal(
    source.includes('inlineStyleRange={item.inlineStyleRangeBlock?.[index] || []}'),
    true,
  );
  assert.equal(source.includes('HeadingNumberBadge'), true);
  assert.equal(source.includes('STHeaderText'), true);
});

run('gate headings: sem ranges / bold / italic / variável formatada roundtrip', () => {
  const token = '??NOME_DA_EMPRESA??';
  const plain = `Título ${token}`;
  assert.deepEqual(roundtripLine(plain, []).inlineStyleRangeBlock[0], []);

  const tokenOffset = plain.indexOf(token);
  const boldHeading = roundtripLine(plain, [
    { offset: 0, length: 6, style: InlineStyleTypeEnum.BOLD },
  ]).inlineStyleRangeBlock[0];
  assert.equal(hasStyleAt(boldHeading, 0, InlineStyleTypeEnum.BOLD), true);
  assert.equal(hasStyleAt(boldHeading, tokenOffset, InlineStyleTypeEnum.BOLD), false);

  const italicVar = roundtripLine(plain, [
    { offset: tokenOffset, length: token.length, style: InlineStyleTypeEnum.ITALIC },
  ]).inlineStyleRangeBlock[0];
  assert.equal(hasStyleAt(italicVar, tokenOffset, InlineStyleTypeEnum.ITALIC), true);
});

run('gate V2: chip inherit — sem bold usa peso do contexto; heading estrutural bold', () => {
  const surfaceSource = fs.readFileSync(
    path.join(__dirname, '../editor-v2/integration/document-editor-v2-surface-sx.ts'),
    'utf8',
  );
  const variableBlock = surfaceSource.slice(
    surfaceSource.indexOf("'& .doc-editor-v2-variable'"),
    surfaceSource.indexOf("'& .doc-editor-v2-variable--unknown'"),
  );
  assert.equal(variableBlock.includes("fontWeight: 'inherit'"), true);
  assert.equal(variableBlock.includes('fontWeight: 600'), false);

  const headerStyles = fs.readFileSync(
    path.join(__dirname, '../DocumentModelContent/TypeSectionItem/styles.ts'),
    'utf8',
  );
  assert.equal(headerStyles.includes('font-weight: bold'), true);
});

run('gate classic: segmentStyle isolado — chamada sem estilo não herda bold', () => {
  const styled = replaceAllVariables('??NOME_DA_EMPRESA??', {}, {
    wrapper: true,
    beforeWrapper: '{{',
    afterWrapper: '}}',
    addSpan: true,
    segmentStyle: { fontWeight: 'bold' },
  });
  const plain = replaceAllVariables('??CNPJ_EMPRESA??', {}, {
    wrapper: true,
    beforeWrapper: '{{',
    afterWrapper: '}}',
    addSpan: true,
  });
  const findVariableSpan = (
    nodes: Array<{ props: { style: Record<string, string> } }>,
  ) => nodes.find((node) => node?.props?.style?.color === 'blue');
  const styledSpan = findVariableSpan(
    styled.text as Array<{ props: { style: Record<string, string> } }>,
  );
  const plainSpan = findVariableSpan(
    plain.text as Array<{ props: { style: Record<string, string> } }>,
  );
  assert.ok(styledSpan);
  assert.ok(plainSpan);
  assert.equal(styledSpan?.props?.style?.fontWeight, 'bold');
  assert.equal(plainSpan?.props?.style?.fontWeight, undefined);
  assert.equal(plainSpan?.props?.style?.color, 'blue');
});

run('8. V2 chip de variável herda marks (sem fontWeight fixo)', () => {
  const source = fs.readFileSync(
    path.join(
      __dirname,
      '../editor-v2/integration/document-editor-v2-surface-sx.ts',
    ),
    'utf8',
  );
  const variableBlock = source.slice(
    source.indexOf("'& .doc-editor-v2-variable'"),
    source.indexOf("'& .doc-editor-v2-variable--unknown'"),
  );
  assert.equal(variableBlock.includes("fontWeight: 'inherit'"), true);
  assert.equal(variableBlock.includes('fontWeight: 600'), false);
});

console.log('\nvariable-format-rendering: ok');
