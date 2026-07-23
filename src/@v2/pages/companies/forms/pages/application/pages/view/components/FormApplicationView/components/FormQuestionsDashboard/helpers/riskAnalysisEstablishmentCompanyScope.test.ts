import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isEntityInEstablishmentCompanyScope,
  isEstablishmentGroupingSelection,
  resolveOperationalCompanyIdFromSelectedEstablishmentGroup,
  shouldRestrictRiskAnalysisToEstablishmentCompany,
} from './riskAnalysisEstablishmentCompanyScope';

describe('riskAnalysisEstablishmentCompanyScope', () => {
  describe('isEstablishmentGroupingSelection', () => {
    it('detects structural workspace grouping', () => {
      assert.equal(
        isEstablishmentGroupingSelection({
          selectedGroupingQuestionId: '__participant_workspace',
        }),
        true,
      );
    });

    it('ignores other structural groupings', () => {
      assert.equal(
        isEstablishmentGroupingSelection({
          selectedGroupingQuestionId: '__participant_sector',
        }),
        false,
      );
    });

    it('detects form question labeled estabelecimento', () => {
      assert.equal(
        isEstablishmentGroupingSelection({
          selectedGroupingQuestionId: 'q-est',
          selectedGroupingLabel: 'Estabelecimento',
        }),
        true,
      );
    });

    it('returns false without grouping', () => {
      assert.equal(
        isEstablishmentGroupingSelection({
          selectedGroupingQuestionId: null,
        }),
        false,
      );
    });
  });

  describe('resolveOperationalCompanyIdFromSelectedEstablishmentGroup', () => {
    const structures = [
      { participantsAnswersId: 'p1', companyId: 'company-lapa' },
      { participantsAnswersId: 'p2', companyId: 'company-lapa' },
      { participantsAnswersId: 'p3', companyId: 'company-centro' },
    ];

    it('uses the single participant companyId of the selected establishment group', () => {
      assert.equal(
        resolveOperationalCompanyIdFromSelectedEstablishmentGroup({
          visibleParticipantGroups: [
            { participantIds: new Set(['p1', 'p2']) },
          ],
          participantStructures: structures,
        }),
        'company-lapa',
      );
    });

    it('returns null when no participants have companyId (nenhum setor/unidade resolvível)', () => {
      assert.equal(
        resolveOperationalCompanyIdFromSelectedEstablishmentGroup({
          visibleParticipantGroups: [{ participantIds: new Set(['p-x']) }],
          participantStructures: [
            { participantsAnswersId: 'p-x', companyId: null },
          ],
        }),
        null,
      );
    });

    it('returns null on companyId tie inside the selected group', () => {
      assert.equal(
        resolveOperationalCompanyIdFromSelectedEstablishmentGroup({
          visibleParticipantGroups: [
            { participantIds: new Set(['p1', 'p3']) },
          ],
          participantStructures: structures,
        }),
        null,
      );
    });

    it('returns null when more than one establishment group is visible', () => {
      assert.equal(
        resolveOperationalCompanyIdFromSelectedEstablishmentGroup({
          visibleParticipantGroups: [
            { participantIds: new Set(['p1']) },
            { participantIds: new Set(['p3']) },
          ],
          participantStructures: structures,
        }),
        null,
      );
    });

    it('follows the newly selected single establishment after swap', () => {
      assert.equal(
        resolveOperationalCompanyIdFromSelectedEstablishmentGroup({
          visibleParticipantGroups: [{ participantIds: new Set(['p3']) }],
          participantStructures: structures,
        }),
        'company-centro',
      );
    });
  });

  describe('visibility for establishment-scoped analysis', () => {
    const entityMap = {
      'cozinha-lapa': { companyId: 'company-lapa', name: 'COZINHA' },
      'cozinha-centro': { companyId: 'company-centro', name: 'COZINHA' },
      'admin-lapa': { companyId: 'company-lapa', name: 'ADMIN' },
      'ops-centro-a': { companyId: 'company-centro', name: 'OPS A' },
      'ops-centro-b': { companyId: 'company-centro', name: 'OPS B' },
      'ops-centro-c': { companyId: 'company-centro', name: 'OPS C' },
    };

    function visibleWithScope(params: {
      allowedEntityIds: Set<string>;
      scopeCompanyId: string | null;
      restrict: boolean;
      entityId: string;
    }) {
      if (!params.allowedEntityIds.has(params.entityId)) return false;
      return isEntityInEstablishmentCompanyScope({
        entityId: params.entityId,
        entityMap,
        scopeCompanyId: params.scopeCompanyId,
        restrict: params.restrict,
      });
    }

    it('1 valid sector + many foreign wrongly answered: keeps valid, hides foreign', () => {
      const allowedEntityIds = new Set([
        'cozinha-lapa',
        'ops-centro-a',
        'ops-centro-b',
        'ops-centro-c',
      ]);
      const restrict = shouldRestrictRiskAnalysisToEstablishmentCompany({
        selectedGroupingQuestionId: '__participant_workspace',
        allowedEntityIds,
        visibleEstablishmentGroupCount: 1,
      });
      const scopeCompanyId =
        resolveOperationalCompanyIdFromSelectedEstablishmentGroup({
          visibleParticipantGroups: [
            { participantIds: new Set(['p1', 'p2']) },
          ],
          participantStructures: [
            { participantsAnswersId: 'p1', companyId: 'company-lapa' },
            { participantsAnswersId: 'p2', companyId: 'company-lapa' },
          ],
        });

      assert.equal(restrict, true);
      assert.equal(scopeCompanyId, 'company-lapa');
      assert.equal(
        visibleWithScope({
          allowedEntityIds,
          scopeCompanyId,
          restrict,
          entityId: 'cozinha-lapa',
        }),
        true,
      );
      assert.equal(
        visibleWithScope({
          allowedEntityIds,
          scopeCompanyId,
          restrict,
          entityId: 'ops-centro-a',
        }),
        false,
      );
    });

    it('no valid sector in group: foreign-only sectors are hidden when scope is known', () => {
      const allowedEntityIds = new Set(['cozinha-centro']);
      const scopeCompanyId =
        resolveOperationalCompanyIdFromSelectedEstablishmentGroup({
          visibleParticipantGroups: [{ participantIds: new Set(['p1']) }],
          participantStructures: [
            { participantsAnswersId: 'p1', companyId: 'company-lapa' },
          ],
        });

      assert.equal(scopeCompanyId, 'company-lapa');
      assert.equal(
        isEntityInEstablishmentCompanyScope({
          entityId: 'cozinha-centro',
          entityMap,
          scopeCompanyId,
          restrict: true,
        }),
        false,
      );
    });

    it('tie between two companyIds: does not restrict', () => {
      const scopeCompanyId =
        resolveOperationalCompanyIdFromSelectedEstablishmentGroup({
          visibleParticipantGroups: [
            { participantIds: new Set(['p1', 'p3']) },
          ],
          participantStructures: [
            { participantsAnswersId: 'p1', companyId: 'company-lapa' },
            { participantsAnswersId: 'p3', companyId: 'company-centro' },
          ],
        });
      assert.equal(scopeCompanyId, null);
      assert.equal(
        isEntityInEstablishmentCompanyScope({
          entityId: 'cozinha-centro',
          entityMap,
          scopeCompanyId,
          restrict: true,
        }),
        true,
      );
    });

    it('only one foreign sector: still hidden when participant companyId is the selected unit', () => {
      assert.equal(
        isEntityInEstablishmentCompanyScope({
          entityId: 'cozinha-centro',
          entityMap,
          scopeCompanyId: 'company-lapa',
          restrict: true,
        }),
        false,
      );
    });

    it('multiple valid sectors + one foreign: keeps valids, hides foreign', () => {
      const scopeCompanyId = 'company-lapa';
      assert.equal(
        isEntityInEstablishmentCompanyScope({
          entityId: 'cozinha-lapa',
          entityMap,
          scopeCompanyId,
          restrict: true,
        }),
        true,
      );
      assert.equal(
        isEntityInEstablishmentCompanyScope({
          entityId: 'admin-lapa',
          entityMap,
          scopeCompanyId,
          restrict: true,
        }),
        true,
      );
      assert.equal(
        isEntityInEstablishmentCompanyScope({
          entityId: 'cozinha-centro',
          entityMap,
          scopeCompanyId,
          restrict: true,
        }),
        false,
      );
    });

    it('swap of the only visible establishment updates operational scope', () => {
      const before =
        resolveOperationalCompanyIdFromSelectedEstablishmentGroup({
          visibleParticipantGroups: [{ participantIds: new Set(['p1']) }],
          participantStructures: [
            { participantsAnswersId: 'p1', companyId: 'company-lapa' },
            { participantsAnswersId: 'p3', companyId: 'company-centro' },
          ],
        });
      const after =
        resolveOperationalCompanyIdFromSelectedEstablishmentGroup({
          visibleParticipantGroups: [{ participantIds: new Set(['p3']) }],
          participantStructures: [
            { participantsAnswersId: 'p1', companyId: 'company-lapa' },
            { participantsAnswersId: 'p3', companyId: 'company-centro' },
          ],
        });
      assert.equal(before, 'company-lapa');
      assert.equal(after, 'company-centro');
      assert.equal(
        isEntityInEstablishmentCompanyScope({
          entityId: 'cozinha-centro',
          entityMap,
          scopeCompanyId: after,
          restrict: true,
        }),
        true,
      );
      assert.equal(
        isEntityInEstablishmentCompanyScope({
          entityId: 'cozinha-lapa',
          entityMap,
          scopeCompanyId: after,
          restrict: true,
        }),
        false,
      );
    });

    it('multiple visible establishments: no restriction', () => {
      const allowedEntityIds = new Set(['cozinha-lapa', 'cozinha-centro']);
      assert.equal(
        shouldRestrictRiskAnalysisToEstablishmentCompany({
          selectedGroupingQuestionId: '__participant_workspace',
          allowedEntityIds,
          visibleEstablishmentGroupCount: 2,
        }),
        false,
      );
      assert.equal(
        isEntityInEstablishmentCompanyScope({
          entityId: 'cozinha-centro',
          entityMap,
          scopeCompanyId: 'company-lapa',
          restrict: false,
        }),
        true,
      );
    });

    it('does not restrict without establishment grouping (consolidated view)', () => {
      assert.equal(
        shouldRestrictRiskAnalysisToEstablishmentCompany({
          selectedGroupingQuestionId: null,
          allowedEntityIds: null,
          visibleEstablishmentGroupCount: 0,
        }),
        false,
      );
    });
  });
});
