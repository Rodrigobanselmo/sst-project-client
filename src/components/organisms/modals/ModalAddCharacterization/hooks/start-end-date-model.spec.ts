import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createStartEndDateDraft,
  resolveStartEndDates,
  validateStartEndDates,
  type StartEndDateDraft,
} from './start-end-date-model.ts';

const changed = (startDate = '', endDate = ''): StartEndDateDraft => ({
  ...createStartEndDateDraft(),
  startDate,
  endDate,
  startDateChanged: true,
  endDateChanged: true,
});

test('undated workflows preserve undefined without inventing dates or null updates', () => {
  const draft = createStartEndDateDraft();
  assert.deepEqual(validateStartEndDates(draft), {});
  assert.deepEqual(resolveStartEndDates(draft), {
    startDate: undefined,
    endDate: undefined,
  });
});

test('explicit nulls and open periods preserve their existing callback shape and Date identity', () => {
  for (const original of [
    { startDate: null, endDate: null },
    { startDate: new Date('2026-04-01T00:00:00Z'), endDate: null },
    { startDate: undefined, endDate: new Date('2026-06-01T00:00:00Z') },
  ]) {
    const draft = createStartEndDateDraft(original);
    assert.deepEqual(validateStartEndDates(draft), {});
    const result = resolveStartEndDates(draft, original);
    assert.deepEqual(result, original);
    assert.equal(result.startDate, original.startDate);
    assert.equal(result.endDate, original.endDate);
  }
});

test('stored days and callback JSON round-trip in Tokyo, New York and São Paulo without shifting the civil selection', () => {
  const previous = process.env.TZ;
  try {
    for (const timezone of [
      'Asia/Tokyo',
      'America/New_York',
      'America/Sao_Paulo',
    ]) {
      process.env.TZ = timezone;
      const original = {
        startDate: new Date('2026-04-01T00:00:00Z'),
        endDate: null,
      };
      const before = original.startDate.getTime();
      const loaded = createStartEndDateDraft(original);
      assert.equal(loaded.startDate, '2026-04-01');
      assert.equal(
        resolveStartEndDates(loaded, original).startDate,
        original.startDate,
      );
      const dates = resolveStartEndDates(
        changed('2026-06-01', '2026-07-01'),
        original,
      );
      assert.ok(dates.startDate instanceof Date);
      assert.ok(dates.endDate instanceof Date);
      const transported = JSON.parse(JSON.stringify(dates));
      assert.equal(transported.startDate, '2026-06-01T00:00:00.000Z');
      assert.equal(transported.endDate, '2026-07-01T00:00:00.000Z');
      assert.deepEqual(
        createStartEndDateDraft({
          startDate: new Date(transported.startDate),
          endDate: new Date(transported.endDate),
        }),
        {
          ...createStartEndDateDraft(),
          startDate: '2026-06-01',
          endDate: '2026-07-01',
        },
      );
      assert.equal(original.startDate.getTime(), before);
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('an unchanged stored time is preserved when the same civil day is selected again', () => {
  const original = {
    startDate: new Date('2026-04-01T15:23:45Z'),
    endDate: null,
  };
  const draft = {
    ...createStartEndDateDraft(original),
    startDateChanged: true,
  };
  assert.equal(
    resolveStartEndDates(draft, original).startDate,
    original.startDate,
  );
  assert.equal(original.startDate.toISOString(), '2026-04-01T15:23:45.000Z');
});

test('clearing a stored boundary sends null and preserves the other original date', () => {
  const original = {
    startDate: new Date('2026-04-01T00:00:00Z'),
    endDate: new Date('2026-06-01T00:00:00Z'),
  };
  const draft = {
    ...createStartEndDateDraft(original),
    endDate: '',
    endDateChanged: true,
  };
  const result = resolveStartEndDates(draft, original);
  assert.equal(result.startDate, original.startDate);
  assert.equal(result.endDate, null);
});

test('new start-only and end-only periods keep their other boundary optional', () => {
  for (const draft of [changed('2026-04-01'), changed('', '2026-04-01')]) {
    assert.deepEqual(validateStartEndDates(draft), {});
    const result = resolveStartEndDates(draft);
    assert.equal(result.startDate === undefined, !draft.startDate);
    assert.equal(result.endDate === undefined, !draft.endDate);
  }
});

test('exclusive end rejects equal boundaries and reversed periods', () => {
  for (const draft of [
    changed('2026-04-01', '2026-04-01'),
    changed('2026-06-01', '2026-04-01'),
  ]) {
    assert.match(validateStartEndDates(draft).order || '', /posterior/);
    assert.throws(() => resolveStartEndDates(draft), RangeError);
  }
});

test('exclusive end preserves the chosen boundary without subtracting or adding a day', () => {
  const result = resolveStartEndDates(changed('2026-03-31', '2026-04-01'));
  assert.equal(result.startDate?.toISOString(), '2026-03-31T00:00:00.000Z');
  assert.equal(result.endDate?.toISOString(), '2026-04-01T00:00:00.000Z');
});

test('partial or impossible drafts cannot masquerade as a cleared field or retain the previous ISO', () => {
  const original = {
    startDate: new Date('2026-04-01T00:00:00Z'),
    endDate: null,
  };
  for (const field of ['startDate', 'endDate'] as const) {
    const draft = {
      ...createStartEndDateDraft(original),
      [field]: '',
      [`${field}Valid`]: false,
      [`${field}Changed`]: true,
    };
    assert.ok(validateStartEndDates(draft)[field]);
    assert.throws(() => resolveStartEndDates(draft, original), RangeError);
  }
});

test('invalid stored dates remain invalid until repaired or explicitly cleared', () => {
  const original = { startDate: new Date('invalid'), endDate: null };
  const draft = createStartEndDateDraft(original);
  assert.equal(draft.startDateValid, false);
  assert.ok(draft.startDate);
  assert.throws(() => resolveStartEndDates(draft, original), RangeError);
  const repaired = {
    ...draft,
    startDate: '2026-04-01',
    startDateValid: true,
    startDateChanged: true,
  };
  assert.equal(
    resolveStartEndDates(repaired, original).startDate?.toISOString(),
    '2026-04-01T00:00:00.000Z',
  );
  assert.equal(
    resolveStartEndDates({ ...repaired, startDate: '' }, original).startDate,
    null,
  );
});

test('impossible days, non-ISO drafts and non-civil years are rejected even with a stale validity flag', () => {
  for (const day of [
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-00-10',
    '2026-01-00',
    '2026-01-32',
    '2026-04-',
    '01/04/2026',
    '0000-01-01',
    '10000-01-01',
  ]) {
    for (const draft of [changed(day), changed('', day)]) {
      assert.ok(Object.keys(validateStartEndDates(draft)).length);
      assert.throws(() => resolveStartEndDates(draft), RangeError);
    }
  }
});

test('leap days and historical years retain their exact identity across the legacy Date bridge', () => {
  for (const day of [
    '2024-02-29',
    '2000-02-29',
    '0001-01-01',
    '0099-12-31',
    '9999-12-31',
  ]) {
    const result = resolveStartEndDates(changed(day));
    assert.equal(result.startDate?.toISOString(), `${day}T00:00:00.000Z`);
    assert.equal(createStartEndDateDraft(result).startDate, day);
  }
  assert.ok(validateStartEndDates(changed('1900-02-29')).startDate);
});
