import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GseOccupationalAnalysis } from './GseOccupationalAnalysis';
import { readFileSync } from 'node:fs';
import path from 'node:path';
if (!(globalThis as any).__GSE_VISUAL_TEST_ISOLATED)
  throw Error('Use run-tests.cjs');
const render = (workspaceId: string, disabled = false) =>
  renderToStaticMarkup(
    <GseOccupationalAnalysis
      companyId="c"
      workspaceId={workspaceId}
      disabled={disabled}
      onLocate={() => {
        throw Error('Unexpected navigation');
      }}
    />,
  );
const html = render('w');
assert.ok(html.includes('Auditoria ocupacional complementar'));
assert.ok(
  html.includes('aria-label="Sobre a auditoria ocupacional complementar"'),
);
assert.ok(!html.includes('Aceitar criação'));
assert.equal((html.match(/<button/g) || []).length, 2);
assert.match(render(''), /disabled=""/);
assert.match(render('w', true), /disabled=""/);
const folder = path.join(
  process.cwd(),
  'src/components/organisms/main/Tree/OrgTree/components/GseVisualAssistance',
);
const source = readFileSync(
  path.join(folder, 'GseOccupationalAnalysis.tsx'),
  'utf8',
);
assert.ok(
  !/createGseFromProposal|saveApproved|buildSaveRequest|useMut/.test(source),
);
assert.ok(source.includes('request !== generation.current'));
assert.ok(source.includes('setResult(null)'));
assert.ok(source.includes('DIAGNOSIS_SCOPE_MISMATCH'));
const integration = readFileSync(
  path.join(folder, 'GseVisualAssistance.tsx'),
  'utf8',
);
assert.ok(integration.includes('key={`${ctx.companyId}/${ctx.workspaceId}`}'));
assert.ok(integration.includes('onClick={ctx.analyze}'));
assert.ok(integration.includes('onLocate={ctx.selectGroup}'));
console.log(
  '8 occupational component/boundary checks passed (SSR and source guards; no browser interaction).',
);
