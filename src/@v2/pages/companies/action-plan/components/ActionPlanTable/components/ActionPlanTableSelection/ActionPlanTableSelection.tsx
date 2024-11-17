import { SIconStatus } from '@v2/assets/icons/SIconStatus/SIconStatus';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SSearchSelectRenderOptionStatusRenderOptionStatus } from '@v2/components/forms/fields/SSearchSelect/addons/render-option/RenderOptionStatus/RenderOptionStatus';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { STableSelection } from '@v2/components/organisms/STable/addons/addons-table/STableSelectionUpdate/STableSelectionUpdate';
import { TablesSelectEnum } from '@v2/components/organisms/STable/hooks/useTableSelect';

interface ActionPlanTableSelectionProps {
  table: TablesSelectEnum;
  stages: {
    id: number;
    name: string;
    color?: string;
  }[];
}

export const ActionPlanTableSelection = ({
  table,
  stages,
}: ActionPlanTableSelectionProps) => {
  return (
    <STableSelection table={table}>
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
        renderFullOption={SSearchSelectRenderOptionStatusRenderOptionStatus}
        label="Status"
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option?.id}
        onChange={(option) => {
          // null;
        }}
        options={stages}
        placeholder="selecione um ou mais status"
      />
    </STableSelection>
  );
};
