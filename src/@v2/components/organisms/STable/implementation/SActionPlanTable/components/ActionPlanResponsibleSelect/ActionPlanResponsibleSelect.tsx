import { Box } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { SSearchSelectButtonRow } from '@v2/components/organisms/STable/addons/addons-rows/SSearchSelectButtonRow/SSearchSelectButtonRow';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { useActionPlanResponsiblesActions } from '@v2/pages/companies/action-plan/hooks/useActionPlanActionsResponisble';
import { useFetchBrowseCoordinator } from '@v2/services/security/action-plan/user/browse-coordinators/hooks/useFetchBrowseCoordinators';
import { useFetchBrowseResponsibles } from '@v2/services/security/action-plan/user/browse-responsibles/hooks/useFetchBrowseResponsibles';
import { useState } from 'react';

export const ActionPlanResponsibleSelect = ({
  companyId,
  row,
}: {
  row: ActionPlanBrowseResultModel;
  companyId: string;
}) => {
  const [search, setSearch] = useState('');
  const { onEditActionPlanResponsible, isLoading: isLoadingEdit } =
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
    <SSearchSelectButtonRow
      loading={isLoading || isLoadingEdit}
      onSearch={setSearch}
      label={row.responsible?.name || '-'}
      options={responsibles?.results || []}
      onSelect={(resp) =>
        onEditActionPlanResponsible({
          uuid: row.uuid,
          responsibleId: resp?.id || null,
        })
      }
      getOptionLabel={(resp) => resp.name}
      getOptionValue={(resp) => resp.id}
    />
  );
};
