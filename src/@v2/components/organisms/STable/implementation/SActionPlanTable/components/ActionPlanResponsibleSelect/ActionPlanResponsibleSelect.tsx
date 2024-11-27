import { Box } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { SSearchSelectButtonRow } from '@v2/components/organisms/STable/addons/addons-rows/SSearchSelectButtonRow/SSearchSelectButtonRow';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { useFetchBrowseCoordinator } from '@v2/services/security/action-plan/user/browse-coordinators/hooks/useFetchBrowseCoordinators';
import { useFetchBrowseResponsibles } from '@v2/services/security/action-plan/user/browse-responsibles/hooks/useFetchBrowseResponsibles';
import { useState } from 'react';

export const ActionPlanResponsibleSelect = ({
  companyId,
  responsibleLabel,
  onEditResponsible,
}: {
  responsibleLabel: string;
  companyId: string;
  onEditResponsible: (responsibleId: number | null) => void;
}) => {
  const [search, setSearch] = useState('');
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
      loading={isLoading}
      onSearch={setSearch}
      label={responsibleLabel}
      options={responsibles?.results || []}
      onSelect={(resp) => onEditResponsible(resp?.id || null)}
      getOptionLabel={(resp) => resp.name}
      getOptionValue={(resp) => resp.id}
    />
  );
};
