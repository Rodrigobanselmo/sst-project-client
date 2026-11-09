import assert from 'node:assert/strict';
import React from 'react';
import { SnackbarProvider } from 'notistack';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClientProvider } from 'react-query';
import theme from '../../src/configs/theme';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BottomButton } from '../../src/components/organisms/main/Tree/OrgTree/components/BottomButton';
import { GhoTool } from '../../src/components/organisms/main/Tree/OrgTree/components/GhoTool';
import { GhoToolView } from '../../src/components/organisms/main/Tree/OrgTree/components/GhoTool/components/GhoToolView';
import { GhoToolTopButtons } from '../../src/components/organisms/main/Tree/OrgTree/components/GhoTool/components/GhoToolTopButtons';
import { GseVisualAssistanceContext } from '../../src/components/organisms/main/Tree/OrgTree/components/GseVisualAssistance/GseVisualAssistance.context';
import { queryClient } from '../../src/core/services/queryClient';
import {
  eligibleEnvironmentWorkspaces,
  environmentWorkspaceId,
  environmentGroups,
  nextOrgPanel,
  withoutOrgRiskPanel,
  canLinkEnvironmentAtWorkspace,
} from '../../src/components/organisms/main/Tree/OrgTree/org-panels.model';
import { explicitGhoSelectionTreeIds } from '../../src/components/organisms/main/Tree/OrgTree/utils/explicit-gho-selection-tree-ids.util';
import {
  useMutUpdateGho,
  updateGho,
} from '../../src/core/services/hooks/mutations/checklist/gho/useMutUpdateGho';
import { QueryEnum } from '../../src/core/enums/query.enums';
import {
  useMutUpsertCharacterization,
  updateCharacterization,
} from '../../src/core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { ModalEnum } from '../../src/core/enums/modal.enums';
import { HomoTypeEnum as H } from '../../src/core/enums/homo-type.enum';
import type { IGho } from '../../src/core/interfaces/api/IGho';
import type { IWorkspace } from '../../src/core/interfaces/api/ICompany';
import { readFileSync } from 'node:fs';

const workspace = (id = 'w', patch = {}) =>
  ({ id, companyId: 'c', name: id, status: 'ACTIVE', ...patch }) as IWorkspace;
const environment = (id = 'env', patch = {}) =>
  ({
    id,
    companyId: 'c',
    type: H.ENVIRONMENT,
    name: id,
    description: `${id}(//)GENERAL`,
    status: 'ACTIVE',
    workspaceIds: ['w'],
    hierarchies: [],
    ...patch,
  }) as unknown as IGho;
const state = (): any => ({
  hierarchy: { nodes: {}, workspaceId: 'w' },
  gho: {
    open: true,
    data: null,
    hierarchies: [],
    search: '',
    searchSelect: '',
  },
  riskAdd: { expand: false },
});
let fixture: any;
const reset = (
  workspaces = [workspace()],
  query: any = { companyId: 'c', tabWorkspaceId: 'w' },
) => {
  fixture = {
    company: { id: 'c', workspace: workspaces },
    groups: [environment()],
    state: state(),
    actions: [],
    requests: [],
    modals: [],
    navigations: [],
    assistance: {
      active: false,
      persistenceBusy: false,
      review: { newGroups: [], changes: [] },
    },
    response: { id: 'env', companyId: 'c', workspaceId: 'w' },
  };
  fixture.assistance.toggle = () => {
    fixture.assistance.active = !fixture.assistance.active;
  };
  fixture.router = {
    query,
    pathname: '/dashboard/empresas/[companyId]/hierarquia',
    asPath: '/dashboard/empresas/c/hierarquia',
    replace: (route: any) => {
      fixture.navigations.push(route);
      fixture.router.query = route.query;
      return Promise.resolve(true);
    },
    push: (route: any) => {
      fixture.navigations.push(route);
      return Promise.resolve(true);
    },
  };
  (globalThis as any).__panel = fixture;
  queryClient.clear();
  return fixture;
};
const render = (element: React.ReactElement) =>
  renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <GseVisualAssistanceContext.Provider value={fixture.assistance}>
            {element}
          </GseVisualAssistanceContext.Provider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
