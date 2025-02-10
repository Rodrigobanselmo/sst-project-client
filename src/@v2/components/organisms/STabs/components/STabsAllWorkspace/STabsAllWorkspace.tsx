import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { STabs } from '@v2/components/organisms/STabs/STabs';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { useEffect } from 'react';

export const STabsAllWorkspace = ({
  companyId,
  onChange,
  workspaceId,
  children,
  mb = 5,
}: {
  companyId: string;
  mb?: number;
  onChange: (id: string) => void;
  workspaceId?: string;
  children: React.ReactNode;
}) => {
  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId,
  });

  const options =
    workspaces?.results.map((workspace) => ({
      label: workspace.name,
      value: workspace.id,
    })) || [];

  const value = options.find((option) => option.value === workspaceId);

  useEffect(() => {
    const initId = workspaces?.results[0]?.id;
    if (!value && initId) onChange(initId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces, workspaceId]);

  const fallBack = !isLoadingAllWorkspaces && !workspaces?.results.length;
  if (fallBack)
    return (
      <SFlex flex={1} center py={8} bgcolor="grey.100" borderRadius={1}>
        <SText>Cadastre um estabelecimento antes</SText>
      </SFlex>
    );

  if (workspaceId && workspaces?.results.length === 1) return children;

  return (
    <>
      <STabs
        loading={isLoadingAllWorkspaces}
        value={value?.value || options[0]?.value}
        onChange={(_, value) => onChange(value)}
        shadow
        boxProps={{ mb: mb }}
        options={options}
      />
      {value && children}
      {isLoadingAllWorkspaces && <SSkeleton height={500} />}
    </>
  );
};
