import { SSearchSelectButtonRow } from '@v2/components/organisms/STable/addons/addons-rows/SSearchSelectButtonRow/SSearchSelectButtonRow';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { ResponsibleBrowseResultModel } from '@v2/models/security/models/responsible/responsible-browse-result.model';
import { useActionPlanResponsibleActions } from '@v2/pages/companies/action-plan/hooks/useActionPlanActionsResponisble';
import { useInfinityBrowseResponsibles } from '@v2/services/security/action-plan/user/browse-responsibles/hooks/useInfinityBrowseResponsibles';
import { useState } from 'react';

export const ActionPlanResponsibleSelect = ({
  companyId,
  row,
  disabled,
}: {
  row: ActionPlanBrowseResultModel;
  companyId: string;
  disabled?: boolean;
}) => {
  const [search, setSearch] = useState('');
  const { onEditActionPlanResponsible, isLoading: isLoadingEdit } =
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
    <SSearchSelectButtonRow
      disabled={disabled}
      loading={isFetching || isLoadingEdit}
      onSearch={setSearch}
      label={row.responsible?.name || '-'}
      options={options}
      onScrollEnd={() => fetchNextPage()}
      onSelect={(resp) =>
        onEditActionPlanResponsible({
          data: resp,
          uuid: row.uuid,
          responsibleId: resp?.userId || null,
          employeeId: resp?.employeeId || null,
        })
      }
      getOptionLabel={(resp) => resp.name}
      getOptionValue={(resp) => resp._id}
    />
  );
};
