import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  legalDeadlineSummary,
  type EventDeadlinePresentation,
} from './legal-deadline-model.ts';

function presentation(
  patch: Partial<EventDeadlinePresentation> = {},
  deadline: Partial<EventDeadlinePresentation['deadline']> = {},
): EventDeadlinePresentation {
  return {
    assessment: 'OPEN',
    asOf: '2026-10-27',
    timezone: 'America/Sao_Paulo',
    pending: true,
    accepted: false,
    excluded: false,
    deliveryState: null,
    policyVersion: 'outubro/2026',
    policySha256: 'a'.repeat(64),
    contextPin: { sourceId: 'private-source-id', snapshotHash: 'b'.repeat(64) },
    ...patch,
    deadline: {
      family: 'S-2240',
      environment: 1,
      legalEffect: true,
      state: 'CALCULATED',
      precision: 'CIVIL_DATE',
      urgency: 'NORMAL',
      basisDate: '2026-10-01',
      dueDate: '2026-11-16',
      nominalDueDate: '2026-11-15',
      originalDueDate: null,
      calendar: {
        id: 'private-calendar-id',
        version: '2026',
        kind: 'FISCAL',
        scope: 'Brasil',
        sha256: 'c'.repeat(64),
      },
      diagnostics: [],
      ...deadline,
    },
  };
}

test('only an exact calculated civil day produces a Brazilian due-date label without timezone conversion', () => {
  const value = presentation();
  const before = JSON.stringify(value);
  const summary = legalDeadlineSummary(value)!;
  assert.equal(summary.dueLabel, 'Vencimento calculado: 16/11/2026');
  assert.equal(summary.simulation, false);
  assert(summary.details.some((item) => item.value === '01/10/2026'));
  assert.equal(JSON.stringify(value), before);
  assert(!JSON.stringify(summary).includes('private-source-id'));
  assert(!JSON.stringify(summary).includes('private-calendar-id'));
  assert(!JSON.stringify(summary).includes('b'.repeat(64)));
});

test('review, imprecise, absent and impossible days never reuse a nominal or residual due date', () => {
  for (const deadline of [
    { state: 'NEEDS_REVIEW' as const },
    { precision: 'NONE' as const },
    { dueDate: '2026-02-31' },
    { dueDate: null },
  ]) {
    const summary = legalDeadlineSummary(presentation({}, deadline))!;
    assert.equal(summary.dueLabel, null);
    assert.equal(summary.title, 'Conferência necessária');
  }
  assert.equal(legalDeadlineSummary(undefined), null);
});

test('restricted production stays visibly simulated, even when delivery is accepted or assessment says overdue', () => {
  for (const accepted of [false, true]) {
    const summary = legalDeadlineSummary(
      presentation(
        { assessment: 'OVERDUE', accepted },
        { environment: 2, legalEffect: false },
      ),
    )!;
    assert.equal(summary.simulation, true);
    assert.equal(summary.dueLabel, 'Vencimento simulado: 16/11/2026');
    assert.notEqual(summary.severity, 'error');
  }
});

test('a pending fatal CAT remains urgent when legal context needs review, with no invented deadline', () => {
  const summary = legalDeadlineSummary(
    presentation(
      { assessment: 'NEEDS_REVIEW' },
      {
        family: 'S-2210',
        state: 'NEEDS_REVIEW',
        precision: 'NONE',
        urgency: 'IMMEDIATE',
      },
    ),
  )!;
  assert.equal(summary.title, 'CAT: ação imediata');
  assert.match(
    summary.message,
    /conferência pendente não elimina essa urgência/,
  );
  assert.equal(summary.severity, 'error');
  assert.equal(summary.dueLabel, null);
});

test('acceptance cannot certify timeliness or remain labelled overdue', () => {
  const summary = legalDeadlineSummary(
    presentation({
      accepted: true,
      assessment: 'ACCEPTED_TIMELINESS_NOT_EVALUATED',
    }),
  )!;
  assert.match(summary.title, /cumprimento do prazo não avaliado/);
  assert.match(summary.message, /não comprova/);
  assert.equal(summary.severity, 'info');
  assert(!/no prazo|pontual|cumprido/.test(summary.title));
});

test('production alone can display an exact overdue or due-today assessment', () => {
  assert.equal(
    legalDeadlineSummary(presentation({ assessment: 'OVERDUE' }))!.severity,
    'error',
  );
  assert.match(
    legalDeadlineSummary(presentation({ assessment: 'DUE_TODAY' }))!.title,
    /hoje/,
  );
});

