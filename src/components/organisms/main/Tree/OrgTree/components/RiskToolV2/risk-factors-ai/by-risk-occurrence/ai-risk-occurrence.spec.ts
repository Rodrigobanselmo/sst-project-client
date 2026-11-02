import assert from 'node:assert/strict';
import {
  AI_RISK_OCCURRENCE_HIERARCHY_TYPES,
  AiRiskOccurrenceIdentity,
  aiRiskOccurrenceContextKey,
  aiRiskOccurrenceRecordKey,
  createAiRiskOccurrenceIdentity,
} from './ai-risk-occurrence.identity';
import { evaluateAiRiskOccurrence } from './ai-risk-occurrence-eligibility.util';
import {
  RiskByOccurrenceAiSession,
  RiskOccurrenceAiPendingState,
} from './risk-by-occurrence-ai-session.util';

const id: AiRiskOccurrenceIdentity = {
  companyId: 'company',
  workspaceId: 'ws-a',
  riskGroupId: 'group',
  riskId: 'risk',
  riskFactorDataId: 'rfd',
  ownerType: 'GSE',
  ownerId: 'owner',
};
const row = {
  id: 'rfd',
  companyId: 'company',
  riskId: 'risk',
  riskFactorGroupDataId: 'group',
  homogeneousGroupId: 'owner',
};
const owner = {
  id: 'owner',
  companyId: 'company',
  status: 'ACTIVE',
  type: null,
  workspaceIds: ['ws-a', 'ws-b'],
};
const params = {
  identity: id,
  row,
  owner,
  siblings: [row],
  authorizedCompanyId: 'company',
  canEdit: true,
};
const otherWs = { ...id, workspaceId: 'ws-b' };
const pending: RiskOccurrenceAiPendingState = {
  existingRiskReviews: [
    {
      riskId: 'risk',
      riskFactorDataId: 'rfd',
      name: 'Ruído',
      suggestions: [
        {
          field: 'probability',
          suggestedValues: 4,
          currentValues: 2,
          applyMode: 'replace-scalar',
        },
      ],
    },
  ],
  appliedModularSuggestionKeys: [],
  dismissedModularSuggestionKeys: ['discarded'],
  userGuidance: 'Orientação A',
};
async function main() {
  assert.equal(
    aiRiskOccurrenceContextKey(id),
    '["risk-by-occurrence-ai",1,"company","ws-a","group","risk","rfd","GSE","owner",null,null]',
  );
  assert.equal(
    aiRiskOccurrenceContextKey(
      createAiRiskOccurrenceIdentity(JSON.parse(JSON.stringify(id))),
    ),
    aiRiskOccurrenceContextKey(id),
  );
  assert.ok(Object.isFrozen(createAiRiskOccurrenceIdentity(id)));
  assert.equal(
    aiRiskOccurrenceRecordKey(id),
    aiRiskOccurrenceRecordKey(otherWs),
  );
  for (const patch of [
    { companyId: 'other-company' },
    { workspaceId: 'ws-b' },
    { riskGroupId: 'other-group' },
    { riskId: 'other-risk' },
    { riskFactorDataId: 'replacement' },
    { ownerId: 'other-owner' },
    { ownerType: 'CHARACTERIZATION' as const },
  ]) {
    assert.notEqual(
      aiRiskOccurrenceContextKey(id),
      aiRiskOccurrenceContextKey(
        createAiRiskOccurrenceIdentity({ ...id, ...patch }),
      ),
    );
  }
  for (const patch of [
    { riskFactorDataId: '' },
    { workspaceId: '' },
    { ownerId: 'node//workspace' },
    { hierarchyId: 'other' },
    { ownerType: 'EMPLOYEE' },
  ])
    assert.throws(() => createAiRiskOccurrenceIdentity({ ...id, ...patch }));
  assert.equal(evaluateAiRiskOccurrence(params).eligible, true);
  assert.equal(
    evaluateAiRiskOccurrence({ ...params, identity: otherWs }).eligible,
    true,
  );
  const cases: Array<[any, string]> = [
    [{ identity: { ...id, riskFactorDataId: '' } }, 'INVALID_IDENTITY'],
    [{ authorizedCompanyId: 'foreign' }, 'COMPANY_NOT_AUTHORIZED'],
    [{ canEdit: false }, 'EDIT_NOT_AUTHORIZED'],
    [{ row: { ...row, canEditOnThisEntity: false } }, 'EDIT_NOT_AUTHORIZED'],
    [{ row: { ...row, id: 'historical-id' } }, 'IDENTITY_MISMATCH'],
    [{ row: { ...row, companyId: 'foreign' } }, 'IDENTITY_MISMATCH'],
    [{ row: { ...row, isDirect: false } }, 'INHERITED_OCCURRENCE'],
    [{ row: { ...row, homogeneousGroupId: 'parent' } }, 'INHERITED_OCCURRENCE'],
    [{ row: { ...row, originId: 'parent' } }, 'INHERITED_OCCURRENCE'],
    [{ row: { ...row, originKind: 'HIERARCHY' } }, 'INHERITED_OCCURRENCE'],
    [{ row: { ...row, hierarchyId: 'parent' } }, 'INHERITED_OCCURRENCE'],
    [{ row: { ...row, endDate: '2020-01-01' } }, 'HISTORICAL_OCCURRENCE'],
    [{ row: { ...row, deletedAt: new Date() } }, 'HISTORICAL_OCCURRENCE'],
    [{ row: { ...row, startDate: '2999-01-01' } }, 'FUTURE_OCCURRENCE'],
    [{ owner: { ...owner, status: 'INACTIVE' } }, 'OWNER_UNAVAILABLE'],
    [{ owner: { ...owner, companyId: 'other' } }, 'OWNER_UNAVAILABLE'],
    [{ owner: { ...owner, type: 'HIERARCHY' } }, 'OWNER_TYPE_MISMATCH'],
    [{ owner: { ...owner, workspaceIds: [] } }, 'WORKSPACE_NOT_LINKED'],
    [{ row: { ...row, workspaceId: 'foreign-ws' } }, 'WORKSPACE_NOT_LINKED'],
    [{ siblings: [row, { ...row, id: 'duplicate' }] }, 'AMBIGUOUS_OCCURRENCE'],
    [{ siblings: [{ ...row, id: 'replacement' }] }, 'AMBIGUOUS_OCCURRENCE'],
  ];
  cases.push([
    { row: { ...row, resolutionSource: 'HIERARCHY_IS_ON_EVERY' } },
    'UNVERIFIED_ORIGIN',
  ]);
  for (const [patch, reason] of cases)
    assert.deepEqual(evaluateAiRiskOccurrence({ ...params, ...patch }), {
      eligible: false,
      reason,
    });
  assert.equal(
    evaluateAiRiskOccurrence({
      ...params,
      siblings: [
        row,
        { ...row, id: 'old', endDate: '2020-01-01' },
        { ...row, id: 'other-level', homogeneousGroupId: 'other' },
      ],
    }).eligible,
    true,
  );
  for (const type of AI_RISK_OCCURRENCE_HIERARCHY_TYPES) {
    const hierarchyId = createAiRiskOccurrenceIdentity({
      ...id,
      ownerType: 'HIERARCHY',
      hierarchyId: 'owner',
      hierarchyType: type,
    });
    assert.equal(
      evaluateAiRiskOccurrence({
        ...params,
        identity: hierarchyId,
        owner: { ...owner, type: 'HIERARCHY', hierarchy: { ...owner, type } },
      }).eligible,
      true,
    );
  }
  for (const type of [
    'ENVIRONMENT',
    'ACTIVITIES',
    'EQUIPMENT',
    'WORKSTATION',
  ]) {
    assert.equal(
      evaluateAiRiskOccurrence({
        ...params,
        identity: { ...id, ownerType: 'CHARACTERIZATION' },
        owner: {
          ...owner,
          type,
          characterization: {
            id: 'owner',
            companyId: 'company',
            workspaceId: 'ws-a',
            type: type === 'ENVIRONMENT' ? 'OPERATION' : type,
          },
        },
      }).eligible,
      true,
    );
  }
  for (const type of ['GENERAL', 'SUPPORT', 'OPERATION', 'ADMINISTRATIVE']) {
    const environment = { ...owner, type: 'ENVIRONMENT', characterization: { id: 'owner', companyId: 'company', workspaceId: 'ws-a', type } };
    assert.equal(evaluateAiRiskOccurrence({ ...params, identity: { ...id, ownerType: 'CHARACTERIZATION' }, owner: environment }).eligible, true);
    for (const patch of [{ id: 'foreign' }, { companyId: 'foreign' }, { workspaceId: 'foreign' }, { type: 'WORKSTATION' }]) {
      assert.equal(evaluateAiRiskOccurrence({ ...params, identity: { ...id, ownerType: 'CHARACTERIZATION' }, owner: { ...environment, characterization: { ...environment.characterization, ...patch } } }).eligible, false);
    }
    assert.equal(evaluateAiRiskOccurrence({ ...params, identity: { ...id, ownerType: 'CHARACTERIZATION' }, owner: { ...environment, type: 'ACTIVITIES' } }).eligible, false);
  }
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
  const session = new RiskByOccurrenceAiSession(storage);
  session.savePending(id, {
    ...pending,
    existingRiskReviews: [
      ...pending.existingRiskReviews,
      { ...pending.existingRiskReviews[0], riskFactorDataId: 'other' },
    ],
  });
  assert.deepEqual(session.readPending(id), pending);
  for (const patch of [
    { companyId: 'other' },
    { workspaceId: 'ws-b' },
    { ownerId: 'other' },
    { riskFactorDataId: 'other' },
  ])
    assert.equal(session.readPending({ ...id, ...patch }), null);
  session.savePending(otherWs, { ...pending, userGuidance: 'Orientação B' });
  assert.equal(session.readPending(id)?.userGuidance, 'Orientação A');
  assert.equal(
    new RiskByOccurrenceAiSession(storage).readPending(otherWs)?.userGuidance,
    'Orientação B',
  );
  for (const next of [
    otherWs,
    { ...id, companyId: 'other' },
    { ...id, riskId: 'other' },
    { ...id, ownerId: 'other' },
    { ...id, riskFactorDataId: 'replacement' },
  ]) {
    session.activate(id);
    const operation = session.startOperation();
    let resolve!: (value: string) => void,
      applied = 0;
    const result = session.run(
      operation,
      () =>
        new Promise<string>((done) => {
          resolve = done;
        }),
      () => applied++,
    );
    await Promise.resolve();
    session.activate(next);
    assert.ok(operation.signal.aborted);
    resolve('late');
    assert.equal(await result, 'cancelled');
    assert.equal(applied, 0);
    assert.equal(session.saveOperationPending(operation, pending), false);
    assert.deepEqual(session.readPending(id), pending);
  }
  session.activate(id);
  const first = session.startOperation();
  const second = session.startOperation();
  assert.ok(first.signal.aborted);
  assert.equal(session.saveOperationPending(second, pending), true);
  assert.equal(
    await session.run(
      second,
      async () => 'ok',
      () => {},
    ),
    'applied',
  );
  assert.equal(
    await session.run(
      second,
      async () => {
        throw Error('token reused');
      },
      () => {},
    ),
    'cancelled',
  );
  const cancelledBeforeDispatch = session.startOperation();
  let dispatches = 0;
  const notDispatched = session.run(
    cancelledBeforeDispatch,
    async () => {
      dispatches++;
      return 'bad';
    },
    () => {},
  );
  session.cancelOperation();
  assert.equal(await notDispatched, 'cancelled');
  assert.equal(dispatches, 0);
  assert.deepEqual(session.readPending(id), pending);
  const sameContext = session.startOperation();
  session.activate({ ...id });
  assert.equal(sameContext.signal.aborted, false);
  const lease = session.captureAcceptance(id, {
    riskId: 'risk',
    riskFactorDataId: 'rfd',
  })!;
  assert.ok(lease);
  assert.equal(
    session.captureAcceptance(id, {
      riskId: 'risk',
      riskFactorDataId: 'other',
    }),
    null,
  );
  assert.equal(
    session.captureAcceptance(otherWs, {
      riskId: 'risk',
      riskFactorDataId: 'rfd',
    }),
    null,
  );
  assert.equal(
    await session.canAccept(lease, async () => ({
      eligible: true as const,
      identity: id,
    })),
    true,
  );
  assert.equal(
    await session.canAccept(lease, async () => ({ eligible: false as const })),
    false,
  );
  assert.equal(
    await session.canAccept(lease, async () => {
      session.activate(otherWs);
      session.activate(id);
      return { eligible: true as const, identity: id };
    }),
    false,
  );
  const freshLease = session.captureAcceptance(id, {
    riskId: 'risk',
    riskFactorDataId: 'rfd',
  })!;
  assert.equal(
    await session.canAccept(freshLease, async () => ({
      eligible: true,
      identity: otherWs,
    })),
    false,
  );
  const foreign = new RiskByOccurrenceAiSession(storage);
  foreign.activate(id);
  assert.equal(
    await foreign.run(
      second,
      async () => 'bad',
      () => {
        throw new Error('foreign apply');
      },
    ),
    'cancelled',
  );
  assert.equal(
    await foreign.canAccept(lease, async () => ({
      eligible: true as const,
      identity: id,
    })),
    false,
  );
  const operation = session.startOperation();
  session.dispose();
  assert.ok(operation.signal.aborted);
  assert.deepEqual(
    new RiskByOccurrenceAiSession(storage).readPending(id),
    pending,
  );
  const corrupt = new RiskByOccurrenceAiSession({
    getItem: () => '{bad json',
    setItem: () => {},
  });
  assert.equal(corrupt.readPending(id), null);
  const blockedStorage = new RiskByOccurrenceAiSession({
    getItem: () => {
      throw Error();
    },
    setItem: () => {
      throw Error();
    },
  });
  blockedStorage.savePending(id, pending);
  assert.deepEqual(blockedStorage.readPending(id), pending);
  console.log(
    `Identidade, elegibilidade (${cases.length} bloqueios), 6 níveis, 4 elementos, sessões, cancelamento, pendências e aceitação: OK`,
  );
}
void main();
