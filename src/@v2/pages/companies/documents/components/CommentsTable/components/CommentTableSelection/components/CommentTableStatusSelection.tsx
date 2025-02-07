import { SIconStatus } from '@v2/assets/icons/SIconStatus/SIconStatus';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { CommentApprovedMapList } from '@v2/components/organisms/STable/implementation/SCommentTable/maps/comment-approved-status-map';
import { useCommentActions } from '@v2/pages/companies/action-plan/hooks/useCommentActions';

interface CommentTableSelectionProps {
  ids: string[];
  companyId: string;
}

export const CommentTableStatusSelection = ({
  ids,
  companyId,
}: CommentTableSelectionProps) => {
  const { onEditManyComments, isLoading: isLoadingStatus } = useCommentActions({
    companyId,
  });

  return (
    <SSearchSelect
      inputProps={{ sx: { width: 300 } }}
      loading={isLoadingStatus}
      options={CommentApprovedMapList}
      label="Status"
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      onChange={(option) => {
        if (option?.value)
          onEditManyComments({
            status: option.value,
            ids,
          });
      }}
      component={() => (
        <SButton
          icon={<SIconStatus />}
          color="paper"
          variant="outlined"
          text="Atualizar Status"
        />
      )}
      renderItem={({ label, option }) => (
        <SFlex gap={6} align="center">
          {option.startAddon}
          <SText color="text.secondary" fontSize={14}>
            {label}
          </SText>
        </SFlex>
      )}
    />
  );
};
