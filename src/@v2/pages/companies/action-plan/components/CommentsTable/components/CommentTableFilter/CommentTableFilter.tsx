import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSwitch } from '@v2/components/forms/fields/SSwitch/SSwitch';
import { ICommentFilterProps } from '@v2/components/organisms/STable/implementation/SCommentTable/SCommentTable.types';

interface CommentTableFilterProps {
  onFilterData: (props: ICommentFilterProps) => void;
  filters: ICommentFilterProps;
  companyId: string;
  workspaceId?: string;
}

export const CommentTableFilter = ({
  onFilterData,
  filters,
}: CommentTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={400} pb={10}>
      {/* <SSwitch
        label="Filtrar somente itens Expirados"
        value={!!filters.isExpired}
        formControlProps={{ sx: { mx: 1, mt: 2 } }}
        onChange={(e) => onFilterData({ isExpired: e.target.checked })}
      /> */}
    </SFlex>
  );
};
