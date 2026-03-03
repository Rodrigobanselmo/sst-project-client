/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { IGho } from 'core/interfaces/api/IGho';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { sortString } from 'core/utils/sorts/string.sort';

import { initialAddGhoState } from '../../hooks/useAddGho';

interface IEditGhoSelects {
  ghoQuery: IGho;
  ghoData: typeof initialAddGhoState;
  setGhoData: React.Dispatch<any>;
}

export const EditGhoSelects: FC<{ children?: any } & IEditGhoSelects> = ({
  setGhoData,
  ghoData,
  ghoQuery,
}) => {
  const { data: company, isLoading } = useQueryCompany();

  const workspaces = useMemo(() => {
    return (company?.workspace || [])
      .map((workspace) => ({
        ...workspace,
      }))
      .sort((a, b) => sortString(a, b, 'name'));
  }, [company]);

  const workspacesIds = ghoQuery.workspaces?.length
    ? removeDuplicate([
        ...ghoQuery.workspaces.map((w) => w.id),
        ...(ghoData.workspaceIds || []),
      ])
    : [...(ghoData.workspaceIds || [])];

  const selectedWorkspaces = useMemo(() => {
    return workspaces.filter((w) => workspacesIds.includes(w.id));
  }, [workspaces, workspacesIds]);

  const handleWorkspaceChange = (selected: IWorkspace[]) => {
    const ids = selected.map((w) => w.id);
    setGhoData((d: any) => ({ ...d, workspaceIds: ids }));
  };

  return (
    <SFlex direction="column" gap={8} mt={10} align="flex-start">
      <Box minWidth={300} width="100%">
        <SSearchSelectMultiple
          value={selectedWorkspaces}
          options={workspaces}
          loading={isLoading}
          label="Estabelecimentos"
          placeholder="Selecionar estabelecimentos..."
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.id}
          onChange={(option) => handleWorkspaceChange(option)}
        />
      </Box>
      <StatusSelect
        selected={ghoData.status}
        statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
        handleSelectMenu={(option: any) => {
          if (option?.value) setGhoData({ ...ghoData, status: option.value });
        }}
      />
    </SFlex>
  );
};
