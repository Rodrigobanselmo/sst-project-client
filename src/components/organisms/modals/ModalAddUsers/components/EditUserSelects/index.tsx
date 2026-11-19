import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { ChangeUserEmailDialog } from '../ChangeUserEmailDialog';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useState } from 'react';

import SFlex from 'components/atoms/SFlex';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { initialUserState } from '../../hooks/useAddUser';
import { STagButton } from 'components/atoms/STagButton';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useAuth } from 'core/contexts/AuthContext';
import { canRequestAdminPasswordReset } from 'core/utils/auth/frps-privacy-auth';
import { ResetUserPasswordDialog } from '../ResetUserPasswordDialog';

interface IEditUserSelects {
  userData: typeof initialUserState;
  onEmailChanged: (userId: number, companyId: string, email: string) => void;
  setUserData: React.Dispatch<any>;
}

export const EditUserSelects: FC<{ children?: any } & IEditUserSelects> = ({
  setUserData,
  userData,
  onEmailChanged,
}) => {
  const { user } = useAuth();
  const [emailOpen, setEmailOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const targetRoles = userData.group?.roles?.length
    ? userData.group.roles
    : userData.roles;
  const canReset = canRequestAdminPasswordReset({
    actorRoles: user?.roles,
    actorUserId: user?.id,
    targetUserId: userData.id,
    targetRoles,
  });

  return (
    <SFlex align="flex-start" flexWrap="wrap" gap={4}>
      {canReset && (
        <STagButton
          maxWidth="200px"
          large
          icon={LockResetIcon}
          text={'Redefinir senha'}
          onClick={() => setResetOpen(true)}
        />
      )}
      {canReset && userData.email && (
        <STagButton
          large
          icon={EmailOutlinedIcon}
          text="Trocar e-mail"
          onClick={() => setEmailOpen(true)}
        />
      )}
      {emailOpen && userData.id && userData.company?.id && (
        <ChangeUserEmailDialog
          key={`${userData.id}:${userData.company.id}`}
          userId={userData.id}
          companyId={userData.company.id}
          currentEmail={userData.email}
          onClose={() => setEmailOpen(false)}
          onChanged={(email) =>
            onEmailChanged(userData.id, userData.company!.id, email)
          }
        />
      )}
      <StatusSelect
        selected={userData.status}
        statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
        handleSelectMenu={(option: any) => {
          if (option?.value) setUserData({ ...userData, status: option.value });
        }}
      />
      <ResetUserPasswordDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        userId={userData.id}
        companyId={userData.company?.id}
      />
    </SFlex>
  );
};
