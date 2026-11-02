import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canReadCompanyAuxiliaryData } from './company-auxiliary-access.ts';

test('eSocial-only operators do not fetch unrelated company branding or groups', () => {
  for (const permissions of [
    ['14-r'],
    ['14-ru'],
    ['2.1-crud'],
    ['2-c'],
    ['2-u'],
    ['2-'],
    ['2-read'],
    [],
  ])
    assert.equal(
      canReadCompanyAuxiliaryData({ id: 1, permissions, roles: ['1'] }),
      false,
    );
});
test('existing company readers and explicit legacy master rights retain company presentation', () => {
  for (const permissions of [
    ['2-r'],
    ['2-crud'],
    ['master-r'],
    ['master-crud'],
  ])
    assert.equal(canReadCompanyAuxiliaryData({ id: 1, permissions }), true);
  assert.equal(canReadCompanyAuxiliaryData({ id: 1, roles: ['master'], permissions: ['2-r'] }), true);
});
test('master role without company read does not trigger forbidden auxiliary requests', () => {
  for (const permissions of [[], ['14-r'], ['14-ru'], ['2-u']])
    assert.equal(canReadCompanyAuxiliaryData({ id: 1, roles: ['master'], permissions }), false);
});
test('missing sessions and similarly named roles never enable auxiliary queries', () => {
  assert.equal(canReadCompanyAuxiliaryData(null), false);
  assert.equal(
    canReadCompanyAuxiliaryData({ permissions: ['2-r'], roles: ['master'] }),
    false,
  );
  assert.equal(
    canReadCompanyAuxiliaryData({ id: 1, roles: ['master-other'] }),
    false,
  );
});
