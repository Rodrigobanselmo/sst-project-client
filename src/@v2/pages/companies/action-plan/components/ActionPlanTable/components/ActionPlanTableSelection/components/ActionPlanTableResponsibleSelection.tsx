import { SIconUser } from '@v2/assets/icons/SIconUser/SIconUser';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { ResponsibleBrowseResultModel } from '@v2/models/security/models/responsible/responsible-browse-result.model';
import {
  IActionPlanUUIDParams,
  useActionPlanResponsibleActions,
} from '@v2/pages/companies/action-plan/hooks/useActionPlanActionsResponisble';
import { useInfinityBrowseResponsibles } from '@v2/services/security/action-plan/user/browse-responsibles/hooks/useInfinityBrowseResponsibles';
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
    useActionPlanResponsibleActions({
      companyId,
    });

  const {
    responsible: responsibles,
    isFetching,
    fetchNextPage,
  } = useInfinityBrowseResponsibles({
    companyId,
    filters: {
      search: search,
    },
    pagination: {
      page: 1,
      limit: 15,
    },
  });

  const options =
    responsibles?.pages.reduce((acc, page) => {
      return [...acc, ...page.results];
    }, [] as ResponsibleBrowseResultModel[]) || [];

  return (
    <SSearchSelect
      inputProps={{ sx: { width: 300 } }}
      options={options}
      onScrollEnd={() => fetchNextPage()}
      onSearch={setSearch}
      loading={isFetching || isLoadingEdit}
      label="Responsável"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option._id}
      onChange={(option) => {
        onEditManyActionPlanResponsible({
          data: option,
          responsibleId: option?.userId || null,
          employeeId: option?.employeeId || null,
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
