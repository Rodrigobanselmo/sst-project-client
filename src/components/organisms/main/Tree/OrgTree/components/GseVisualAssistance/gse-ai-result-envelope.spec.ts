import assert from 'node:assert/strict';
import {
  parseAiGseAnalysisResponse,
  aiConsultativeClientError,
} from './gse-ai-consultative';
const base = () => ({
  companyId: 'c',
  workspaceId: 'w',
  fallback: 'NONE',
  proposals: [],
  questions: [],
  doNotGroup: [],
  sources: { roles: [], structure: [] },
});
let count = 0;
function test(name: string, fn: () => void) {
  fn();
  count++;
  console.log('PASS', name);
}
test('HTTP 201 may carry a valid analysis, and the body remains analyzed', () => {
  const transport = { status: 201, data: { ...base(), status: 'ANALYZED' } };
  assert.equal(
    parseAiGseAnalysisResponse(transport.data, 'c', 'w').status,
    'ANALYZED',
  );
});
test('HTTP 201 may carry a controlled failure, never accepted as a valid proposal', () => {
  const transport = {
    status: 201,
    data: {
      ...base(),
      status: 'UNAVAILABLE',
      reason: 'Contrato rejeitado',
      failure: {
        stage: 'CONTRACT',
        code: 'INVALID_RESPONSE_SCHEMA',
        issues: [{ code: 'too_small', path: 'proposals.1.description' }],
      },
    },
  };
  const result = parseAiGseAnalysisResponse(transport.data, 'c', 'w');
  assert.equal(result.status, 'UNAVAILABLE');
  assert.deepEqual(result.proposals, []);
  assert.equal(result.failure?.issues?.[0].path, 'proposals.1.description');
});
test('a large source payload cannot change the business status', () => {
  const data = {
    ...base(),
    status: 'ANALYZED',
    sources: { roles: [], structure: [], notes: 'x'.repeat(52000) },
  };
  assert.equal(parseAiGseAnalysisResponse(data, 'c', 'w').status, 'ANALYZED');
});
test('rejects success mixed with failure metadata', () =>
  assert.throws(
    () =>
      parseAiGseAnalysisResponse(
        {
          ...base(),
          status: 'ANALYZED',
          failure: { code: 'INVALID_RESPONSE_SCHEMA' },
        },
        'c',
        'w',
      ),
    /AI_INVALID_RESPONSE_ENVELOPE/,
  ));
test('rejects controlled failure carrying partially valid proposals', () =>
  assert.throws(
    () =>
      parseAiGseAnalysisResponse(
        {
          ...base(),
          status: 'UNAVAILABLE',
          reason: 'Rejected',
          proposals: [{ id: 'p', name: 'x', description: 'x' }],
        },
        'c',
        'w',
      ),
    /AI_INVALID_RESPONSE_ENVELOPE/,
  ));
test('rejects unknown statuses, missing envelope and blank proposals', () => {
  for (const value of [
    null,
    {},
    { ...base(), status: 'SUCCESS' },
    {
      ...base(),
      status: 'ANALYZED',
      proposals: [{ id: 'p', name: 'x', description: ' ' }],
    },
  ])
    assert.throws(() => parseAiGseAnalysisResponse(value, 'c', 'w'));
});
test('retains tenant scope checks', () =>
  assert.throws(
    () =>
      parseAiGseAnalysisResponse(
        { ...base(), companyId: 'foreign', status: 'ANALYZED' },
        'c',
        'w',
      ),
    /AI_SCOPE_MISMATCH/,
  ));
test('distinguishes malformed API return from provider or contract errors without exposing raw content', () => {
  assert.match(
    aiConsultativeClientError(Error('AI_INVALID_RESPONSE_ENVELOPE')),
    /formato de análise/,
  );
  assert.match(
    aiConsultativeClientError(Error('AI_SCOPE_MISMATCH')),
    /empresa e ao estabelecimento/,
  );
  assert.ok(
    !aiConsultativeClientError(Error('SECRET raw SDK failure')).includes(
      'SECRET',
    ),
  );
});
  test('a real-shaped nonempty valid analysis is not misclassified as unavailable', () => {
    const proposal = {
      id: 'p',
      name: 'Grupo',
      description: 'Proposta qualitativa',
      hierarchyIds: ['h'],
      existingGroupId: null,
      justification: 'Atividades a confirmar',
      informationUsed: ['Entrevista'],
      divergences: [],
      hypotheses: [],
      missingInformation: [],
      questions: [],
      fieldConfirmation: 'Confirmar em campo',
      classification: 'QUALITATIVE',
      occupationalHomogeneityConfirmed: false,
      review: 'HUMAN_REVIEW_REQUIRED',
      overlaps: [],
      pendingHierarchyIds: ['h'],
      recommendations: [
        {
          hierarchyId: 'h',
          conclusion: 'INCLUDE',
          justification: 'Avaliar compatibilidade',
          evidence: ['Entrevista'],
          divergences: [],
          recommendation: 'Avaliar inclusão',
          missingInformation: [],
          questions: [],
          currentGroups: [],
          existingInTarget: false,
        },
      ],
    };
    const response = { ...base(), status: 'ANALYZED', proposals: [proposal] };
    const parsed = parseAiGseAnalysisResponse(response, 'c', 'w');
    assert.equal(parsed.status, 'ANALYZED');
    assert.equal(parsed.proposals.length, 1);
    assert.equal(
      parsed.proposals[0].recommendations?.[0].conclusion,
      'INCLUDE',
    );
    assert.throws(
      () =>
        parseAiGseAnalysisResponse(
          {
            ...response,
            proposals: [
              proposal,
              { ...proposal, id: 'q', description: undefined },
            ],
          },
          'c',
          'w',
        ),
      /AI_INVALID_RESPONSE_ENVELOPE/,
    );
  });
console.log(`${count} response envelope tests passed; no API/provider calls.`);
