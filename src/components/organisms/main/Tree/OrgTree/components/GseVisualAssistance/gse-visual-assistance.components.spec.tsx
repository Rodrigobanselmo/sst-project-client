import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { IGho } from 'core/interfaces/api/IGho';
import type { ITreeMap } from '../../interfaces';
import { TreeTypeEnum as T } from '../../enums/tree-type.enums';
import { GseVisualAssistanceContext } from './GseVisualAssistance.context';
import type { AssistanceContextValue } from './GseVisualAssistance.context';
import {
  GseAssistanceToolbar,
  GseAssistanceLegend,
  GseAssistanceControls,
  GseGroupLegend,
  GseAssistanceInfo,
  GseReviewDetails,
  transcribeVisualGuidance,
} from './GseVisualAssistance';
import { GseNavigationControls } from './GseReviewNavigation';
import { GhoToolTopButtons } from '../GhoTool/components/GhoToolTopButtons';
import { GseSaveConfirmation } from './GseSaveConfirmation';
import { GseAssistanceIndicator } from './GseAssistanceIndicator';
import { GhoToolView } from '../GhoTool/components/GhoToolView';
import { GhoSearchInput } from '../GhoTool/components/GhoSearchInput';
import { Row } from '../GhoTool/components/GhoRow/Row';
import {
  generateIntegratedReview,
  decideCreation,
  decideReviewChange,
  addReviewChange,
  REVIEW_COLORS,
} from './gse-integrated-review.model';
if (!(globalThis as any).__GSE_VISUAL_TEST_ISOLATED)
  throw Error('Execute pelo run-tests.cjs: APIs reais não devem ser usadas.');
const g = {
  id: 'g',
  name: 'GSE existente',
  companyId: 'c',
  status: 'ACTIVE',
  workspaceIds: ['w'],
  type: 0,
  description: 'Real',
} as IGho;
const nodes: ITreeMap = {
  w: {
    id: 'w',
    type: T.WORKSPACE,
    label: 'Filial',
    parentId: null,
    childrenIds: [],
    ghos: [],
    expand: true,
  },
  's//w': {
    id: 's//w',
    type: T.SECTOR,
    label: 'Administrativo',
    parentId: 'w',
    childrenIds: [],
    ghos: [],
    expand: true,
  },
  'a//w': {
    id: 'a//w',
    type: T.OFFICE,
    label: 'Assistente',
    parentId: 's//w',
    childrenIds: [],
    ghos: [g],
    expand: false,
  },
  'b//w': {
    id: 'b//w',
    type: T.OFFICE,
    label: 'Auxiliar',
    parentId: 's//w',
    childrenIds: [],
    ghos: [],
    expand: false,
  },
  'm//w': {
    id: 'm//w',
    type: T.SECTOR,
    label: 'Manutenção',
    parentId: 'w',
    childrenIds: [],
    ghos: [],
    expand: true,
  },
  'e//w': {
    id: 'e//w',
    type: T.OFFICE,
    label: 'Eletricista',
    parentId: 'm//w',
    childrenIds: [],
    ghos: [],
    expand: false,
  },
};
let review = generateIntegratedReview(nodes, [g], 'c', 'w', ''),
  selected: string | null = 'g',
  toggles = 0,
  writes = 0;
const context = (): AssistanceContextValue => ({
  active: true,
  toggle: () => {
    toggles++;
  },
  companyId: 'c',
  workspaceId: 'w',
  setWorkspaceId: () => {},
  workspaces: [{ id: 'w', name: 'Filial' }],
  nodes,
  groups: [g],
  rows: [g, ...review.newGroups.map((n) => ({ ...g, id: n.id, name: n.name }))],
  guidance: '',
  setGuidance: () => {},
  review,
  hasAnalysis: true,
  selectedGroupId: selected,
  selectGroup: (id) => {
    selected = id;
  },
  stale: false,
  loading: false,
  error: '',
  analyze: () => {},
  propose: (gid, nid, kind) => {
    review = addReviewChange(review, nodes, [g], 'w', gid, nid, kind);
  },
  decide: (id, d) => {
    review = decideReviewChange(review, id, d);
  },
  decideGroup: (id, d) => {
    review = decideCreation(review, id, d);
  },
  renameGroup: () => {},
});
const render = (
  el: React.ReactElement,
  ctx: AssistanceContextValue | null = context(),
  mode: 'light' | 'dark' = 'light',
) =>
  renderToStaticMarkup(
    <ThemeProvider theme={createTheme({ palette: { mode } })}>
      <GseVisualAssistanceContext.Provider value={ctx}>
        {el}
      </GseVisualAssistanceContext.Provider>
    </ThemeProvider>,
  );
