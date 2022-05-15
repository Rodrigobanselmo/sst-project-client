/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { initialAddEpiState } from '../../hooks/useAddEpi';

interface IEditEpiSelects {
  epiData: typeof initialAddEpiState;
  setEpiData: React.Dispatch<any>;
}

export const EditEpiSelects: FC<IEditEpiSelects> = ({
  setEpiData,
  epiData,
}) => {
  return (
    <SFlex gap={8} mt={10} align="flex-start">
      <StatusSelect
        selected={epiData.status}
        statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
        handleSelectMenu={(option: any) => {
          if (option?.value) setEpiData({ ...epiData, status: option.value });
        }}
      />
    </SFlex>
  );
};
