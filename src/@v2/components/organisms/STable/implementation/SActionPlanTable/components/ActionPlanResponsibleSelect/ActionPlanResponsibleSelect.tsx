import { SSearchSelectButtonRow } from '@v2/components/organisms/STable/addons/addons-rows/SSearchSelectButtonRow/SSearchSelectButtonRow';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { useActionPlanResponsibleActions } from '@v2/pages/companies/action-plan/hooks/useActionPlanActionsResponisble';
import { useFetchBrowseResponsible } from '@v2/services/security/action-plan/user/browse-responsibles/hooks/useFetchBrowseResponsibles';
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

  const { responsible: responsibles, isLoading } = useFetchBrowseResponsible({
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
    <SSearchSelectButtonRow
      disabled={disabled}
      loading={isLoading || isLoadingEdit}
      onSearch={setSearch}
      label={row.responsible?.name || '-'}
      options={responsibles?.results || []}
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
