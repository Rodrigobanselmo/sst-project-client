/**
 * Executar com: npx tsx --test src/core/constants/home-business-group-scope.constants.spec.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveHeaderCompaniesQueryType } from './home-business-group-scope.constants';

describe('resolveHeaderCompaniesQueryType', () => {
  it('keeps MASTER on GET /company', () => {
    assert.equal(
      resolveHeaderCompaniesQueryType({
        isMasterAdmin: true,
        homeCompanyIsConsulting: false,
        isCompanyMaxAdmin: false,
        restrictToBusinessGroup: true,
      }),
      '',
    );
  });

  it('uses consulting contract portfolio only for max-admin inside a group', () => {
    assert.equal(
      resolveHeaderCompaniesQueryType({
        isMasterAdmin: false,
        homeCompanyIsConsulting: true,
        isCompanyMaxAdmin: true,
        restrictToBusinessGroup: true,
      }),
      '',
    );
  });

  it('does not expose GET /company to restricted consulting users', () => {
    assert.equal(
      resolveHeaderCompaniesQueryType({
        isMasterAdmin: false,
        homeCompanyIsConsulting: true,
        isCompanyMaxAdmin: false,
        restrictToBusinessGroup: true,
      }),
      '/by-user',
    );
  });

  it('keeps consulting max-admin on /by-user when not inside a group', () => {
    assert.equal(
      resolveHeaderCompaniesQueryType({
        isMasterAdmin: false,
        homeCompanyIsConsulting: true,
        isCompanyMaxAdmin: true,
        restrictToBusinessGroup: false,
      }),
      '/by-user',
    );
  });

  it('keeps regular group-member users on /by-user', () => {
    assert.equal(
      resolveHeaderCompaniesQueryType({
        isMasterAdmin: false,
        homeCompanyIsConsulting: false,
        isCompanyMaxAdmin: false,
        restrictToBusinessGroup: true,
      }),
      '/by-user',
    );
  });
});
