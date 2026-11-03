import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  portfolioStateLabel,
  portfolioTotals,
  portfolioQueryKey,
  portfolioEventSummary,
  type PortfolioCompany,
  type PortfolioEvent,
} from './portfolio-model.ts';

test('preparation and uncertain results never count as accepted deliveries', () => {
  const company = {
    deliveries: {
      ACCEPTED: 5,
      READY: 200,
      QUEUED: 3,
      SENDING: 1,
      PROCESSING: 2,
      POLLING: 4,
      UNKNOWN: 7,
      RECOVERING: 1,
      REJECTED: 2,
      BLOCKED: 3,
    },
  } as PortfolioCompany;
  assert.deepEqual(portfolioTotals(company), {
    accepted: 5,
    processing: 10,
    uncertain: 8,
    failures: 5,
  });
  assert.deepEqual(portfolioTotals({ deliveries: {} } as PortfolioCompany), {
    accepted: 0,
    processing: 0,
    uncertain: 0,
    failures: 0,
  });
  assert.equal(portfolioStateLabel('READY'), 'Preparado · não enviado');
  assert.equal(portfolioStateLabel('ACCEPTED'), 'Aceito');
  assert.match(portfolioStateLabel('UNKNOWN'), /incerto/);
  assert.equal(portfolioStateLabel('NEW_STATE'), 'Situação: NEW_STATE');
});
test('filters encode literal user text, environment and opaque cursor without query injection', () => {
  const query = new URLSearchParams(
    portfolioQueryKey(
      {
        environment: 1,
        search: 'Árvore 100%_ & state=ACCEPTED',
        family: 'S-2240',
        state: '',
      },
      'opaque+/=',
    ),
  );
  assert.equal(query.get('environment'), '1');
  assert.equal(query.get('search'), 'Árvore 100%_ & state=ACCEPTED');
  assert.equal(query.get('family'), 'S-2240');
  assert.equal(query.has('state'), false);
  assert.equal(query.get('cursor'), 'opaque+/=');
});
test('summaries distinguish absence of agents, declared codes and clinical event families', () => {
  const event = {
    family: 'S-2240',
    agentCodes: ['09.01.001'],
  } as PortfolioEvent;
  assert.equal(
    portfolioEventSummary(event),
    'Ausência de agentes nocivos declarados',
  );
  assert.equal(
    portfolioEventSummary({ ...event, agentCodes: ['02.01.001', '01.01.001'] }),
    'Agentes da Tabela 24: 02.01.001, 01.01.001',
  );
  assert.equal(
    portfolioEventSummary({
      ...event,
      agentCodes: ['02.01.001'],
      agentLabels: ['Ruído (02.01.001)'],
    }),
    'Agentes da Tabela 24: Ruído (02.01.001)',
  );
  assert.equal(
    portfolioEventSummary({ ...event, agentCodes: null }),
    'Condições ambientais do vínculo',
  );
  for (const [family, expected] of [
    ['S-2210', 'Comunicação de acidente de trabalho'],
    ['S-2220', 'Monitoramento da saúde ocupacional'],
    ['S-2221', 'Exame toxicológico'],
    ['S-3000', 'Exclusão de evento'],
  ])
    assert.equal(portfolioEventSummary({ ...event, family }), expected);
});
