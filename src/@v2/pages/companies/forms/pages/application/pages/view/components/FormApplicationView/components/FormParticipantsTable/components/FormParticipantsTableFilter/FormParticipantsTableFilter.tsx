import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { IFormParticipantsFilterProps } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/SFormParticipantsTable.types';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { useMemo } from 'react';
import { FormParticipantsTableFilterEstablishment } from './components/FormParticipantsTableFilterEstablishment';
import { FormParticipantsTableFilterHierarchy } from './components/FormParticipantsTableFilterHierarchy';
import { FormParticipantsTableFilterResponse } from './components/FormParticipantsTableFilterResponse';
import { FORM_PARTICIPANTS_HIERARCHY_STRUCTURE_TYPES } from './form-participants-hierarchy-filter-groups';

interface FormParticipantsTableFilterProps {
  onFilterData: (props: IFormParticipantsFilterProps) => void;
  filters: IFormParticipantsFilterProps;
  companyId: string;
  applicationId: string;
  formApplication?: FormApplicationReadModel;
}

export const FormParticipantsTableFilter = ({
  onFilterData,
  filters,
  companyId,
  formApplication,
}: FormParticipantsTableFilterProps) => {
  const workspaces = useMemo(
    () =>
      (formApplication?.participants?.workspaces ?? []).map((w) => ({
        id: w.id,
        name: w.name,
      })),
    [formApplication?.participants?.workspaces],
  );

  const structureHierarchies = useMemo(
    () =>
      (filters.hierarchies ?? []).filter(
        (h) =>
          !h.type ||
          FORM_PARTICIPANTS_HIERARCHY_STRUCTURE_TYPES.includes(h.type),
      ),
    [filters.hierarchies],
  );

  const workspaceIds = useMemo(
    () => (filters.workspaces ?? []).map((w) => w.id),
    [filters.workspaces],
  );

  return (
    <SFlex direction="column" gap={4} width={400} pb={10}>
      <FormParticipantsTableFilterEstablishment
        workspaces={workspaces}
        filters={filters}
        onFilterData={onFilterData}
      />

      <FormParticipantsTableFilterResponse
        filters={filters}
        onFilterData={onFilterData}
      />

      <SFlex direction="column" gap={1}>
        <SText fontSize={12} color="text.secondary" sx={{ fontWeight: 600 }}>
          Setor / hierarquia
        </SText>
        <FormParticipantsTableFilterHierarchy
          companyId={companyId}
          label="Diretoria, superintendência, setor..."
          allowedTypes={FORM_PARTICIPANTS_HIERARCHY_STRUCTURE_TYPES}
          workspaceIds={workspaceIds}
          value={structureHierarchies}
          onChange={(selected) => {
            onFilterData({
              hierarchies: selected,
            });
          }}
        />
      </SFlex>
    </SFlex>
  );
};
