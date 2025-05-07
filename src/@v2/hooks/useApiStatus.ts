import { StatusTypeEnum } from '@v2/models/security/enums/status-type.enum';
import { useMutateAddStatus } from '@v2/services/security/status/add/hooks/useMutateAddStatus';
import { useFetchBrowseStatus } from '@v2/services/security/status/browse/hooks/useFetchBrowseStatus';
import { useMutateDeleteStatus } from '@v2/services/security/status/delete/hooks/useMutateDeleteStatus';
import { useMutateEditStatus } from '@v2/services/security/status/edit/hooks/useMutateEditStatus';

interface IApiStatusProps {
  companyId: string;
  type: StatusTypeEnum;
}

export function useApiStatus({ companyId, type }: IApiStatusProps) {
  const { status, isFetching } = useFetchBrowseStatus({ companyId, type });

  const addStatusMutation = useMutateAddStatus();
  const editStatusMutation = useMutateEditStatus();
  const deleteStatusMutation = useMutateDeleteStatus();

  const onAddStatus = (name: string) => {
    return addStatusMutation.mutateAsync({ companyId, type, name });
  };

  const onEditStatus = ({
    id,
    name,
    color,
  }: {
    id: number;
    name?: string;
    color?: string | null;
  }) => {
    return editStatusMutation.mutateAsync({ id, companyId, color, name });
  };
  const onDeleteStatus = (id: number) => {
    return deleteStatusMutation.mutateAsync({ id, companyId });
  };

  return {
    onEditStatus,
    onDeleteStatus,
    onAddStatus,
    statusOptions: status?.results || [],
    isLoadingStatusOptions: isFetching,
  };
}
