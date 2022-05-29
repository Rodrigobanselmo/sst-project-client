/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo } from 'react';

import {
  Box,
  BoxProps,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
} from '@mui/material';
import STooltip from 'components/atoms/STooltip';
import { RoleEnum } from 'project/enum/roles.enums';

import { rolesConstantMap } from 'core/constants/maps/roles.constant.map';
import { useAuth } from 'core/contexts/AuthContext';

import { initialUserState } from '../../hooks/useAddUser';

interface ISelectRolesSelects extends BoxProps {
  userData: typeof initialUserState;
  setUserData: React.Dispatch<any>;
}

export const SelectRoles: FC<ISelectRolesSelects> = ({
  setUserData,
  userData,
  ...props
}) => {
  const { user } = useAuth();
  const handleSelectRole = (role: RoleEnum) => {
    let roles = [...userData.roles];
    if (roles.includes(role)) {
      roles = roles.filter((r) => r !== role);
    } else {
      roles.push(role);
    }

    setUserData({
      ...userData,
      roles,
      errors: { roles: '' },
    });
  };

  const AllRoles = useMemo(() => {
    return Object.keys(rolesConstantMap).filter(
      (role) =>
        (user?.roles && user.roles.includes(role)) ||
        (user?.roles && user.roles.includes(RoleEnum.MASTER)),
    ) as Array<keyof typeof rolesConstantMap>;
  }, [user?.roles]);

  console.log(AllRoles);

  const handleSelectAll = () => {
    const isAllSelected = userData.roles.length == AllRoles.length;
    const roles = isAllSelected ? [] : Object.keys(rolesConstantMap);
    setUserData({ ...userData, roles, errors: { roles: '' } });
  };

  return (
    <Box {...props}>
      <FormControl
        error={!!userData.errors.roles}
        component="fieldset"
        variant="standard"
      >
        <FormLabel
          sx={{
            fontSize: 14,
            color: 'text.label',
            '&.MuiFormLabel-root.Mui-focused': {
              color: 'text.label',
            },
          }}
          component="legend"
        >
          Permissões
        </FormLabel>
        <FormGroup
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0 20px',
            ml: 3,
          }}
        >
          <FormControlLabel
            label={'Selecionar todos'}
            control={
              <Checkbox
                checked={userData.roles.length == AllRoles.length}
                onChange={() => handleSelectAll()}
                sx={{
                  'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
                    color: 'grey.400',
                  },
                }}
              />
            }
          />
          <div />
          {AllRoles.map((key) => {
            const role = rolesConstantMap[key];
            return (
              <STooltip
                key={role.value}
                title={role.info}
                placement="bottom-end"
              >
                <FormControlLabel
                  label={role.label}
                  // sx={{ maxWidth: '400px', alignSelf: 'flex-start' }}
                  control={
                    <Checkbox
                      // sx={{ pt: 1, mb: 'auto' }}
                      checked={userData.roles.includes(role.value)}
                      onChange={() => handleSelectRole(role.value)}
                      sx={{
                        'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
                          color: 'grey.400',
                        },
                      }}
                    />
                  }
                />
              </STooltip>
            );
          })}
        </FormGroup>
        <FormHelperText>Selecione ao menos uma permissão</FormHelperText>
      </FormControl>
    </Box>
  );
};