test('uncertain or ongoing transmission keeps a calculated day informative without certifying official lateness', () => {
  for (const deliveryState of [
    'SENDING',
    'PROCESSING',
    'POLLING',
    'UNKNOWN',
    'RECOVERING',
  ]) {
    const summary = legalDeadlineSummary(
      presentation(
        { assessment: 'TRANSMISSION_TIMELINESS_UNKNOWN', deliveryState },
        { dueDate: '2026-10-15' },
      ),
    )!;
    assert.equal(summary.dueLabel, 'Vencimento calculado: 15/10/2026');
    assert.equal(
      summary.title,
      'Envio em conferência: cumprimento do prazo não avaliado',
    );
    assert.match(summary.message, /não comprova atraso nem cumprimento/);
    assert.equal(summary.severity, 'info');
    assert(!/ultrapassado|atrasado/.test(summary.title));
  }
});

test('uncertain CAT transmission retains immediate urgency, including when its context needs review', () => {
  const summary = legalDeadlineSummary(
    presentation(
      {
        assessment: 'TRANSMISSION_TIMELINESS_UNKNOWN',
        deliveryState: 'UNKNOWN',
      },
      {
        family: 'S-2210',
        state: 'NEEDS_REVIEW',
        precision: 'NONE',
        urgency: 'IMMEDIATE',
      },
    ),
  )!;
  assert.equal(summary.title, 'CAT: ação imediata');
  assert.match(
    summary.message,
    /conferência pendente não elimina essa urgência/,
  );
  assert.match(summary.message, /cumprimento do prazo não foi determinado/);
  assert.equal(summary.dueLabel, null);
  assert.equal(summary.severity, 'error');
});

test('exclusion and rectification do not invent a new monthly deadline or reset the original', () => {
  const exclusion = legalDeadlineSummary(
    presentation(
      {},
      {
        family: 'S-3000',
        state: 'NO_FIXED_DEADLINE',
        precision: 'NONE',
        dueDate: null,
        originalDueDate: '2026-10-15',
      },
    ),
  )!;
  assert.equal(exclusion.dueLabel, null);
  assert.match(exclusion.message, /não renova nem substitui/);
  assert(
    exclusion.details.some(
      (item) =>
        item.label === 'Prazo original registrado' &&
        item.value === '15/10/2026',
    ),
  );
  const correction = legalDeadlineSummary(
    presentation(
      {},
      { state: 'NO_FIXED_DEADLINE', precision: 'NONE', dueDate: null },
    ),
  )!;
  assert.match(correction.message, /não abre um novo prazo/);
});

test('excluded and cancelled declarations retain the distinction from a fulfilled obligation', () => {
  const excluded = legalDeadlineSummary(
    presentation({
      accepted: true,
      excluded: true,
      assessment: 'EXCLUDED_REVIEW_REQUIRED',
    }),
  )!;
  assert.match(excluded.title, /Evento excluído/);
  assert.match(excluded.message, /não renova/);
  const cancelled = legalDeadlineSummary(
    presentation({ assessment: 'CANCELLED' }),
  )!;
  assert.equal(cancelled.title, 'Preparação cancelada');
  assert.match(cancelled.message, /não comprova/);
});

test('only official eSocial authority links are displayed, diagnostics expose messages without technical IDs', () => {
  const summary = legalDeadlineSummary(
    presentation(
      {},
      {
        authority: {
          reviewedOn: '2026-10-27',
          sourceUrl: 'https://www.gov.br/esocial/pt-br/manual.pdf',
        },
        diagnostics: [
          {
            code: 'PRIVATE_CODE',
            message: 'Confira a data de início da obrigação.',
          },
        ],
      },
    ),
  )!;
  assert.equal(
    summary.authorityUrl,
    'https://www.gov.br/esocial/pt-br/manual.pdf',
  );
  assert.deepEqual(summary.diagnostics, [
    'Confira a data de início da obrigação.',
  ]);
  assert.equal(
    legalDeadlineSummary(
      presentation(
        {},
        {
          authority: {
            reviewedOn: '2026-10-27',
            sourceUrl: 'https://example.com/manual.pdf',
          },
        },
      ),
    )!.authorityUrl,
    null,
  );
});