const find = (
  el: React.ReactNode,
  predicate: (props: any) => boolean,
): React.ReactElement<any> | undefined => {
  if (!React.isValidElement(el)) return;
  const e = el as React.ReactElement<any>;
  if (predicate(e.props)) return e;
  for (const c of React.Children.toArray(e.props.children)) {
    const result = find(c, predicate);
    if (result) return result;
  }
};
let captured: React.ReactNode;
const capture = (component: () => unknown) => {
  function Capture() {
    captured = component() as React.ReactNode;
    return <>{captured}</>;
  }
  return render(<Capture />);
};
let count = 0;
const test = (name: string, fn: () => void) => {
  reset();
  fn();
  count++;
  console.log('PASS', name);
};
const viewProps: any = {
  isDeleteLoading: false,
  selectedGhoId: null,
  filter: H.ENVIRONMENT,
  handleFilter: () => {},
  handleEditGHO: () => {},
  handleSelectGHO: () => {},
  handleDeleteGHO: () => {},
  environmentOnly: true,
  environmentWorkspaceId: 'w',
  environmentCompanyId: 'c',
};

test('GSE button directly opens assistance and clears conventional environment selection', () => {
  fixture.state.gho.data = environment();
  fixture.state.gho.selected = environment();
  fixture.state.gho.hierarchies = ['role//w'];
  capture(() => BottomButton({}));
  find(captured, (p) => p['aria-label'] === 'GSE')!.props.onClick();
  assert.equal(fixture.assistance.active, true);
  assert.equal(fixture.state.gho.open, false);
  assert.equal(fixture.state.gho.data, null);
  assert.equal(fixture.state.gho.selected, null);
  assert.deepEqual(fixture.state.gho.hierarchies, []);
});
test('Environment button closes assistance and opens conventional panel exclusively', () => {
  fixture.assistance.active = true;
  fixture.state.gho.open = false;
  capture(() => BottomButton({}));
  const button = find(captured, (p) => p['aria-label'] === 'Ambiente')!;
  button.props.onClick();
  assert.equal(fixture.assistance.active, false);
  assert.equal(fixture.state.gho.open, true);
  capture(() => BottomButton({}));
  find(captured, (p) => p['aria-label'] === 'Ambiente')!.props.onClick();
  assert.equal(fixture.state.gho.open, false);
});
test('both buttons remain available with empty environment list and while assistance is active', () => {
  fixture.groups = [];
  fixture.assistance.active = true;
  const html = capture(() => BottomButton({}));
  assert.ok(html.includes('aria-label="GSE"'));
  assert.ok(html.includes('aria-label="Ambiente"'));
  const source = readFileSync(
    'src/components/organisms/main/Tree/OrgTree/OrgTree.tsx',
    'utf8',
  );
  assert.match(source, /showGHO && [(]\s*<BottomButton/);
});
test('inventory opens exclusively and closes when switching to Environment', () => {
  let inventoryOpen = false;
  const onInventoryChange = (open: boolean) => { inventoryOpen = open; };
  fixture.assistance.active = true;
  capture(() => BottomButton({ inventoryOpen, onInventoryChange }));
  find(captured, (p) => p['aria-label'] === 'Importar Inventário / PGR')!.props.onClick();
  assert.equal(inventoryOpen, true);
  assert.equal(fixture.assistance.active, false);
  assert.equal(fixture.state.gho.open, false);

  capture(() => BottomButton({ inventoryOpen, onInventoryChange }));
  find(captured, (p) => p['aria-label'] === 'Ambiente')!.props.onClick();
  assert.equal(inventoryOpen, false);
  assert.equal(fixture.state.gho.open, true);
});
test('additive persistence blocks switching and closing without discarding assistance', () => {
  fixture.assistance.active = true;
  fixture.assistance.persistenceBusy = true;
  capture(() => BottomButton({}));
  const button = find(captured, (p) => p['aria-label'] === 'Ambiente')!;
  assert.equal(button.props['aria-disabled'], true);
  button.props.onClick();
  assert.equal(fixture.assistance.active, true);
  assert.equal(fixture.actions.length, 0);
  capture(() =>
    GhoToolTopButtons({
      handleSelectGHO: () => {
        throw Error('cleared during persistence');
      },
    }),
  );
  find(
    captured,
    (p) => p.size === 'small' && typeof p.onClick === 'function',
  )!.props.onClick();
  assert.equal(fixture.assistance.active, true);
});
test('conventional mutation also blocks switching', () => {
  const mutation = queryClient
    .getMutationCache()
    .build(queryClient, { mutationFn: async () => {} });
  mutation.setState({ ...mutation.state, status: 'loading' });
  capture(() => BottomButton({}));
  find(captured, (p) => p['aria-label'] === 'GSE')!.props.onClick();
  assert.equal(fixture.assistance.active, false);
  assert.equal(fixture.actions.length, 0);
  queryClient.clear();
});
test('closing conventional panel preserves every URL parameter', () => {
  fixture.router.query = {
    companyId: 'c',
    tabWorkspaceId: 'w',
    tabWorkspaceIds: undefined,
    custom: 'keep',
  };
  const before = JSON.stringify(fixture.router.query);
  capture(() =>
    GhoToolTopButtons({
      environmentOnly: true,
      handleSelectGHO: () => undefined,
    }),
  );
  find(
    captured,
    (p) => p.size === 'small' && typeof p.onClick === 'function',
  )!.props.onClick();
  assert.equal(fixture.state.gho.open, false);
  assert.equal(JSON.stringify(fixture.router.query), before);
  assert.equal(fixture.navigations.length, 0);
});
test('switching away from risks removes only its panel parameter', () => {
  fixture.state.gho.open = false;
  fixture.router.query.riskGroupId = 'risk';
  fixture.router.query.custom = 'keep';
  capture(() => BottomButton({}));
  find(captured, (p) => p['aria-label'] === 'Ambiente')!.props.onClick();
  assert.deepEqual(fixture.navigations[0].query, {
    companyId: 'c',
    tabWorkspaceId: 'w',
    custom: 'keep',
  });
});
test('workspace resolver prioritizes explicit header scope and handles sole eligible workspace', () => {
  const eligible = eligibleEnvironmentWorkspaces(
    [
      workspace(),
      workspace('inactive', { status: 'INACTIVE' }),
      workspace('foreign', { companyId: 'other' }),
    ],
    'c',
  );
  assert.deepEqual(
    eligible.map((w) => w.id),
    ['w'],
  );
  assert.equal(environmentWorkspaceId({}, eligible), 'w');
  assert.equal(
    environmentWorkspaceId({ tabWorkspaceId: 'w' }, [
      workspace(),
      workspace('second'),
    ]),
    'w',
  );
  assert.equal(
    environmentWorkspaceId({ tabWorkspaceId: 'foreign' }, eligible),
    undefined,
  );
});
test('multiple workspaces without unambiguous selection require a choice', () => {
  const ws = [workspace(), workspace('second')];
  assert.equal(environmentWorkspaceId({}, ws), undefined);
  assert.equal(
    environmentWorkspaceId({ tabWorkspaceIds: 'w,second' }, ws),
    undefined,
  );
  reset(ws, { companyId: 'c' });
  const html = render(<GhoTool environmentOnly />);
  assert.ok(html.includes('Selecione um estabelecimento'));
  assert.ok(!html.includes('Adicionar Ambiente'));
});
test('workspace choice updates canonical header query and clears stale selection', () => {
  reset([workspace(), workspace('second')], {
    companyId: 'c',
    tabWorkspaceIds: 'w,second',
    custom: 'keep',
  });
  fixture.state.gho.data = environment();
  capture(() => GhoTool({ environmentOnly: true }));
  find(captured, (p) => p.label === 'Estabelecimento')!.props.onChange({
    target: { value: 'second' },
  });
  assert.deepEqual(fixture.navigations[0].query, {
    companyId: 'c',
    tabWorkspaceId: 'second',
    custom: 'keep',
  });
  assert.equal(fixture.state.gho.data, null);
});
test('first environment registration reuses characterization modal with explicit workspace', () => {
  fixture.groups = [];
  capture(() => GhoTool({ environmentOnly: true }));
  const header = find(
    captured,
    (p) =>
      typeof p.handleAddCharacterization === 'function' &&
      p.filter === H.ENVIRONMENT,
  )!;
  header.props.handleAddCharacterization();
  assert.equal(fixture.modals[0][0], ModalEnum.CHARACTERIZATION_ADD);
  assert.equal(fixture.modals[0][1].workspaceId, 'w');
  assert.equal(fixture.modals[0][1].companyId, 'c');
  assert.equal(fixture.modals[0][1].characterizationType, 'environment');
});
test('conventional list is environment-only even with an incompatible group selected', () => {
  fixture.groups = [
    environment(),
    environment('foreign', { companyId: 'other' }),
    environment('other-workspace', { workspaceIds: ['other'] }),
    environment('gse', { type: null }),
    environment('INTERNAL_GROUP_SENTINEL', { type: 'HIERARCHY' }),
  ];
  fixture.state.gho.data = fixture.groups[3];
  const html = render(<GhoToolView {...viewProps} />);
  assert.ok(html.includes('env'));
  assert.ok(!html.includes('other-workspace'));
  assert.ok(!html.includes('foreign'));
  assert.ok(!html.includes('INTERNAL_GROUP_SENTINEL'));
  assert.equal(environmentGroups(fixture.groups, 'c', 'w').length, 1);
});
test('environment edit opens characterization detail, never GSE modal', () => {
  capture(() => GhoTool({ environmentOnly: true }));
  const view = find(
    captured,
    (p) =>
      p.environmentOnly === true &&
      typeof p.handleEditGHO === 'function' &&
      p.environmentCompanyId === 'c',
  )!;
  view.props.handleEditGHO(environment());
  assert.equal(fixture.modals[0][0], ModalEnum.CHARACTERIZATION_ADD);
  assert.equal(fixture.modals[0][1].id, 'env');
  assert.equal(fixture.modals[0][1].workspaceId, 'w');
  view.props.handleEditGHO(environment('gse', { type: null }));
  assert.equal(fixture.modals.length, 1);
});
test('environment linking preserves explicit server links and refuses cross-workspace actions', () => {
  const g = environment('env', {
    workspaceIds: ['w', 'second'],
    hierarchies: [
      { id: 'a', workspaceId: 'w' },
      { id: 'b', workspaceId: 'second' },
    ],
  });
  assert.deepEqual(explicitGhoSelectionTreeIds(g), ['a//w', 'b//second']);
  assert.equal(
    canLinkEnvironmentAtWorkspace(g, 'c', { tabWorkspaceId: 'w' }, 'new//w'),
    true,
  );
  assert.equal(
    canLinkEnvironmentAtWorkspace(
      g,
      'c',
      { tabWorkspaceId: 'w' },
      'new//second',
    ),
    false,
  );
  assert.equal(
    canLinkEnvironmentAtWorkspace(
      g,
      'other',
      { tabWorkspaceId: 'w' },
      'new//w',
    ),
    false,
  );
});
test('transition and URL helpers never mutate context', () => {
  assert.equal(nextOrgPanel('GSE', 'ENVIRONMENT', true), 'GSE');
  assert.equal(nextOrgPanel('GSE', 'ENVIRONMENT', false), 'ENVIRONMENT');
  assert.equal(nextOrgPanel('ENVIRONMENT', 'ENVIRONMENT', false), null);
  const query = { tabWorkspaceId: 'w', riskGroupId: 'r', custom: 'x' };
  assert.deepEqual(withoutOrgRiskPanel(query), {
    tabWorkspaceId: 'w',
    custom: 'x',
  });
  assert.equal(query.riskGroupId, 'r');
});
(async () => {
  reset();
  await updateGho(
    {
      id: 'env',
      hierarchies: [
        { id: 'a', workspaceId: 'w' },
        { id: 'b', workspaceId: 'second' },
      ],
    },
    'c',
  );
  assert.equal(fixture.requests[0].method, 'PATCH');
  assert.equal(fixture.requests[0].body.hierarchies.length, 2);
  count++;
  console.log(
    'PASS actual conventional link transport preserves workspace-qualified associations',
  );
  await updateCharacterization(
    { name: 'Ambiente de teste', hierarchyIds: ['a'] },
    'c',
    'w',
  );
  assert.ok(fixture.requests[1].path.includes('/workspace/w/'));
  assert.equal(fixture.requests[1].body.get('name'), 'Ambiente de teste');
  count++;
  console.log(
    'PASS actual characterization transport retains conventional workspace endpoint',
  );
  queryClient.setQueryData([QueryEnum.GHO, 'c'], []);
  let upsert: ReturnType<typeof useMutUpsertCharacterization>;
  function CaptureUpsert() {
    upsert = useMutUpsertCharacterization();
    return null;
  }
  render(<CaptureUpsert />);
  await upsert!.mutateAsync({ name: 'Ambiente novo', workspaceId: 'w' });
  assert.equal(
    queryClient.getQueryState([QueryEnum.GHO, 'c'])?.isInvalidated,
    true,
  );
  assert.ok(fixture.invalidations.length > 0);
  count++;
  console.log(
    'PASS actual characterization success invalidates conventional and characterization query families',
  );
  queryClient.setQueryData([QueryEnum.GHO, 'c'], []);
  let linkMutation: ReturnType<typeof useMutUpdateGho>;
  function CaptureLinkMutation() {
    linkMutation = useMutUpdateGho();
    return null;
  }
  render(<CaptureLinkMutation />);
  await linkMutation!.mutateAsync({
    id: 'env',
    hierarchies: [{ id: 'a', workspaceId: 'w' }],
  });
  assert.equal(queryClient.getQueryState([QueryEnum.GHO, 'c']), undefined);
  count++;
  console.log(
    'PASS actual link mutation invalidates the existing GHO query family',
  );
  console.log(`${count} panel tests passed.`);
  queryClient.clear();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
