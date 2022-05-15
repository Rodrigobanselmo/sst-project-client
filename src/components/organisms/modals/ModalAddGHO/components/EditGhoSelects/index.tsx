/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { initialAddGhoState } from '../../hooks/useAddGho';

interface IEditGhoSelects {
  ghoData: typeof initialAddGhoState;
  setGhoData: React.Dispatch<any>;
}

export const EditGhoSelects: FC<IEditGhoSelects> = ({
  setGhoData,
  ghoData,
}) => {
  return (
    <SFlex gap={8} mt={10} align="flex-start">
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
