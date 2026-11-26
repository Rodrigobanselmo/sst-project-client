import assert from 'node:assert/strict';
import { it } from 'node:test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { SectorBulkRiskRemove } from './SectorBulkRiskRemove';

it('does not prepare removal batches while rendering closed buttons for every factor', () => {
  let builds = 0;
  for (let index = 0; index < 18; index++) {
    renderToString(createElement(SectorBulkRiskRemove, {
      title: `factor ${index}`, canRemove: true, scope: 'risk',
      buildTasks: () => { builds++; throw new Error('Batch must be prepared only after opening the dialog'); },
      onComplete: async () => {},
    }));
  }
  assert.equal(builds, 0);
});
