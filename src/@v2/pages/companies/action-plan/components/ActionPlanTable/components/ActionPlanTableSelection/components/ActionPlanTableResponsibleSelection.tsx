import { SIconUser } from '@v2/assets/icons/SIconUser/SIconUser';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import {
  IActionPlanUUIDParams,
  useActionPlanResponsiblesActions,
} from '@v2/pages/companies/action-plan/hooks/useActionPlanActionsResponisble';
import { useFetchBrowseResponsibles } from '@v2/services/security/action-plan/user/browse-responsibles/hooks/useFetchBrowseResponsibles';
import { useState } from 'react';

interface ActionPlanTableSelectionProps {
  getIds: () => IActionPlanUUIDParams[];
  companyId: string;
}

export const ActionPlanTableResponsibleSelection = ({
  getIds,
  companyId,
}: ActionPlanTableSelectionProps) => {
  const [search, setSearch] = useState('');
  const { onEditManyActionPlanResponsible, isLoading: isLoadingEdit } =
    useActionPlanResponsiblesActions({
      companyId,
    });

  const { responsibles, isLoading } = useFetchBrowseResponsibles({
    companyId,
    filters: {
      search: search,
    },
    pagination: {
      page: 1,
      limit: 10,
    },
  });

  return (
    <SSearchSelect
      inputProps={{ sx: { width: 300 } }}
      options={responsibles?.results || []}
      onSearch={setSearch}
      loading={isLoading || isLoadingEdit}
      label="Responsável"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      onChange={(option) => {
        onEditManyActionPlanResponsible({
          responsibleId: option?.id || null,
          uuids: getIds(),
        });
      }}
      component={() => (
        <SButton
          icon={<SIconUser />}
          color="paper"
          variant="outlined"
          text="Atualizar Responsável"
        />
      )}
    />
  );
};
