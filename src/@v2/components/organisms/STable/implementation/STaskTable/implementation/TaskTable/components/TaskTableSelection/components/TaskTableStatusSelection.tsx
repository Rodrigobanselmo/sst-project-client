import { SIconStatus } from '@v2/assets/icons/SIconStatus/SIconStatus';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SSearchSelectRenderOptionStatusRenderOptionStatus } from '@v2/components/forms/fields/SSearchSelect/addons/render-option/RenderOptionStatus/RenderOptionStatus';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { StatusBrowseResultModel } from '@v2/models/security/models/status/status-browse-result.model';

interface TaskTableSelectionProps {
  onEditMany: (props: { statusId?: number | null }) => void;
  status: StatusBrowseResultModel[];
}

export const TaskTableStatusSelection = ({
  onEditMany,
  status,
}: TaskTableSelectionProps) => {
  return (
    <SSearchSelect
      inputProps={{ sx: { width: 300 } }}
      component={() => (
        <SButton
          icon={<SIconStatus />}
          color="paper"
          variant="outlined"
          text="Atualizar Status"
        />
      )}
      renderItem={SSearchSelectRenderOptionStatusRenderOptionStatus}
      label="Status"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option?.id}
      onChange={(option) => {
        onEditMany({ statusId: option?.id || null });
      }}
      options={status}
      placeholder="selecione um ou mais status"
    />
  );
};
