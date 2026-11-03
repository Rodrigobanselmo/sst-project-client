import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { GseAiConsultativeHeading } from './GseAiConsultativeAnalysis';
import { GseAiProposalCard } from './GseAiProposalCard';
import {
  GseFloatingPanel,
  clampPanelPosition,
  initialGsePanelPosition,
  gsePanelMaxHeight,
} from './GseFloatingPanel';
import { GseConsultativeInfo } from './GseConsultativeInfo';
import {
  initialAiReview,
  roleRecommendations,
  recommendationSummary,
  professionalGseText,
  professionalSources,
  AiGseAnalysis,
  AiGseProposal,
} from './gse-ai-consultative';
if (!(globalThis as any).__GSE_VISUAL_TEST_ISOLATED)
  throw Error('Use isolated run-tests.cjs');
const id = '11111111-1111-4111-8111-111111111111',
  gid = '22222222-2222-4222-8222-222222222222';
const analysis = {
  sources: {
    roles: [
      {
        id,
        name: 'Cargo existente',
        formal: { text: 'Descrição formal', source: 'Hierarchy.description' },
        interview: {
          text: 'Atividades reais',
          source: 'Hierarchy.realDescription',
        },
      },
    ],
    structure: [
      { id, name: 'Cargo existente', parentId: null, type: 'OFFICE' },
    ],
    existingGroups: [{ id: gid, name: 'Grupo atual' }],
    characterizations: [],
    guidance: { text: '' },
    observations: { text: '' },
    occupationalRisks: { records: [] },
  },
} as unknown as AiGseAnalysis;
function fixture(
  conclusion: 'KEEP' | 'REVIEW' | 'INCLUDE' | 'INSUFFICIENT',
): AiGseProposal {
  return {
    id: 'p',
    name: 'Grupo atual',
    description: 'Descrição do grupo',
    hierarchyIds: [id],
    existingGroupId: conclusion === 'INCLUDE' ? null : gid,
    justification: 'Fundamento técnico',
    informationUsed: ['Hierarchy.realDescription'],
    divergences: [],
    hypotheses: [],
    missingInformation: [],
    questions: [],
    fieldConfirmation: 'Conferir atividades no local',
    classification: 'QUALITATIVE',
    occupationalHomogeneityConfirmed: false,
    review: 'HUMAN_REVIEW_REQUIRED',
    overlaps: [],
    pendingHierarchyIds: [],
    recommendations: [
      {
        hierarchyId: id,
        conclusion,
        justification: 'Avaliar atividade relatada',
        evidence: ['Hierarchy.realDescription'],
        divergences:
          conclusion === 'REVIEW'
            ? ['Atividade real diverge do perfil geral']
            : [],
        recommendation: 'Confirmar condições reais antes de decidir',
        missingInformation:
          conclusion === 'INSUFFICIENT' ? ['Frequência não informada'] : [],
        questions: conclusion === 'INSUFFICIENT' ? ['Qual a frequência?'] : [],
        currentGroups:
          conclusion === 'INCLUDE' ? [] : [{ id: gid, name: 'Grupo atual' }],
        existingInTarget: conclusion !== 'INCLUDE',
      },
    ],
  };
}
function render(p: AiGseProposal, state?: 'accepted' | 'rejected') {
  const review = initialAiReview(p);
  if (state) review.roles[id] = state;
  return renderToStaticMarkup(
    <GseAiProposalCard
      proposal={p}
      analysis={analysis}
      review={review}
      disabled={false}
      onEdit={() => {}}
      onLocate={() => {}}
    />,
  );
}
let count = 0;
function test(label: string, fn: () => void) {
  fn();
  count++;
  console.log('PASS', label);
}
test('existing unchanged link has no unnecessary decisions', () => {
  const p = fixture('KEEP'),
    html = render(p);
  assert.ok(html.includes('Manter vínculo'));
  assert.ok(html.includes('Vínculo existente'));
  assert.ok(!html.includes('Aceitar recomendação'));
  assert.ok(!html.includes('Reabrir decisão'));
  assert.deepEqual(initialAiReview(p).roles, {});
});
test('inconsistent link shows current group, divergence and objective review', () => {
  const html = render(fixture('REVIEW'));
  for (const label of [
    'Revisar vínculo',
    'Grupo atual',
    'Atividade real diverge',
    'Avaliar atividade relatada',
    'Confirmar condições reais',
  ])
    assert.ok(html.includes(label));
});
test('inclusion is an explicit consultative recommendation, not a second link editor', () => {
  const html = render(fixture('INCLUDE'));
  assert.ok(html.includes('Considerar inclusão'));
  assert.ok(html.includes('Cargo não vinculado'));
  assert.ok(!html.includes('Excluir vínculo'));
  assert.ok(!html.includes('Salvar'));
});
test('insufficient information asks for clarification without automatic keep or mutation', () => {
  const html = render(fixture('INSUFFICIENT'));
  assert.ok(html.includes('Informações insuficientes'));
  assert.ok(html.includes('Qual a frequência?'));
  assert.ok(!html.includes('Manter vínculo'));
  assert.ok(!html.includes('Aceitar recomendação'));
});
test('pending recommendations offer accept/reject and never reopen', () => {
  const html = render(fixture('REVIEW'));
  assert.ok(html.includes('Pendente de avaliação'));
  assert.ok(html.includes('Aceitar recomendação'));
  assert.ok(html.includes('Rejeitar recomendação'));
  assert.ok(!html.includes('Reabrir decisão'));
});
test('decided recommendations offer only reopen and human-readable state', () => {
  for (const [state, label] of [
    ['accepted', 'Recomendação aceita'],
    ['rejected', 'Recomendação rejeitada'],
  ] as const) {
    const html = render(fixture('REVIEW'), state);
    assert.ok(html.includes(label));
    assert.ok(html.includes('Reabrir decisão'));
    assert.ok(!html.includes('Aceitar recomendação'));
    assert.ok(!html.includes('Rejeitar recomendação'));
    assert.ok(!html.includes(`>${state}<`));
  }
});
test('technical justification and evidence start collapsed', () => {
  const html = render(fixture('REVIEW'));
  assert.ok(html.includes('Ver justificativa técnica'));
  assert.ok(html.includes('Fundamentação técnica do grupo'));
  assert.ok(html.includes('<details><summary>Fundamentação técnica do grupo</summary>'));
  for (const label of [
    'Informações consideradas',
    'Divergências identificadas',
    'Hipóteses da análise',
    'Esclarecimentos necessários',
    'Confirmações recomendadas em campo',
  ])
    assert.ok(html.includes(label));
});
test('technical identifiers and raw API objects never appear in card markup', () => {
  const p = fixture('REVIEW');
  p.justification = `Hierarchy.realDescription do cargo ${id}`;
  const html = render(p);
  assert.ok(!html.includes(id));
  assert.ok(!html.includes(gid));
  assert.ok(!html.includes('Hierarchy.realDescription'));
  assert.ok(!html.includes('contextHash'));
  assert.ok(!html.includes('<pre'));
  assert.ok(html.includes('Descrição real/entrevista'));
});
test('general conclusion is derived from role conclusions, not invented adequacy', () => {
  const p = fixture('REVIEW');
  assert.deepEqual(recommendationSummary(p), {
    keep: 0,
    review: 1,
    remove: 0,
    include: 0,
    insufficient: 0,
  });
  assert.ok(render(p).includes('1 revisar'));
});
test('legacy response without recommendations explicitly requires reanalysis', () => {
  const p = fixture('KEEP');
  delete p.recommendations;
  assert.equal(roleRecommendations(p)[0].conclusion, 'INSUFFICIENT');
  assert.deepEqual(initialAiReview(p).roles, {});
  assert.ok(render(p).includes('Reexecute a análise'));
});
test('traceability lists only supplied sources; internal payload remains intact', () => {
  const source = JSON.stringify(analysis);
  const list = professionalSources(analysis);
  assert.ok(list.includes('Descrição real/entrevista'));
  assert.ok(!list.includes('Riscos ocupacionais cadastrados'));
  assert.ok(!list.includes('Observações do profissional'));
  assert.equal(JSON.stringify(analysis), source);
  assert.ok(!professionalGseText(`Cargo ${gid}`).includes(gid));
});
test('information tooltip is focusable and has an accessible label', () => {
  const html = renderToStaticMarkup(
    <GseConsultativeInfo label="Sobre a recomendação">
      Informação profissional.
    </GseConsultativeInfo>,
  );
  assert.ok(html.includes('aria-label="Sobre a recomendação"'));
  assert.ok(html.includes('tabindex="0"'));
});
test('wider floating panel respects small viewports and resizing bounds', () => {
  for (const [vw, vh, w, h] of [
    [1440, 900, 462, 650],
    [360, 640, 328, 450],
    [200, 240, 168, 120],
  ]) {
    const p = clampPanelPosition(9999, 9999, w, h, vw, vh);
    assert.ok(p.x >= 8);
    assert.ok(p.y >= 8);
    assert.ok(p.x + w <= vw);
    assert.ok(p.y + h <= vh);
  }
  const html = renderToStaticMarkup(
    <GseFloatingPanel>
      <div>Conteúdo</div>
    </GseFloatingPanel>,
  );
  assert.ok(html.includes('462px'));
  assert.ok(!html.includes('role="dialog"'));
});
test('drag header preserves close while eliminating redundant icon; no write bridge', () => {
  const root = path.join(
    process.cwd(),
    'src/components/organisms/main/Tree/OrgTree/components',
  );
  const header = readFileSync(
    path.join(root, 'GhoTool/components/GhoToolTopButtons/index.tsx'),
    'utf8',
  );
  assert.ok(header.includes('handleCloseRisk'));
  assert.ok(header.includes('data-gse-drag-handle'));
  assert.ok(header.includes('Área de arraste do painel'));
  assert.ok(!header.includes('GseAssistanceToolbar'));
  const card = readFileSync(
    path.join(root, 'GseVisualAssistance/GseAiProposalCard.tsx'),
    'utf8',
  );
  assert.ok(!/SaveRequest|createGseFromProposal|useMut/.test(card));
});
test('AI title and information button share one responsive row without changing the tooltip', () => {
  const row = GseAiConsultativeHeading();
  assert.equal(row.props.direction, 'row');
  assert.equal(row.props.flexWrap, 'nowrap');
  assert.equal(row.props.alignItems, 'center');
  const info = row.props.children[1].props.children;
  assert.equal(info.props.label, 'Sobre a análise por IA');
  assert.equal(
    info.props.children,
    'Interpreta estrutura, atividades, descrições, entrevistas e orientações. Não exige riscos cadastrados. Recomendações são temporárias e não executam alterações.',
  );
  const html = renderToStaticMarkup(row);
  assert.ok(html.includes('data-gse-ai-heading'));
  assert.ok(html.includes('aria-label="Sobre a análise por IA"'));
  assert.ok(html.includes('tabindex="0"'));
});
test('opening/reset reserves bottom controls without persisting a previous position', () => {
  for (const [vw, vh, w, h] of [
    [1480, 1492, 462, 1303],
    [1440, 900, 462, 684],
    [390, 844, 358, 628],
    [360, 640, 328, 424],
  ]) {
    const p = initialGsePanelPosition(w, h, vw, vh);
    assert.ok(vh - (p.y + h) >= 80);
    assert.ok(p.y >= 8 && p.y <= 112);
    assert.ok(p.x >= 8 && p.x + w <= vw);
    assert.deepEqual(initialGsePanelPosition(w, h, vw, vh), p);
  }
});
test('moving the panel manually retains the original bottom bounds', () => {
  const opened = initialGsePanelPosition(462, 600, 1440, 900),
    dragged = clampPanelPosition(900, 500, 462, 600, 1440, 900);
  assert.equal(900 - (dragged.y + 600), 8);
  assert.ok(dragged.y > opened.y);
});
test('initial placement stays at the useful top instead of being pushed down by manual clamp limits', () => {
  for (const top of [80, 88, 104]) {
    const maxHeight = gsePanelMaxHeight(800, top);
    const p = initialGsePanelPosition(462, maxHeight, 1440, 800, top);
    assert.equal(p.y, top);
    assert.equal(800 - p.y - maxHeight, 96);
    assert.deepEqual(
      initialGsePanelPosition(462, maxHeight, 1440, 800, top),
      p,
    );
  }
  const source = readFileSync(
    path.join(
      process.cwd(),
      'src/components/organisms/main/Tree/OrgTree/components/GseVisualAssistance/GseFloatingPanel.tsx',
    ),
    'utf8',
  );
  assert.ok(source.includes('manualPosition.current'));
  assert.ok(source.includes('data-gse-organogram-viewport'));
});
console.log(
  `${count} occupational review UX tests passed (synthetic unit/SSR only).`,
);
