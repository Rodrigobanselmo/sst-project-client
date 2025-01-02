import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSwitch } from '@v2/components/forms/fields/SSwitch/SSwitch';
import { ICommentFilterProps } from '@v2/components/organisms/STable/implementation/SCommentTable/SCommentTable.types';
import { CommentTableFilterCommentCreator } from './components/CommentTableFilterResponsible';

interface CommentTableFilterProps {
  onFilterData: (props: ICommentFilterProps) => void;
  filters: ICommentFilterProps;
  companyId: string;
  workspaceId?: string;
}

export const CommentTableFilter = ({
  onFilterData,
  companyId,
  filters,
}: CommentTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={400} pb={10}>
      <CommentTableFilterCommentCreator
        filters={filters}
        onFilterData={onFilterData}
        companyId={companyId}
      />
    </SFlex>
  );
};
