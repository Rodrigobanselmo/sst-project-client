import assert from 'node:assert/strict';
import { test } from 'node:test';
import dayjs from 'dayjs';

import {
  civilCalendarYears,
  assessmentPeriodCivilDate,
  clinicalHistoryCivilDate,
  civilDateDisplay,
  civilDateInput,
  civilDateIso,
  civilDateValue,
} from './civil-date.ts';

test('assessment period boundaries preserve their exact UTC civil dates in every browser timezone', () => {
  const previous = process.env.TZ;
  const boundary = new Date('2026-04-01T00:00:00.000Z');
  const timestamp = boundary.getTime();
  try {
    for (const timezone of [
      'America/Sao_Paulo',
      'Pacific/Honolulu',
      'Asia/Tokyo',
    ]) {
      process.env.TZ = timezone;
      assert.equal(
        assessmentPeriodCivilDate(boundary)?.format('DD/MM/YYYY'),
        '01/04/2026',
      );
      assert.equal(
        assessmentPeriodCivilDate('2026-01-01T12:00:00.000Z')?.format(
          'DD/MM/YYYY',
        ),
        '01/01/2026',
      );
      assert.equal(
        assessmentPeriodCivilDate('2026-04-01T03:00:00.000Z')?.format(
          'DD/MM/YYYY',
        ),
        '01/04/2026',
      );
    }
    assert.equal(boundary.getTime(), timestamp);
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('missing and invalid assessment periods stay absent rather than becoming today', () => {
  for (const value of [
    undefined,
    null,
    '',
    'Invalid Date',
    new Date('invalid'),
  ])
    assert.equal(assessmentPeriodCivilDate(value), null);
});

test('clinical DateTime-backed days match the S-2220 UTC day in Brazilian and other browser timezones', () => {
  const previous = process.env.TZ;
  try {
    for (const timezone of [
      'America/Sao_Paulo',
      'Pacific/Honolulu',
      'Asia/Tokyo',
    ]) {
      process.env.TZ = timezone;
      assert.equal(
        clinicalHistoryCivilDate('2026-10-01T00:00:00.000Z')?.format(
          'DD/MM/YYYY',
        ),
        '01/10/2026',
      );
      assert.equal(
        clinicalHistoryCivilDate('2026-09-30T00:00:00.000Z')?.format(
          'DD/MM/YYYY',
        ),
        '30/09/2026',
      );
      assert.equal(
        clinicalHistoryCivilDate('2026-10-01T03:00:00.000Z')?.format(
          'DD/MM/YYYY',
        ),
        '01/10/2026',
      );
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('clinical validity uses that same civil day and keeps month-end clamping', () => {
  const stored = new Date('2026-01-31T00:00:00.000Z');
  const before = stored.getTime();
  assert.equal(
    clinicalHistoryCivilDate(stored)?.add(1, 'month').format('DD/MM/YYYY'),
    '28/02/2026',
  );
  assert.equal(
    clinicalHistoryCivilDate('2024-01-31')
      ?.add(1, 'month')
      .format('DD/MM/YYYY'),
    '29/02/2024',
  );
  assert.equal(stored.getTime(), before);
});

test('missing or invalid clinical dates stay absent instead of becoming today', () => {
  for (const value of [
    undefined,
    null,
    '',
    'Invalid Date',
    new Date('invalid'),
  ])
    assert.equal(clinicalHistoryCivilDate(value), null);
});

test('a Brazilian display keeps April and June civil days without swapping month and day', () => {
  for (const [iso, display] of [
    ['2026-04-01', '01/04/2026'],
    ['2026-06-01', '01/06/2026'],
  ]) {
    const value = civilDateValue(iso);
    assert.equal(value?.format('DD/MM/YYYY'), display);
    assert.equal(civilDateIso(value), iso);
  }
});
test('civil serialization does not shift a selected day through a timezone or UTC midnight', () => {
  for (const hour of [0, 12, 23])
    assert.equal(civilDateIso(dayjs('2026-06-01').hour(hour)), '2026-06-01');
});
test('invalid, partial and cleared calendar edits never retain an earlier valid ISO', () => {
  assert.equal(civilDateIso(dayjs('invalid')), '');
  assert.equal(civilDateIso(dayjs('2026-06-01'), true), '');
  assert.equal(civilDateIso(null), '');
  for (const invalid of [
    '',
    '01/06/2026',
    '2026-06-',
    '2026-02-29',
    '2026-04-31',
  ])
    assert.equal(civilDateValue(invalid), null);
});
test('real leap days and four-digit historical years keep their exact civil identity', () => {
  assert.equal(civilDateIso(civilDateValue('2024-02-29')), '2024-02-29');
  assert.equal(civilDateIso(civilDateValue('0001-01-01')), '0001-01-01');
});
test('typing keeps impossible and partial drafts visible while clearing the transport value', () => {
  assert.deepEqual(civilDateInput('31/02/2026'), {
    text: '31/02/2026',
    iso: '',
    invalid: true,
  });
  assert.deepEqual(civilDateInput('01/04/20'), {
    text: '01/04/20',
    iso: '',
    invalid: true,
  });
  assert.deepEqual(civilDateInput(''), { text: '', iso: '', invalid: false });
  assert.deepEqual(civilDateInput('01/06/2026'), {
    text: '01/06/2026',
    iso: '2026-06-01',
    invalid: false,
  });
});
test('numeric mobile typing inserts Brazilian separators without guessing or normalizing an invalid day', () => {
  assert.equal(civilDateInput('01062026').iso, '2026-06-01');
  assert.equal(civilDateInput('01/042').text, '01/04/2');
  assert.deepEqual(civilDateInput('31022026'), {
    text: '31/02/2026',
    iso: '',
    invalid: true,
  });
  assert.equal(civilDateInput('1/06/2026').iso, '');
  assert.equal(civilDateDisplay('2026-06-01'), '01/06/2026');
});
test('calendar navigation renders at most 201 years without rounding early or extreme civil years', () => {
  const today = dayjs('2026-10-27');
  for (const [iso, minYear, maxYear] of [
    ['2026-06-01', 1926, 2126],
    ['1998-08-26', 1898, 2098],
    ['0001-01-01', 1, 101],
    ['0099-12-31', 1, 199],
    ['9999-12-31', 9899, 9999],
  ] as const) {
    const date = civilDateValue(iso);
    assert.ok(date);
    assert.deepEqual(civilCalendarYears(date, today), { minYear, maxYear });
    assert.equal(civilDateIso(date), iso);
    assert.ok(maxYear - minYear + 1 <= 201);
  }
  assert.deepEqual(civilCalendarYears(null, today), {
    minYear: 1926,
    maxYear: 2126,
  });
  assert.deepEqual(civilCalendarYears(dayjs('invalid'), today), {
    minYear: 1926,
    maxYear: 2126,
  });
});
