import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { WorkspaceBrowseResultModel } from '@v2/models/enterprise/models/workspace/workspace-browse-all-result.model';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';

export type InputWorkspaceSelectMultipleOptionProps = Pick<
  WorkspaceBrowseResultModel,
  'id' | 'name'
>;

export interface InputWorkspaceSelectMultipleProps {
  companyId: string;
  onChange: (props: InputWorkspaceSelectMultipleOptionProps[] | null) => void;
  value: InputWorkspaceSelectMultipleOptionProps[];
  errorMessage?: string;
}

export const InputWorkspaceSelectMultiple = ({
  onChange,
  value,
  companyId,
  errorMessage,
}: InputWorkspaceSelectMultipleProps) => {
  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId,
  });

  return (
    <SSearchSelectMultiple
      value={value || []}
      errorMessage={errorMessage}
      boxProps={{ flex: 1 }}
      options={workspaces?.results || []}
      loading={isLoadingAllWorkspaces}
      label="Estabelecimentos"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      onChange={(option) => onChange(option)}
    />
  );
};
