import {
  buildSynchronizationPlan,
  runSynchronization,
} from './exam-risk-sync.util';
import { inlineParameterFields } from './exam-risk-inline-parameter.util';
jest.mock(
  'core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk',
  () => ({ queryExams: jest.fn() }),
);
const target = {
  isAdmission: true,
  isPeriodic: true,
  isChange: false,
  isReturn: false,
  isDismissal: true,
  validityInMonths: 12,
  isMale: true,
  isFemale: false,
  fromAge: 20,
  toAge: 60,
  considerBetweenDays: 90,
  minRiskDegree: 4,
  minRiskDegreeQuantity: 4,
};
const source = {
  ...target,
  isAdmission: false,
  isChange: true,
  validityInMonths: 24,
  isFemale: true,
  fromAge: null,
  toAge: null,
  considerBetweenDays: 0,
  minRiskDegree: 3,
  minRiskDegreeQuantity: 2,
};
const scope = { companyId: 'company', riskId: 'risk', riskName: 'Ruído' };
const link = {
  ...target,
  id: 283,
  examId: 12,
  riskId: 'risk',
  companyId: 'company',
  risk: { quantitativeLimitApplicable: true },
} as any;
it('serializa os sete grupos da Biblioteca preservando null, false e zero', async () => {
  const plans = await buildSynchronizationPlan(
    Object.keys(inlineParameterFields) as any,
    source,
    target,
  );
  const patch = Object.assign({}, ...plans.map((plan) => plan.patch));
  expect(patch).toEqual(source);
  expect(plans).toHaveLength(7);
});
it('envia somente grupos selecionados ao vínculo correto, sem publicar regra', async () => {
  const plans = await buildSynchronizationPlan(
    ['age', 'considerBetweenDays', 'minRiskDegree'],
    source,
    target,
    scope,
    link,
  );
  expect(Object.assign({}, ...plans.map((plan) => plan.patch))).toEqual({
    id: 283,
    examId: 12,
    riskId: 'risk',
    companyId: 'company',
    realCompanyId: 'company',
    publishAsSystemRule: false,
    fromAge: null,
    toAge: null,
    considerBetweenDays: 0,
    minRiskDegree: 3,
  });
});
it('bloqueia herdado e quantitativo não aplicável', async () => {
  await expect(
    buildSynchronizationPlan(['age'], source, target, scope, {
      ...link,
      companyId: 'consultoria',
    }),
  ).rejects.toThrow();
  await expect(
    buildSynchronizationPlan(['minRiskDegreeQuantity'], source, target, scope, {
      ...link,
      risk: { quantitativeLimitApplicable: false },
    }),
  ).rejects.toThrow();
});
it('valida periodicidade antes de qualquer gravação', async () => {
  await expect(
    buildSynchronizationPlan(
      ['validityInMonths'],
      { ...source, validityInMonths: 0 },
      target,
      scope,
      link,
    ),
  ).rejects.toThrow();
});
it('mantém vínculos independentes', async () => {
  const plans = await buildSynchronizationPlan(['sex'], source, target, scope, {
    ...link,
    id: 284,
  });
  expect(plans[0].patch.id).toBe(284);
});
it('interrompe na primeira falha e informa progresso parcial', async () => {
  const save = jest.fn(async (step: number) => {
    if (step === 2) throw new Error('409');
  });
  const result = await runSynchronization([1, 2, 3], save);
  expect(result.completed).toBe(1);
  expect(result.error).toBeInstanceOf(Error);
  expect(save).toHaveBeenCalledTimes(2);
});
it('executa em sequência e informa sucesso apenas após todas as gravações', async () => {
  const order: number[] = [];
  expect(
    await runSynchronization([1, 2, 3], async (step) => {
      order.push(step);
    }),
  ).toEqual({ completed: 3 });
  expect(order).toEqual([1, 2, 3]);
});
it('Eventos inclui periodicidade somente quando necessária para ativar Periódico', async () => {
  const plans = await buildSynchronizationPlan(
    ['events'],
    source,
    { ...target, isPeriodic: false, validityInMonths: null },
    scope,
    { ...link, isPeriodic: false, validityInMonths: null },
  );
  expect(plans[0].patch.validityInMonths).toBe(24);
  expect(plans[0].patch.isPeriodic).toBe(true);
  expect(plans[0].patch).not.toHaveProperty('minRiskDegree');
});

describe('null comparisons and synchronization keep storage validations', () => {
  const libraryPlan = (value: number | null) =>
    buildSynchronizationPlan(
      ['considerBetweenDays'],
      { ...source, considerBetweenDays: value },
      target,
    );
  const companyPlan = (value: number | null) =>
    buildSynchronizationPlan(
      ['considerBetweenDays'],
      { ...source, considerBetweenDays: value },
      target,
      scope,
      link,
    );
  it.each([90, null, 0])(
    'copies interval %s in both directions without coercion',
    async (value) => {
      expect((await libraryPlan(value))[0].patch.considerBetweenDays).toBe(
        value,
      );
      expect((await companyPlan(value))[0].patch.considerBetweenDays).toBe(
        value,
      );
    },
  );
  it('retains different write rules for absent matrix criteria', async () => {
    expect(
      (
        await buildSynchronizationPlan(
          ['minRiskDegree'],
          { ...source, minRiskDegree: null },
          target,
        )
      )[0].patch.minRiskDegree,
    ).toBeNull();
    await expect(
      buildSynchronizationPlan(
        ['minRiskDegree'],
        { ...source, minRiskDegree: null },
        target,
        scope,
        link,
      ),
    ).rejects.toThrow('não é permitido gravar ausência');
    await expect(
      buildSynchronizationPlan(
        ['minRiskDegreeQuantity'],
        { ...source, minRiskDegreeQuantity: null },
        target,
        scope,
        link,
      ),
    ).rejects.toThrow();
  });
  it('does not clear periodicity on periodic company exams', async () => {
    await expect(
      buildSynchronizationPlan(
        ['validityInMonths'],
        { ...source, validityInMonths: null },
        target,
        scope,
        link,
      ),
    ).rejects.toThrow('periodicidade');
    expect(
      (
        await buildSynchronizationPlan(
          ['validityInMonths'],
          { ...source, validityInMonths: null },
          target,
        )
      )[0].patch.validityInMonths,
    ).toBeNull();
  });
  it('does not convert incompatible null booleans to false on copy', async () => {
    await expect(
      buildSynchronizationPlan(
        ['sex'],
        { ...source, isMale: null } as any,
        target,
      ),
    ).rejects.toThrow('incompatível');
    await expect(
      buildSynchronizationPlan(
        ['events'],
        { ...source, isReturn: null } as any,
        target,
        scope,
        link,
      ),
    ).rejects.toThrow('incompatível');
  });
});

it('validates the final event/periodicity combination before the single company PATCH', async () => {
  const plans = await buildSynchronizationPlan(
    ['events', 'validityInMonths'],
    { ...source, isPeriodic: false, validityInMonths: null },
    target,
    scope,
    link,
  );
  const patch = Object.assign({}, ...plans.map((plan) => plan.patch));
  expect(patch).toMatchObject({ isPeriodic: false, validityInMonths: null });
  await expect(
    buildSynchronizationPlan(
      ['events', 'validityInMonths'],
      { ...source, isPeriodic: true, validityInMonths: null },
      target,
      scope,
      link,
    ),
  ).rejects.toThrow('periodicidade');
});
