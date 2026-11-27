import { api } from 'core/services/apiClient';
import type { PsychContext } from './psychosocial-report.types';
import { useState } from 'react';
import { Alert, Button } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import {
  browseHierarchyGroups,
  HierarchyGroupResult,
} from '@v2/services/forms/hierarchy-group/browse-hierarchy-groups/service/browse-hierarchy-groups.service';
import { browseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/service/browse-form-questions-answers-risks.service';
import { useMutateUpsertHierarchyGroups } from '@v2/services/forms/hierarchy-group/upsert-hierarchy-groups/hooks/useMutateUpsertHierarchyGroups';
import { UpsertHierarchyGroupModal } from '../FormQuestionsDashboard/components/FormHierarchyGroupManager/components/UpsertHierarchyGroupModal';
import {
  buildHierarchyGroupOptionLabels,
  HierarchyGroupOption,
} from '../FormQuestionsDashboard/components/FormHierarchyGroupManager/helpers/formatHierarchyGroupOptionLabel';

export function ConsolidateSectorGroup({
  companyId,
  applicationId,
  draft,
  onConsolidated,
}: {
  companyId: string;
  applicationId: string;
  draft: { name: string; hierarchyIds: string[] };
  onConsolidated: () => void;
}) {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState<HierarchyGroupResult[]>([]);
  const [respondentEligibility, setRespondentEligibility] =
    useState<
      Map<string, { responded: number; minimum: number; blocked: boolean }>
    >();
  const [options, setOptions] = useState<HierarchyGroupOption[]>([]);
  const [initialData, setInitialData] = useState<typeof draft>();
  const mutation = useMutateUpsertHierarchyGroups();
  const memberships = new Map(
    groups.flatMap((group) =>
      group.hierarchyIds.map((id) => [id, group.name] as const),
    ),
  );
  async function launch() {
    setLoading(true);
    setError('');
    try {
      const [existing, risks, reportContext] = await Promise.all([
        browseHierarchyGroups({ companyId, applicationId }),
        browseFormQuestionsAnswersRisks({ companyId, applicationId }),
        api.get<PsychContext>(
          `/v2/companies/${companyId}/forms/applications/${applicationId}/psychosocial-reports/context`,
          { params: { unit: 'all' } },
        ),
      ]);
      if (!risks) throw new Error('Cadastro de setores indisponível');
      setRespondentEligibility(
        new Map(
          reportContext.data.snapshot.sectors.map((sector) => [
            sector.id,
            {
              responded: sector.responded,
              minimum: sector.anonymityMinimum,
              blocked: sector.anonymityBlocked,
            },
          ]),
        ),
      );
      setGroups(existing);
      setOptions(
        Object.values(risks.eligibleEntityMap ?? {}).map((sector) => ({
          ...sector,
        })),
      );
      setInitialData({
        name: draft.name,
        hierarchyIds: [...draft.hierarchyIds],
      });
      setOpen(true);
    } catch {
      setError(
        'Não foi possível carregar o cadastro de agrupamentos. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={launch}
        disabled={
          loading ||
          mutation.isPending ||
          draft.hierarchyIds.length < 2 ||
          !draft.name.trim() ||
          draft.name.trim().length > 100
        }
      >
        {loading ? 'Carregando cadastro…' : 'Consolidar agrupamento'}
      </Button>
      {!!error && <Alert severity="error">{error}</Alert>}
      <UpsertHierarchyGroupModal
        open={open}
        onClose={() => setOpen(false)}
        initialData={initialData}
        respondentEligibility={respondentEligibility}
        creationDraft
        existingMemberships={memberships}
        availableHierarchies={options}
        eligibleHierarchyIds={new Set(options.map((sector) => sector.id))}
        hierarchyOptionLabels={buildHierarchyGroupOptionLabels(options)}
        assignedHierarchyIds={new Set(memberships.keys())}
        loading={mutation.isPending}
        onSave={(data) =>
          mutation.mutate(
            {
              companyId,
              applicationId,
              groups: [
                ...groups.map((group) => ({
                  id: group.id,
                  name: group.name,
                  description: group.description ?? null,
                  hierarchyIds: group.hierarchyIds,
                })),
                data,
              ],
            },
            {
              onSuccess: async () => {
                setOpen(false);
                onConsolidated();
                await client.invalidateQueries({
                  queryKey: [
                    'psychosocial-report',
                    'v4',
                    companyId,
                    applicationId,
                  ],
                });
              },
            },
          )
        }
      />
    </>
  );
}
