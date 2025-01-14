import { SIconStatus } from '@v2/assets/icons/SIconStatus/SIconStatus';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SSearchSelectRenderOptionStatusRenderOptionStatus } from '@v2/components/forms/fields/SSearchSelect/addons/render-option/RenderOptionStatus/RenderOptionStatus';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { STableSelection } from '@v2/components/organisms/STable/addons/addons-table/STableSelectionUpdate/STableSelectionUpdate';
import {
  TablesSelectEnum,
  useTableSelect,
} from '@v2/components/organisms/STable/hooks/useTableSelect';
import { StatusBrowseResultModel } from '@v2/models/security/models/status/status-browse-result.model';

interface CharacterizationTableSelectionProps {
  table: TablesSelectEnum;
  onEditMany: (props: { ids: string[]; stageId?: number | null }) => void;
  stages: StatusBrowseResultModel[];
}

export const CharacterizationTableSelection = ({
  table,
  stages,
  onEditMany,
}: CharacterizationTableSelectionProps) => {
  useTableSelect((state) => state.versions[table]); // used to rerender page on id change
  const selectedIds = useTableSelect((state) => state.getIds)(table)();

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
        renderItem={SSearchSelectRenderOptionStatusRenderOptionStatus}
        label="Status"
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option?.id}
        onChange={(option) => {
          onEditMany({ ids: selectedIds, stageId: option?.id || null });
        }}
        options={stages}
        placeholder="selecione um ou mais status"
      />
    </STableSelection>
  );
};
