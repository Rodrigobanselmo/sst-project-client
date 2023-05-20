import React, { FC, useMemo } from 'react';

import { SWorkspaceIcon } from 'assets/icons/SWorkspaceIcon';

import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { sortString } from 'core/utils/sorts/string.sort';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IWorkspaceSelectProps } from './types';

export const WorkspacesSelect: FC<
  { children?: any } & IWorkspaceSelectProps
> = ({ large, handleSelect, text, multiple = true, selected, ...props }) => {
  const { data: company, isLoading } = useQueryCompany();

  const workspaces = company ? company?.workspace || [] : [];

  const handleSelectWorkspace = (options: string[]) => {
    if (handleSelect) handleSelect(options);
  };

  const options = useMemo(() => {
    return workspaces
      .map((workspace) => ({
        ...workspace,
      }))
      .sort((a, b) => sortString(a, b, 'name'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]);

  const workspaceLength = String(selected ? selected.length : 0);

  return (
    <STagSearchSelect
      options={options}
      icon={SWorkspaceIcon}
      multiple={multiple}
      tooltipTitle={`${workspaceLength} estabelecimentos selecionados`}
      text={
        text
          ? text
          : workspaceLength === '0'
          ? 'estabelecimentos'
          : 'estabelecimentos ' + workspaceLength
      }
      keys={['ca']}
      placeholder="pesquisar por CA"
      large={large}
      handleSelectMenu={handleSelectWorkspace}
      selected={selected || []}
      loading={isLoading}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      {...props}
    />
  );
};
