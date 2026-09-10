/**
 * Testes pontuais da autorização da privacidade FRPS no client.
 * Executar com: npx tsx --test <este-arquivo>
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { RoleEnum } from '../../../project/enum/roles.enums';
import {
  canManageFrpsRiskAnalysisPrivacy,
  canRequestAdminPasswordReset,
  isCompanyMaxAdminRole,
} from './frps-privacy-auth';

describe('frps-privacy-auth (client)', () => {
  it('allows MASTER and ADMIN', () => {
    assert.equal(canManageFrpsRiskAnalysisPrivacy([RoleEnum.MASTER]), true);
    assert.equal(canManageFrpsRiskAnalysisPrivacy([RoleEnum.ADMIN]), true);
  });

  it('allows company max admin role bundle', () => {
    assert.equal(
      isCompanyMaxAdminRole([
        RoleEnum.USER,
        RoleEnum.COMPANY,
        RoleEnum.SECURITY,
        RoleEnum.MEDICINE,
        RoleEnum.RISK,
        RoleEnum.FORM,
      ]),
      true,
    );
  });

  it('denies SST / Medicina / PGR coordinator-like bundles', () => {
    assert.equal(
      canManageFrpsRiskAnalysisPrivacy([
        RoleEnum.USER,
        RoleEnum.COMPANY,
        RoleEnum.SECURITY,
        RoleEnum.FORM,
      ]),
      false,
    );
    assert.equal(
      canManageFrpsRiskAnalysisPrivacy([
        RoleEnum.USER,
        RoleEnum.COMPANY,
        RoleEnum.MEDICINE,
        RoleEnum.FORM,
      ]),
      false,
    );
    assert.equal(
      canManageFrpsRiskAnalysisPrivacy([
        RoleEnum.USER,
        RoleEnum.COMPANY,
        RoleEnum.RISK,
        RoleEnum.FORM,
      ]),
      false,
    );
  });

  it('admin password reset visibility follows privilege rules', () => {
    assert.equal(
      canRequestAdminPasswordReset({
        actorRoles: [RoleEnum.MASTER],
        actorUserId: 1,
        targetUserId: 2,
        targetRoles: [RoleEnum.USER],
      }),
      true,
    );
    assert.equal(
      canRequestAdminPasswordReset({
        actorRoles: [RoleEnum.ADMIN],
        actorUserId: 1,
        targetUserId: 2,
        targetRoles: [RoleEnum.USER],
      }),
      true,
    );
    assert.equal(
      canRequestAdminPasswordReset({
        actorRoles: [RoleEnum.USER],
        actorUserId: 1,
        targetUserId: 2,
        targetRoles: [RoleEnum.USER],
      }),
      false,
    );
    assert.equal(
      canRequestAdminPasswordReset({
        actorRoles: [RoleEnum.ADMIN],
        actorUserId: 1,
        targetUserId: 2,
        targetRoles: [RoleEnum.ADMIN],
      }),
      false,
    );
    assert.equal(
      canRequestAdminPasswordReset({
        actorRoles: [RoleEnum.ADMIN],
        actorUserId: 1,
        targetUserId: 2,
        targetRoles: [RoleEnum.MASTER],
      }),
      false,
    );
    assert.equal(
      canRequestAdminPasswordReset({
        actorRoles: [RoleEnum.MASTER],
        actorUserId: 1,
        targetUserId: 1,
        targetRoles: [RoleEnum.USER],
      }),
      false,
    );
  });
});
