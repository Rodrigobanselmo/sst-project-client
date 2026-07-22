/**
 * Executar: npx tsx --test src/@v2/pages/master/frps-explainability-library/frps-explainability-library-pagination.styles.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { frpsLibraryPaginationSx } from './frps-explainability-library-pagination.styles';

describe('frpsLibraryPaginationSx', () => {
  it('keeps selected page number readable with contrast text', () => {
    const sx = frpsLibraryPaginationSx as Record<string, Record<string, unknown>>;

    assert.equal(sx['& .MuiPaginationItem-root']?.color, 'text.primary');
    assert.equal(
      sx['& .MuiPaginationItem-root.Mui-selected']?.backgroundColor,
      'primary.main',
    );
    assert.equal(
      sx['& .MuiPaginationItem-root.Mui-selected']?.color,
      'primary.contrastText',
    );
    assert.equal(
      sx['& .MuiPaginationItem-root.Mui-selected:hover']?.color,
      'primary.contrastText',
    );
  });
});
