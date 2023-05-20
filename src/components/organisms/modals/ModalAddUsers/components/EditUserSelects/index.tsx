/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { initialUserState } from '../../hooks/useAddUser';

interface IEditUserSelects {
  userData: typeof initialUserState;
  setUserData: React.Dispatch<any>;
}

export const EditUserSelects: FC<{ children?: any } & IEditUserSelects> = ({
  setUserData,
  userData,
}) => {
  return (
    <SFlex align="flex-start">
      <StatusSelect
        selected={userData.status}
        statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
        handleSelectMenu={(option: any) => {
          if (option?.value) setUserData({ ...userData, status: option.value });
        }}
      />
    </SFlex>
  );
};
