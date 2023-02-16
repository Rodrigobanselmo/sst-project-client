/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { WorkspacesSelect } from 'components/organisms/tagSelects/WorkspacesSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { IGho } from 'core/interfaces/api/IGho';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { initialAddGhoState } from '../../hooks/useAddGho';

interface IEditGhoSelects {
  ghoQuery: IGho;
  ghoData: typeof initialAddGhoState;
  setGhoData: React.Dispatch<any>;
}

export const EditGhoSelects: FC<IEditGhoSelects> = ({
  setGhoData,
  ghoData,
  ghoQuery,
}) => {
  const workspacesIds = ghoQuery.workspaces?.length
    ? removeDuplicate([
        ...ghoQuery.workspaces.map((w) => w.id),
        ...(ghoData.workspaceIds || []),
      ])
    : [...(ghoData.workspaceIds || [])];

  return (
    <SFlex gap={8} mt={10} align="flex-start">
      <WorkspacesSelect
        large
        handleSelect={(item) => {
          console.log(item);
          if (Array.isArray(item))
            setGhoData((d: any) => ({ ...d, workspaceIds: item }));
        }}
        selected={workspacesIds}
      />
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
