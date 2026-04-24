import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { STabs } from '@v2/components/organisms/STabs/STabs';
import { WorkspaceBrowseAutocomplete } from '@v2/components/organisms/workspace/WorkspaceBrowseAutocomplete/WorkspaceBrowseAutocomplete';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { useEffect, useMemo } from 'react';

export type STabsAllWorkspaceVariant = 'tabs' | 'searchable';

export const STabsAllWorkspace = ({
  companyId,
  onChange,
  workspaceId,
  children,
  mb = 5,
  variant = 'tabs',
}: {
  companyId: string;
  mb?: number;
  onChange: (id: string) => void;
  workspaceId?: string;
  children: React.ReactNode;
  variant?: STabsAllWorkspaceVariant;
}) => {
  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId,
  });

  const workspaceList = useMemo(() => {
    if (!workspaces?.results?.length) return [];
    const list = [...workspaces.results];
    if (variant === 'searchable') {
      list.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
      );
    }
    return list;
  }, [workspaces?.results, variant]);

  const options = workspaceList.map((workspace) => ({
    label: workspace.name,
    value: workspace.id,
  }));

  const value = options.find((option) => option.value === workspaceId);

  useEffect(() => {
    const initId = workspaceList[0]?.id;
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

  if (variant === 'searchable') {
    return (
      <>
        <WorkspaceBrowseAutocomplete
          companyId={companyId}
          workspaceId={workspaceId}
          onChange={onChange}
          mb={mb}
        />
        {value && children}
        {isLoadingAllWorkspaces && <SSkeleton height={500} />}
      </>
    );
  }

  return (
    <>
      <STabs
        loading={isLoadingAllWorkspaces}
        value={value?.value || options[0]?.value}
        onChange={(_, value) => onChange(value)}
        shadow
        containerProps={{ mb: mb }}
        options={options}
      />
      {value && children}
      {isLoadingAllWorkspaces && <SSkeleton height={500} />}
    </>
  );
};
