import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { ICommentFilterProps } from '@v2/components/organisms/STable/implementation/SCommentTable/SCommentTable.types';
import { CommentTableFilterCommentCreator } from './components/CommentTableFilterResponsible';
import { CommentTableFilterGenerateSource } from './components/CommentTableFilterGenerateSource';

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
      <CommentTableFilterGenerateSource
        filters={filters}
        onFilterData={onFilterData}
        companyId={companyId}
      />
    </SFlex>
  );
};
