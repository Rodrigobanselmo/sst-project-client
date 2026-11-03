import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { api } from 'core/services/apiClient';
import { GseAiConsultativeAnalysis } from './GseAiConsultativeAnalysis';
import {
  analyzeGseWithAi,
  initialAiReview,
  aiRolePath,
  aiClassificationLabel,
  AiGseProposal,
} from './gse-ai-consultative';
if (!(globalThis as any).__GSE_VISUAL_TEST_ISOLATED)
  throw Error('Use run-tests.cjs');
const render = (workspaceId = 'w', disabled = false) =>
  renderToStaticMarkup(
    <GseAiConsultativeAnalysis
      companyId="c"
      workspaceId={workspaceId}
      guidance="Considerar atividade real"
      disabled={disabled}
      onLocate={() => {
        throw Error('Unexpected navigation');
      }}
    />,
  );
let count = 0;
function test(label: string, fn: () => void) {
  fn();
  count++;
  console.log('PASS', label);
}
test('AI entry remains in the assistance panel and identifies its consultative scope', () => {
  const html = render();
  assert.ok(html.includes('Analisar com IA'));
  assert.ok(html.includes('aria-label="Sobre a análise por IA"'));
  assert.ok(html.includes('Observações do profissional'));
  assert.ok(!html.includes('contextHash'));
});
test('no workspace and persistence busy prevent model request button activation', () => {
  assert.match(render(''), /disabled=""/);
  assert.match(render('w', true), /disabled=""/);
});
test('local review is editable and partial without mutating original proposal evidence', () => {
  const proposal = {
    id: 'p',
    name: 'Name',
    description: 'Description',
    hierarchyIds: ['h', 'j'],
  } as AiGseProposal;
  const review = initialAiReview(proposal);
  review.name = 'Edited';
  review.description = 'Edited description';
  review.roles.h = 'accepted';
  review.roles.j = 'rejected';
  assert.equal(proposal.name, 'Name');
  assert.equal(proposal.description, 'Description');
  assert.equal(review.roles.h, 'accepted');
  assert.equal(review.roles.j, 'rejected');
  assert.equal(review.decision, 'pending');
});
test('maturity labels never certify occupational homogeneity', () => {
  for (const level of [
    'PRELIMINARY',
    'QUALITATIVE',
    'OCCUPATIONAL_CONFRONTED',
  ] as const) {
    assert.ok(aiClassificationLabel(level));
    assert.ok(!aiClassificationLabel(level).includes('comprovada'));
  }
});
test('same-name roles remain distinguishable by sector; cyclic paths terminate', () => {
  const analysis: any = {
    sources: {
      roles: [],
      structure: [
        { id: 's', parentId: null, name: 'Manutenção' },
        { id: 't', parentId: null, name: 'Administrativo' },
        { id: 'h', parentId: 's', name: 'Operador' },
        { id: 'j', parentId: 't', name: 'Operador' },
      ],
    },
  };
  assert.notEqual(aiRolePath(analysis, 'h'), aiRolePath(analysis, 'j'));
  analysis.sources.structure[0].parentId = 'h';
  assert.ok(aiRolePath(analysis, 'h').includes('Operador'));
});
const folder = path.join(
  process.cwd(),
  'src/components/organisms/main/Tree/OrgTree/components/GseVisualAssistance',
);
test('AI component has no persistence bridge and prevents late scope results', () => {
  const source = readFileSync(
    path.join(folder, 'GseAiConsultativeAnalysis.tsx'),
    'utf8',
  );
  assert.ok(
    !/buildSaveRequest|createGseFromProposal|useMut|ctx\.review/.test(source),
  );
  assert.ok(source.includes('current !== request.current'));
  assert.ok(source.includes('inputAtAnalysis'));
  assert.ok(source.includes('GseAiProposalCard'));
  const integration = readFileSync(
    path.join(folder, 'GseVisualAssistance.tsx'),
    'utf8',
  );
  assert.ok(
    integration.includes('key={`ai/${ctx.companyId}/${ctx.workspaceId}`}'),
  );
  assert.ok(integration.includes('guidance={ctx.guidance}'));
});
(async () => {
  const previous = api.post;
  try {
    let captured: any;
    api.post = (async (url: string, body: any) => {
      captured = { url, body };
      return {
        status: 201,
        data: {
          companyId: 'c',
          workspaceId: 'w',
          status: 'ANALYZED',
          fallback: 'NONE',
          proposals: [],
          questions: [],
          doNotGroup: [],
          sources: { roles: [], structure: [] },
        },
      };
    }) as any;
    await analyzeGseWithAi('c', 'w', 'Separate welding', 'Night shift');
    test('same API client sends professional instructions to the fixed consultative endpoint', () => {
      assert.equal(
        captured.url,
        '/v2/companies/c/workspaces/w/exposure-group-assistant/ai-consultative',
      );
      assert.deepEqual(captured.body, {
        guidance: 'Separate welding',
        observations: 'Night shift',
        preliminaryDistribution: [],
      });
    });
    api.post = (async () => ({
      data: { companyId: 'foreign', workspaceId: 'w' },
    })) as any;
    await assert.rejects(
      () => analyzeGseWithAi('c', 'w', '', ''),
      /AI_SCOPE_MISMATCH/,
    );
    count++;
    console.log('PASS client rejects cross-company model response');
    api.post = (async () => {
      throw Error('Unavailable');
    }) as any;
    await assert.rejects(
      () => analyzeGseWithAi('c', 'w', '', ''),
      /Unavailable/,
    );
    count++;
    console.log('PASS provider failure is not replaced by structural analysis');
  } finally {
    api.post = previous;
  }
  console.log(
    `${count} AI consultative client checks passed (SSR, local review and transport; no model/network).`,
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