let count = 0;
const test = (name: string, fn: () => void) => {
  fn();
  count++;
  console.log('PASS', name);
};
function find(
  el: React.ReactNode,
  match: (props: any) => boolean,
): React.ReactElement<any> | undefined {
  if (!React.isValidElement(el)) return;
  const known = el as React.ReactElement<any>;
  if (match(known.props)) return known;
  for (const child of React.Children.toArray(known.props.children)) {
    const found = find(child, match);
    if (found) return found;
  }
}
const list = () => (
  <GhoToolView
    selectedGhoId={selected}
    isDeleteLoading={false}
    handleSelectGHO={() => {
      writes++;
      throw Error('MANUAL_WRITE_PATH');
    }}
    handleDeleteGHO={() => {
      writes++;
      throw Error('MANUAL_WRITE_PATH');
    }}
    handleEditGHO={() => {
      writes++;
      throw Error('MANUAL_WRITE_PATH');
    }}
    handleFilter={() => {}}
    filter={0}
  />
);
test('same original GSE list renders existing and suggested groups together', () => {
  const html = render(list());
  assert(html.includes('GSE existente'));
  assert(html.includes('GSE — Manutenção'));
  assert(html.includes('Alterações propostas'));
  assert(html.includes('Novo sugerido'));
});
test('creation approval, rejection and reopening expose distinct actions without losing edges', () => {
  const id = review.newGroups[0].id;
  const before = JSON.stringify(review.changes);
  for (const decision of ['accepted', 'rejected', 'pending'] as const) {
    review = decideCreation(review, id, decision);
    const html = render(list());
    assert(
      html.includes(
        decision === 'accepted'
          ? 'Criação aprovada para aplicação futura'
          : decision === 'rejected'
            ? 'Criação rejeitada'
            : 'aguardando aprovação',
      ),
    );
    assert.equal(html.includes('Aceitar criação'), decision === 'pending');
    assert.equal(html.includes('Reabrir decisão'), decision !== 'pending');
    const details = render(<GseReviewDetails />);
    assert(details.includes('Criações:'));
    assert(
      details.includes(
        decision === 'accepted'
          ? '1 aprovada(s)'
          : decision === 'rejected'
            ? '1 rejeitada(s)'
            : '1 pendente(s)',
      ),
    );
    assert.equal(JSON.stringify(review.changes), before);
  }
});
test('selected group does not hide the remaining rows in assisted mode', () => {
  selected = 'g';
  const html = render(list());
  assert(html.includes('GSE — Manutenção'));
  assert(!html.includes('display:none'));
});
test('original organogram icon selects temporary group without manual callbacks', () => {
  const data = context().rows.find((r) => r.id !== 'g')!;
  let tree: React.ReactNode;
  function Capture() {
    tree = Row({
      data,
      hide: false,
      isSelected: false,
      handleSelectGHO: () => {
        writes++;
        return undefined;
      },
      handleDeleteGHO: () => {
        writes++;
      },
    }) as React.ReactNode;
    return <>{tree}</>;
  }
  render(<Capture />);
  find(
    tree,
    (p) => p['aria-label'] === `Visualizar vínculos de ${data.name}`,
  )!.props.onClick();
  assert.equal(selected, data.id);
  assert.equal(writes, 0);
});
test('suggested description is visible and editable before creation approval', () => {
  const ctx = context();
  const proposal = ctx.review.newGroups[0];
  proposal.description = 'Descrição proposta para revisão técnica.';
  let edited = '';
  ctx.describeGroup = (_id, value) => {
    edited = value;
  };
  const data = ctx.rows.find((g) => g.id === proposal.id)!;
  let tree: React.ReactNode;
  function CaptureDescription() {
    tree = Row({
      data,
      hide: false,
      isSelected: false,
      handleSelectGHO: () => undefined,
      handleDeleteGHO: () => undefined,
    }) as React.ReactNode;
    return <>{tree}</>;
  }
  const html = render(<CaptureDescription />, ctx);
  assert.ok(html.includes('Descrição sugerida do GSE'));
  assert.ok(html.includes(proposal.description));
  const field = find(
    tree,
    (props) => props.label === 'Descrição sugerida do GSE',
  )!;
  assert.equal(field.props.multiline, true);
  field.props.onChange({ target: { value: 'Descrição revisada' } });
  assert.equal(edited, 'Descrição revisada');
});
test('existing no changes neutral, changed amber and new purple', () => {
  const html = render(list());
  assert(
    html.toLowerCase().includes(REVIEW_COLORS.newGroup.color.toLowerCase()),
  );
  assert(
    html.toLowerCase().includes(REVIEW_COLORS.changedGroup.color.toLowerCase()),
  );
  const plain = {
    ...context(),
    review: { newGroups: [], changes: [] },
    rows: [g],
  };
  assert(render(list(), plain).includes('Existente · sem alterações'));
});
test('persisted GSEs retain conventional edit/delete actions in assistance', () => {
  const html = render(list());
  assert(html.includes('Deletar'));
  assert(html.includes('Editar'));
  assert(html.includes('Visualizar vínculos'));
});
test('temporary suggestions never expose conventional edit/delete actions', () => {
  const ctx = context();
  const proposed = ctx.rows.find((row) => ctx.review.newGroups.some((p) => p.id === row.id))!;
  const html = render(<Row data={proposed} isSelected={false} isDeleteLoading={false}
    handleDeleteGHO={() => { throw Error('NO_WRITE'); }} handleEditGHO={() => { throw Error('NO_WRITE'); }}
    handleSelectGHO={() => undefined} hide={false} anchorEl={{ current: null }} />, ctx);
  assert(!html.includes('Deletar'));
  assert(!html.includes('Editar'));
});
test('compact controls have no duplicate composition list', () => {
  const html = render(<GseAssistanceControls />);
  assert(html.includes('Orientações / voz'));
  assert(html.includes('Analisar estrutura'));
  assert(!html.includes('checkbox'));
  assert(!html.includes('Composição'));
});
test('circular link legend is separate from sidebar GSE states in light/dark', () => {
  for (const mode of ['light', 'dark'] as const) {
    const html = render(<GseAssistanceLegend />, context(), mode);
    for (const key of ['existing', 'add', 'remove'] as const)
      assert(
        html.toLowerCase().includes(REVIEW_COLORS[key].color.toLowerCase()),
      );
    assert(html.includes('Retirada sugerida'));
    assert(!html.includes('MuiChip'));
    assert(!html.includes('GSE novo'));
    const controls = render(<GseGroupLegend />, context(), mode);
    assert(controls.includes('Estados dos GSEs'));
    assert(
      controls
        .toLowerCase()
        .includes(REVIEW_COLORS.newGroup.color.toLowerCase()),
    );
  }
});
test('single header AI icon highlights activity and keeps the original toggle callback', () => {
  let tree: React.ReactNode;
  function Capture() {
    tree = GseAssistanceToolbar();
    return <>{tree}</>;
  }
  const html = render(<Capture />);
  assert(html.includes('aria-pressed="true"'));
  assert(!html.includes('sem modelo de IA'));
  assert(render(<GseReviewDetails />).includes('sem modelo de IA'));
  find(
    tree,
    (p) => p['aria-label'] === 'Assistência de GSEs — prévia visual',
  )!.props.onClick();
  assert.equal(toggles, 1);
});
test('header retains close and title without redundant assistance icon', () => {
  for (const active of [true, false]) {
    const html = render(
      <GhoToolTopButtons handleSelectGHO={() => undefined} />,
      { ...context(), active },
    );
    assert(html.includes('Grupo similar de exposição'));
    assert.equal(
      (html.match(/aria-label="Assistência de GSEs — prévia visual"/g) || [])
        .length,
      0,
    );
    assert.equal(html.includes('Área de arraste do painel'), active);
  }
});
test('diagnostic details are behind click control while temporary preview stays perceptible', () => {
  const html = render(<GseAssistanceInfo />);
  assert(html.includes('Prévia — alterações ainda não aplicadas'));
  assert(html.includes('Informações da revisão'));
  assert(!html.includes('Criações:'));
  assert(!render(<GseAssistanceControls />).includes('Criações:'));
});
test('compact navigation is hidden for zero or one target and routes arrow callbacks for multiple targets', () => {
  let prev = 0,
    next = 0;
  const props = {
    count: 3,
    position: 1,
    previous: () => {
      prev++;
    },
    next: () => {
      next++;
    },
  };
  assert.equal(render(<GseNavigationControls {...props} count={1} />), '');
  assert.equal(render(<GseNavigationControls {...props} count={0} />), '');
  const html = render(<GseNavigationControls {...props} />);
  assert(html.includes('Vínculo 2 de 3'));
  assert(!html.includes('Anterior vínculo'));
  const tree = GseNavigationControls(props);
  find(tree, (p) => p['aria-label'] === 'Vínculo anterior')!.props.onClick();
  find(tree, (p) => p['aria-label'] === 'Próximo vínculo')!.props.onClick();
  assert.equal(prev, 1);
  assert.equal(next, 1);
});
test('assisted list omits redundant GSE tab without changing manual tabs', () => {
  assert(!render(list()).includes('MuiChip'));
  assert(render(list(), { ...context(), active: false }).includes('GSE'));
});
test('assisted search has a full width wrapper without changing manual wrapper', () => {
  const html = render(<GhoSearchInput />);
  assert(html.includes('width:100%'));
  assert(html.includes('&gt;div') || html.includes('>div'));
  const manual = render(<GhoSearchInput />, { ...context(), active: false });
  assert(manual.length < html.length);
});
test('save summary footer stays disabled without approved additions and never sends a request', () => {
  const c = context();
  c.review = { newGroups: [], changes: [] };
  assert(render(<GseSaveConfirmation />, c).includes('disabled=""'));
  c.review.changes = [
    {
      id: 'approved',
      groupId: 'g',
      nodeId: 'b//w',
      kind: 'ADD',
      decision: 'accepted',
      reason: 'review',
    },
  ];
  const html = render(<GseSaveConfirmation />, c);
  assert(html.includes('Confirmar e salvar'));
  assert(html.includes('disabled=""')); // SSR cannot admit writes before capabilities returns.
  assert(html.includes('Verificando disponibilidade'));
  assert(html.includes('Verificar disponibilidade'));
  assert.equal(render(<GseSaveConfirmation />, { ...c, active: false }), '');
});
test('inactive mode removes assisted legend and controls', () => {
  const ctx = { ...context(), active: false };
  assert(
    !render(<GseAssistanceToolbar />, ctx).includes('Legenda da assistência'),
  );
  assert.equal(render(<GseAssistanceControls />, ctx), '');
});
test('existing direct circle uses original circular component and green semantics', () => {
  selected = 'g';
  const html = render(<GseAssistanceIndicator node={nodes['a//w']} />);
  assert(html.includes('Vínculo direto existente'));
  assert(
    html.toLowerCase().includes(REVIEW_COLORS.existing.color.toLowerCase()),
  );
  assert(html.includes('role="button"'));
});
test('inclusion circle is blue with explanation, selected group controls scope', () => {
  selected = 'g';
  const html = render(<GseAssistanceIndicator node={nodes['b//w']} />);
  assert(html.includes('Inclusão direta sugerida'));
  assert(html.toLowerCase().includes(REVIEW_COLORS.add.color.toLowerCase()));
  selected = null;
  assert.equal(render(<GseAssistanceIndicator node={nodes['b//w']} />), '');
});
test('withdrawal circle is red, explicitly defers PPP/eSocial decision', () => {
  selected = 'g';
  review = addReviewChange(review, nodes, [g], 'w', 'g', 'a//w', 'REMOVE');
  const html = render(<GseAssistanceIndicator node={nodes['a//w']} />);
  assert(html.toLowerCase().includes(REVIEW_COLORS.remove.color.toLowerCase()));
  assert(html.includes('PPP/eSocial'));
});
test('individual acceptance/rejection updates circles and row immediately', () => {
  selected = 'g';
  const change = review.changes.find((c) => c.nodeId === 'a//w')!;
  review = decideReviewChange(review, change.id, 'accepted');
  assert(
    render(<GseAssistanceIndicator node={nodes['a//w']} />).includes('aceita'),
  );
  review = decideReviewChange(review, change.id, 'rejected');
  assert(
    render(<GseAssistanceIndicator node={nodes['a//w']} />).includes(
      'Vínculo direto existente',
    ),
  );
  review = decideReviewChange(review, change.id, 'pending');
  assert(
    render(<GseAssistanceIndicator node={nodes['a//w']} />).includes(
      'Retirada de vínculo direto',
    ),
  );
});
test('stale review suspends proposal circles and decisions', () => {
  const html = render(<GseAssistanceIndicator node={nodes['a//w']} />, {
    ...context(),
    stale: true,
  });
  assert(html.includes('analise novamente'));
  assert(
    render(<GseAssistanceControls />, { ...context(), stale: true }).includes(
      'decisões anteriores estão suspensas',
    ),
  );
});
test('no occupational request in rendering and individual revision', () => {
  assert.equal(writes, 0);
  assert.equal(((globalThis as any).__visualRequests || []).length, 0);
});
(async () => {
  await transcribeVisualGuidance({
    audio: new Blob(['synthetic'], { type: 'audio/webm' }),
  });
  const requests = (globalThis as any).__visualRequests;
  assert.equal(requests.length, 1);
  assert.equal(requests[0].path, '/ai-chat/transcribe');
  count++;
  console.log('PASS only POST is isolated audio transcription');
  console.log(`${count} integrated component tests passed.`);
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
