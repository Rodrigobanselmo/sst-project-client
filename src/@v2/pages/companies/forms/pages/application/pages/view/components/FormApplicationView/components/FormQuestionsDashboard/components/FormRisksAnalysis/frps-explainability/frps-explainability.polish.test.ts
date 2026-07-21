/**
 * Testes pontuais: limpeza HTML + copy do usuário comum (awaiting contextual).
 * Executar: npx tsx --test <este-arquivo>
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  dedupeDisplayList,
  normalizeDisplayList,
  normalizeDisplayText,
} from './frps-explainability-safe-content.util';
import { FRPS_EXPLAINABILITY_UI_COPY } from './frps-explainability-ui-copy';
import {
  getConceptualValidationStatusLabel,
  getContextualValidationStatusLabel,
} from './frps-explainability.utils';
import { stripHtmlForDisplay } from './strip-html-for-display.util';

const here = dirname(fileURLToPath(import.meta.url));

describe('stripHtmlForDisplay', () => {
  it('1 removes single p tags', () => {
    assert.equal(
      stripHtmlForDisplay('<p>O seu trabalho exige a sua atenção constante?</p>'),
      'O seu trabalho exige a sua atenção constante?',
    );
  });

  it('2 removes nested tags', () => {
    assert.equal(
      stripHtmlForDisplay('<p>Texto com <strong>negrito</strong> e <em>ênfase</em></p>'),
      'Texto com negrito e ênfase',
    );
  });

  it('3 converts &nbsp;', () => {
    assert.equal(
      stripHtmlForDisplay('A&nbsp;B'),
      'A B',
    );
  });

  it('4 converts &amp;', () => {
    assert.equal(
      stripHtmlForDisplay('A &amp; B'),
      'A & B',
    );
  });

  it('5 keeps plain text without HTML', () => {
    assert.equal(
      stripHtmlForDisplay('Pergunta sem HTML'),
      'Pergunta sem HTML',
    );
  });

  it('6 ignores empty string after cleanup', () => {
    assert.equal(stripHtmlForDisplay('<p></p>'), '');
    assert.equal(stripHtmlForDisplay('<p>&nbsp;</p>'), '');
    assert.equal(normalizeDisplayText('<p>  </p>'), null);
  });

  it('7 array of questions becomes cleaned list', () => {
    assert.deepEqual(
      normalizeDisplayList([
        '<p>Pergunta A?</p>',
        '<p>Pergunta&nbsp;B?</p>',
        '<p></p>',
      ]),
      ['Pergunta A?', 'Pergunta B?'],
    );
  });

  it('8 array of textual objects becomes cleaned list', () => {
    assert.deepEqual(
      normalizeDisplayList([
        { text: '<p>Objeto A</p>' },
        { question: 'Texto <strong>limpo</strong>' },
        { label: '<p>&nbsp;</p>' },
      ]),
      ['Objeto A', 'Texto limpo'],
    );
  });
});

describe('FRPS display safety (no raw HTML / no dangerouslySetInnerHTML)', () => {
  it('9 Content and Drawer do not use dangerouslySetInnerHTML', () => {
    const content = readFileSync(join(here, 'FrpsExplainabilityContent.tsx'), 'utf8');
    const drawer = readFileSync(join(here, 'FrpsExplainabilityDrawer.tsx'), 'utf8');
    assert.equal(content.includes('dangerouslySetInnerHTML'), false);
    assert.equal(drawer.includes('dangerouslySetInnerHTML'), false);
  });

  it('10 does not keep raw tags in normalized measurable questions', () => {
    const items = normalizeDisplayList([
      '<p>O seu trabalho exige a sua atenção constante?</p>',
      'Sem tags',
    ]);
    assert.deepEqual(items, [
      'O seu trabalho exige a sua atenção constante?',
      'Sem tags',
    ]);
    for (const item of items) {
      assert.equal(/<\/?[a-z][\s\S]*?>/i.test(item), false);
    }
  });
});

describe('FRPS measurable questions display dedupe', () => {
  it('1 repeated payload list renders without duplicates', () => {
    assert.deepEqual(
      normalizeDisplayList([
        '<p>Pergunta A</p>',
        'Pergunta A',
        '<p>Pergunta B</p>',
        'Pergunta A',
        'Pergunta B',
      ]),
      ['Pergunta A', 'Pergunta B'],
    );
  });

  it('2 HTML is removed before comparison', () => {
    assert.deepEqual(
      normalizeDisplayList([
        '<p>Atenção constante?</p>',
        'Atenção&nbsp;constante?',
      ]),
      ['Atenção constante?'],
    );
  });

  it('3 order of first occurrence is preserved', () => {
    assert.deepEqual(
      dedupeDisplayList(['C', 'A', 'B', 'a', 'C']),
      ['C', 'A', 'B'],
    );
  });

  it('4 normal content is unchanged', () => {
    assert.deepEqual(
      normalizeDisplayList(['Única 1', 'Única 2', 'Única 3']),
      ['Única 1', 'Única 2', 'Única 3'],
    );
  });
});

describe('FRPS common user awaiting contextual copy', () => {
  it('11 common user with validated conceptual and no contextual sees new message', () => {
    assert.equal(
      FRPS_EXPLAINABILITY_UI_COPY.commonAwaitingContextualTitle,
      'Conhecimento técnico disponível',
    );
    assert.match(
      FRPS_EXPLAINABILITY_UI_COPY.commonAwaitingContextualBody,
      /já foi validada e pode ser reutilizada/,
    );
    assert.equal(
      getConceptualValidationStatusLabel('VALIDATED'),
      'Conhecimento conceitual validado',
    );
  });

  it('12 button label and drawer wire only contextual generate', () => {
    assert.equal(
      FRPS_EXPLAINABILITY_UI_COPY.generateContextualButton,
      'Gerar justificativa desta análise',
    );
    const drawer = readFileSync(join(here, 'FrpsExplainabilityDrawer.tsx'), 'utf8');
    assert.match(
      drawer,
      /text=\{FRPS_EXPLAINABILITY_UI_COPY\.generateContextualButton\}/,
    );
    assert.match(drawer, /confirmGenerateContextual\(\)/);
    // No model selector in awaiting_contextual block: Select appears only with master generate.
    const awaitingIdx = drawer.indexOf("phase === 'awaiting_contextual_generate'");
    const masterIdx = drawer.indexOf("phase === 'awaiting_master_generate'");
    assert.ok(awaitingIdx > 0 && masterIdx > awaitingIdx);
    const awaitingBlock = drawer.slice(awaitingIdx, masterIdx);
    assert.equal(awaitingBlock.includes('FRPS_EXPLAINABILITY_MODEL_OPTIONS'), false);
    assert.equal(awaitingBlock.includes('selectedConceptualModel'), false);
  });

  it('13 common user labels: no model selector copy; conceptual unavailable title', () => {
    assert.equal(
      FRPS_EXPLAINABILITY_UI_COPY.commonConceptualUnavailableTitle,
      'Explicação conceitual ainda não disponível',
    );
    assert.equal(
      getContextualValidationStatusLabel('DRAFT_AI'),
      'Justificativa gerada para esta análise',
    );
  });

  it('14 existing available content still normalizes SOURCE fields', () => {
    const definition = normalizeDisplayText('<p>Definição segura</p>');
    assert.equal(definition, 'Definição segura');
    const list = normalizeDisplayList([
      '<p>P1</p>',
      { text: '<em>P2</em>' },
    ]);
    assert.deepEqual(list, ['P1', 'P2']);
  });

  it('15 SOURCE and recommendation fields keep correct rendering path', () => {
    assert.equal(
      normalizeDisplayText('Relação sem HTML'),
      'Relação sem HTML',
    );
    assert.equal(
      normalizeDisplayText('<p>Objetivo da recomendação</p>'),
      'Objetivo da recomendação',
    );
    assert.deepEqual(
      normalizeDisplayList(['<p>Q1</p>', '<p>Q2 &amp; Q2b</p>']),
      ['Q1', 'Q2 & Q2b'],
    );
  });
});
