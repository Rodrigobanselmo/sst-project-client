import {
  hasComparableParameterInformation,
  inlineParameterFields,
  inlineParameterCopyDraft,
} from './exam-risk-inline-parameter.util';
jest.mock(
  'core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk',
  () => ({ queryExams: jest.fn() }),
);
const config = {
  isAdmission: false,
  isPeriodic: false,
  isChange: false,
  isReturn: false,
  isDismissal: false,
  isMale: false,
  isFemale: false,
  fromAge: null,
  toAge: null,
  validityInMonths: null,
  considerBetweenDays: null,
  minRiskDegree: null,
  minRiskDegreeQuantity: null,
};
it.each(Object.keys(inlineParameterFields))(
  'group %s: explicit null/all-false remains available',
  (group) => {
    const keys = inlineParameterFields[group];
    expect(hasComparableParameterInformation(config, keys)).toBe(true);
    expect(
      hasComparableParameterInformation(
        { ...config, [keys[0]]: undefined },
        keys,
      ),
    ).toBe(false);
  },
);
it.each([
  [90, null, true],
  [null, 90, true],
  [null, null, false],
  [0, null, true],
])(
  'interval %s x %s remains available, with raw equality',
  (left, right, different) => {
    expect(
      hasComparableParameterInformation(
        { ...config, considerBetweenDays: left },
        ['considerBetweenDays'],
      ),
    ).toBe(true);
    expect(
      hasComparableParameterInformation(
        { ...config, considerBetweenDays: right },
        ['considerBetweenDays'],
      ),
    ).toBe(true);
    expect(left !== right).toBe(different);
  },
);
it('rejects null boolean, numeric boolean, omitted fields and missing configs', () => {
  expect(
    hasComparableParameterInformation({ ...config, isMale: null }, [
      'isMale',
      'isFemale',
    ]),
  ).toBe(false);
  expect(
    hasComparableParameterInformation(
      { ...config, considerBetweenDays: false },
      ['considerBetweenDays'],
    ),
  ).toBe(false);
  expect(hasComparableParameterInformation(null, ['fromAge', 'toAge'])).toBe(
    false,
  );
  expect(
    hasComparableParameterInformation({ ...config, minRiskDegree: 6 }, [
      'minRiskDegree',
    ]),
  ).toBe(false);
});
it('keeps Todas and false values unchanged when serialized for individual copy', () => {
  expect(inlineParameterCopyDraft('age', config, config)).toEqual({
    fromAge: '',
    toAge: '',
  });
  expect(inlineParameterCopyDraft('sex', config, config)).toEqual({
    isMale: false,
    isFemale: false,
  });
});
