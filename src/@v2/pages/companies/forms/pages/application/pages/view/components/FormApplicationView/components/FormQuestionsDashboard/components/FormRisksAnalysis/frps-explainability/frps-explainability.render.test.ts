/**
 * Testes de isolamento de render / root cause do crash do drawer.
 * Executar: npx tsx --test <este-arquivo>
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FrpsExplainabilityDrawerErrorBoundary } from './FrpsExplainabilityDrawerErrorBoundary';
import {
  frpsContentTypeVariants,
  frpsSourceAvailableFixture,
} from './frps-explainability.fixture';
import {
  isCompatibleFrpsAvailablePayload,
  normalizeDisplayList,
  normalizeDisplayText,
  normalizeIsoDateLabel,
  normalizePersonLabel,
} from './frps-explainability-safe-content.util';

/** Espelho mínimo do colorMap do SButton (sem import profundo). */
const S_BUTTON_COLOR_KEYS = [
  'normal',
  'success',
  'info',
  'primary',
  'paper',
  'danger',
] as const;

/** Replica a regra do SectionField após o normalizador (sem MUI). */
function sectionFieldWouldRender(value: unknown, asList = false): string[] {
  if (asList || Array.isArray(value)) {
    return normalizeDisplayList(value);
  }
  const text = normalizeDisplayText(value);
  return text ? [text] : [];
}

/** Comportamento antigo inseguro que quebrava o drawer. */
function legacyUnsafeListTrim(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return (value as Array<{ trim?: () => string }>).map((item) =>
    (item as { trim: () => string }).trim(),
  );
}

describe('FRPS explainability crash isolation', () => {
  it('1 SOURCE fixture is available=true and sections normalize', () => {
    assert.equal(isCompatibleFrpsAvailablePayload(frpsSourceAvailableFixture), true);
    const c = frpsSourceAvailableFixture.conceptual.content;
    assert.ok(sectionFieldWouldRender(c.definition).length);
    assert.ok(sectionFieldWouldRender(c.measurableQuestions, true).length >= 2);
    const x = frpsSourceAvailableFixture.contextual.content;
    assert.ok(sectionFieldWouldRender(x.resumoContextual).length);
    assert.ok(sectionFieldWouldRender(x.evidenciasAgregadas).length);
  });

  it('2 measurableQuestions string[]', () => {
    assert.deepEqual(
      normalizeDisplayList(['A', 'B']),
      ['A', 'B'],
    );
  });

  it('3 measurableQuestions array of objects', () => {
    assert.deepEqual(
      normalizeDisplayList(frpsContentTypeVariants.measurableQuestionsAsObjects),
      ['Pergunta objeto A', 'Pergunta objeto B'],
    );
  });

  it('4 manifestations as string', () => {
    assert.equal(
      normalizeDisplayText('Manifestações em texto'),
      'Manifestações em texto',
    );
  });

  it('5 manifestations as array', () => {
    assert.deepEqual(
      normalizeDisplayList(frpsContentTypeVariants.manifestationsAsArray),
      ['Manifestação 1', 'Manifestação 2'],
    );
  });

  it('6 validatedBy object does not break', () => {
    assert.equal(
      normalizePersonLabel(frpsContentTypeVariants.validatedByObject),
      'Validador Fixture',
    );
  });

  it('7 null dates do not break', () => {
    assert.equal(normalizeIsoDateLabel(null), null);
    assert.equal(normalizeIsoDateLabel(undefined), null);
  });

  it('8 contextual absent does not break conceptual checks', () => {
    const partial = {
      available: true as const,
      conceptual: frpsSourceAvailableFixture.conceptual,
      contextual: {
        protectedData: true as const,
        itemType: 'SOURCE' as const,
        itemKey: 'k',
        label: 'Dados Protegidos',
      },
    };
    assert.equal(isCompatibleFrpsAvailablePayload(partial), true);
    assert.ok(
      sectionFieldWouldRender(partial.conceptual.content.definition).length,
    );
  });

  it('9 structured evidence object is not rendered as text child', () => {
    assert.equal(
      normalizeDisplayText(frpsContentTypeVariants.structuredEvidenceObject),
      null,
    );
    assert.deepEqual(
      sectionFieldWouldRender(frpsContentTypeVariants.structuredEvidenceObject),
      [],
    );
  });

  it('10 unknown object is ignored safely', () => {
    assert.equal(
      normalizeDisplayText(frpsContentTypeVariants.unknownObject),
      null,
    );
  });

  it('11 legacy trim on object items throws; normalizer does not', () => {
    const mixed = frpsContentTypeVariants.measurableQuestionsAsObjects;
    assert.throws(() => legacyUnsafeListTrim(mixed), /trim is not a function/);
    assert.doesNotThrow(() => normalizeDisplayList(mixed));
  });

  it('12 SButton color="error" would throw; danger is valid', () => {
    assert.ok(S_BUTTON_COLOR_KEYS.includes('danger'));
    assert.equal(
      (S_BUTTON_COLOR_KEYS as readonly string[]).includes('error'),
      false,
    );
    const colorMapLike: Record<string, { colorSchema: string } | undefined> = {
      danger: { colorSchema: 'error' },
    };
    assert.throws(() => {
      return colorMapLike.error!.colorSchema;
    }, /Cannot read properties of undefined/);
    assert.equal(colorMapLike.danger!.colorSchema, 'error');
  });

  it('13 error boundary registers message and componentStack outside production', () => {
    assert.notEqual(process.env.NODE_ENV, 'production');
    const errors: unknown[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args);
    };
    try {
      const boundary = new FrpsExplainabilityDrawerErrorBoundary({
        section: 'master-actions',
        children: null,
      });
      boundary.componentDidCatch(new Error('Cannot read properties of undefined (reading \'colorSchema\')'), {
        componentStack:
          '\n    in SButton\n    in FrpsExplainabilityDrawer\n    in FrpsExplainabilityDrawerErrorBoundary',
      });
      assert.equal(errors.length, 1);
      assert.equal(
        (errors[0] as unknown[])[0],
        '[FRPS explainability render error]',
      );
      const payload = (errors[0] as unknown[])[1] as {
        name: string;
        message: string;
        section: string | null;
        componentStack: string;
      };
      assert.equal(payload.name, 'Error');
      assert.match(payload.message, /colorSchema/);
      assert.equal(payload.section, 'master-actions');
      assert.match(payload.componentStack, /SButton/);
    } finally {
      console.error = original;
    }
  });
});
