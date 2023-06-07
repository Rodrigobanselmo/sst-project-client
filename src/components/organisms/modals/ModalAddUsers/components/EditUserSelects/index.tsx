/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { initialUserState } from '../../hooks/useAddUser';
import { STagButton } from 'components/atoms/STagButton';
import SProfileIcon from 'assets/icons/SProfileIcon';
import SLink from 'components/atoms/SLink/SLink';
import NextLink from 'next/link';
import { RoutesEnum } from 'core/enums/routes.enums';

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
      <NextLink
        passHref
        href={
          RoutesEnum.PROFILE +
          `?userId=${userData?.id}&companyId=${userData?.company?.id}`
        }
      >
        <SLink unstyled>
          <STagButton
            maxWidth="200px"
            large
            icon={SProfileIcon}
            text={'Editar Perfil'}
          />
        </SLink>
      </NextLink>
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
