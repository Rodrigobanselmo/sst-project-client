import React, { FC, useMemo } from 'react';

import { SWorkspaceIcon } from 'assets/icons/SWorkspaceIcon';

import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IWorkspaceSelectProps } from './types';

const WORKSPACE_SEARCH_KEYS = ['name', 'abbreviation', 'description', 'cnpj'] as const;

function compareWorkspaceByName(
  a: { name?: string },
  b: { name?: string },
): number {
  return (a.name || '').localeCompare(b.name || '', 'pt-BR', {
    sensitivity: 'base',
  });
}

export const WorkspacesSelect: FC<
  { children?: any } & IWorkspaceSelectProps
> = ({ large, handleSelect, text, multiple = true, selected, ...props }) => {
  const { data: company, isLoading } = useQueryCompany();

  const workspaces = company ? company?.workspace || [] : [];

  const handleSelectWorkspace = (options: string[]) => {
    if (handleSelect) handleSelect(options);
  };

  const options = useMemo(
    () => [...workspaces].sort(compareWorkspaceByName),
    [workspaces],
  );

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
      keys={[...WORKSPACE_SEARCH_KEYS]}
      placeholder="Pesquisar por nome ou sigla"
      large={large}
      handleSelectMenu={handleSelectWorkspace}
      selected={selected || []}
      loading={isLoading}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      {...props}
    />
  );
};
