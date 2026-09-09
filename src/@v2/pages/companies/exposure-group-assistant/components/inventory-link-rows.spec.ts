import assert from 'node:assert/strict';

import { toInventoryLinkRows } from './inventory-link-rows';
import type {
  InventoryLinkPreview,
  InventoryPgrImportPreview,
  InventoryPgrImportReview,
  InventoryReviewedLink,
} from '@v2/services/security/inventory-pgr-import/service/inventory-pgr-import.types';

const previewLink: InventoryLinkPreview = {
  roleKey: 'role-1',
  groupKey: 'group-1',
  roleName: 'Operador',
  groupName: 'GSE 1',
  evidence: [],
  matchStatus: 'NEW',
};

const preview = {
  links: [previewLink],
} as InventoryPgrImportPreview;

const previewRows = toInventoryLinkRows(preview, null);
assert.equal(previewRows.length, 1);
assert.equal(previewRows[0].reviewed, null);
assert.equal(previewRows[0].link.roleName, 'Operador');
assert.equal('included' in previewRows[0].link, false);

const reviewedLink: InventoryReviewedLink = {
  ...previewLink,
  included: false,
  appliedRoleName: 'Operador Aplicado',
  appliedGroupName: 'GSE Aplicado',
  excludedBecause: 'role-skipped',
  planAction: 'skip',
};

const review = {
  links: [reviewedLink],
} as InventoryPgrImportReview;

const reviewRows = toInventoryLinkRows(preview, review);
assert.equal(reviewRows.length, 1);
assert.equal(reviewRows[0].reviewed?.included, false);
assert.equal(reviewRows[0].reviewed?.excludedBecause, 'role-skipped');
assert.equal(reviewRows[0].reviewed?.appliedRoleName, 'Operador Aplicado');
assert.equal(reviewRows[0].reviewed?.appliedGroupName, 'GSE Aplicado');
assert.equal(reviewRows[0].link.roleKey, 'role-1');

console.log('inventory-link-rows.spec.ts ok');
