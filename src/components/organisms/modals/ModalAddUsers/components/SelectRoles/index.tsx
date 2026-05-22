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
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import { SHelp } from 'components/atoms/SHelp';
import { SSwitch } from 'components/atoms/SSwitch';
import STooltip from 'components/atoms/STooltip';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

import {
  CRUD_LIST,
  IPermissionsOption,
  permissionsConstantMap,
} from 'core/constants/maps/permissions.constant.map';
import {
  IRolesOption,
  rolesConstantMap,
} from 'core/constants/maps/roles.constant.map';
import { useAuth } from 'core/contexts/AuthContext';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';

import { IPermissionMap } from '../../hooks/useAddUser';

/** Monta `código-crud` só com letras que o executor já possui para aquele módulo (evita salvar ex.: `24-rcud` sem `24-*` no JWT). Master recebe todas as letras permitidas. */
function buildInitialPermissionStringForExecutor(
  moduleKey: PermissionEnum,
  executorPermissions: string[] | undefined,
  isMaster: boolean,
): string | null {
  const allowedChars = permissionsConstantMap[moduleKey]?.crud?.join('') || 'r';
  const allowedSet = [...new Set(Array.from(allowedChars))];

  if (isMaster) {
    if (!allowedSet.length) return null;
    return `${moduleKey}-${allowedSet.sort().join('')}`;
  }

  const ep = (executorPermissions || []).find((p) => p.split('-')[0] === moduleKey);
  if (!ep) return null;
  const executorCrud = ep.split('-')[1] || '';
  const selected = allowedSet.filter((c) => executorCrud.includes(c));
  if (!selected.length) return null;
  return `${moduleKey}-${selected.sort().join('')}`;
}

interface ISelectRolesSelects extends BoxProps {
  data: {
    roles: RoleEnum[];
    permissions: IPermissionMap;
    errors: {
      roles: string;
    };
  };
  setData: (data: any) => void;
}

export const SelectRoles: FC<{ children?: any } & ISelectRolesSelects> = ({
  setData,
  data,
  ...props
}) => {
  const { user } = useAuth();

  const isMasterPermission = useMemo(() => {
    return !!(
      user?.permissions &&
      user.permissions.find((p) => p.split('-')[0] === PermissionEnum.MASTER)
    );
  }, [user?.permissions]);

  const handleSelectRole = (roleOptions: IRolesOption) => {
    let roles = [...data.roles];
    const permissions = { ...data.permissions };
    if (roles.includes(roleOptions.value)) {
      roles = roles.filter((r) => r !== roleOptions.value);
      if (roleOptions.permissions) permissions[roleOptions.value] = [];
    } else {
      roles.push(roleOptions.value);

      if (roleOptions.permissions) {
        if (!permissions[roleOptions.value])
          permissions[roleOptions.value] = [];

        const built = roleOptions.permissions
          .map((pk) =>
            buildInitialPermissionStringForExecutor(
              pk as PermissionEnum,
              user?.permissions,
              isMasterPermission,
            ),
          )
          .filter((s): s is string => s != null);

        permissions[roleOptions.value]?.push(...built);
      }
    }

    setData({
      ...data,
      roles,
      permissions,
      errors: { roles: '' },
    });
  };

  const handleSelectPermission = (
    roleOptions: IRolesOption,
    permissionOptions: IPermissionsOption,
    crud: string,
  ) => {
    const permissions = { ...data.permissions };

    const actualPermissions = [...(permissions[roleOptions.value] || [])];

    const permissionIndx = actualPermissions.findIndex(
      (permission) => permission.split('-')[0] == permissionOptions.value,
    );

    if (permissionIndx === -1) {
      actualPermissions.push(`${permissionOptions.value}-${crud}`);
    } else if (actualPermissions[permissionIndx].includes(crud)) {
      const next = actualPermissions[permissionIndx].replace(crud, '');
      if (next === `${permissionOptions.value}-`) {
        actualPermissions.splice(permissionIndx, 1);
      } else {
        actualPermissions[permissionIndx] = next;
      }
    } else {
      actualPermissions[permissionIndx] =
        actualPermissions[permissionIndx] + crud;
    }

    permissions[roleOptions.value] = actualPermissions;

    setData({
      ...data,
      permissions,
      errors: { roles: '' },
    });
  };

  const AllRoles = useMemo(() => {
    return Object.keys(rolesConstantMap)
      .filter(
        (role) =>
          (user?.roles && user.roles.includes(role)) ||
          (user?.roles && user.roles.includes(RoleEnum.MASTER)),
      )
      .sort((a, b) =>
        sortString(
          (rolesConstantMap as any)[a],
          (rolesConstantMap as any)[b],
          'label',
        ),
      )
      .sort((a, b) =>
        sortNumber(
          (rolesConstantMap as any)[a],
          (rolesConstantMap as any)[b],
          'order',
        ),
      ) as Array<keyof typeof rolesConstantMap>;
  }, [user?.roles]);

  const handleSelectAll = () => {
    const isAllSelected = data.roles.length == AllRoles.length;
    const roles = isAllSelected ? [] : AllRoles;
    setData({ ...data, roles, errors: { roles: '' } });
  };

  return (
    <Box minWidth={['100%', 600, 800]} {...props}>
      <FormControl
        error={!!data.errors.roles}
        component="fieldset"
        variant="standard"
        style={{ width: '100%' }}
      >
        <FormLabel
          sx={{
            fontSize: 14,
            color: 'text.label',
            mb: 3,
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
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '20px 20px',
            width: '100%',
            ml: 3,
            mb: 3,
          }}
        >
          {/* <SFlex mb={5} gridColumn="1 / 4">
            <SSwitch
              label={'Selecionar todos'}
              checked={data.roles.length == AllRoles.length}
              onChange={() => handleSelectAll()}
              sx={{ ml: 4 }}
              color="text.light"
            />
          </SFlex> */}
          {AllRoles.map((key) => {
            const role = rolesConstantMap[key];
            const checked = data.roles.includes(role.value);
            return (
              <Box key={role.value} gridColumn={checked ? '1 / 4' : undefined}>
                <SFlex align="center">
                  <SSwitch
                    onChange={() => handleSelectRole(role)}
                    checked={checked}
                    label={role.label}
                    sx={{ ml: 4 }}
                    color="text.light"
                  />
                  <SHelp mb={-1} ml={-5} tooltip={role.info} />
                </SFlex>
                {checked && (
                  <Box display="grid" gridTemplateColumns="1fr" gap="10px 20px">
                    {role?.permissions?.map((pKey) => {
                      const permission = permissionsConstantMap[pKey] || {};
                      const hasPermission = (user?.permissions || []).find(
                        (p) => p.split('-')[0] === pKey,
                      );

                      return (
                        <Box ml={14} key={permission.value}>
                          <SFlex mt={4} align="center">
                            <FormLabel
                              sx={{
                                fontSize: 14,
                                color: 'text.label',
                                '&.MuiFormLabel-root.Mui-focused': {
                                  color: 'text.label',
                                },
                                width: 'fit-content',
                              }}
                              component="legend"
                            >
                              {permission.label}
                            </FormLabel>
                            <SHelp mb={-2} tooltip={permission.info} />
                          </SFlex>
                          <Box
                            display="grid"
                            gridTemplateColumns="1fr 1fr 1fr 1fr"
                            gap="10px 20px"
                          >
                            {CRUD_LIST?.map(({ type, text }) => {
                              if (
                                !permission.crud?.includes(type) ||
                                (!hasPermission?.includes(type) &&
                                  type !== 'r' &&
                                  !isMasterPermission)
                              )
                                return null;

                              const isChecked = data.permissions[role.value]
                                ?.find(
                                  (permission) =>
                                    permission.split('-')[0] === pKey,
                                )
                                ?.includes(type);

                              // Allow disabling 'r' if it's the only crud option for this permission
                              const isOnlyReadPermission =
                                permission.crud?.length === 1 &&
                                permission.crud[0] === 'r';
                              const shouldDisableRead =
                                type === 'r' &&
                                isChecked &&
                                !isOnlyReadPermission;

                              return (
                                <SCheckBox
                                  {...(shouldDisableRead && {
                                    disabled: true,
                                    checked: true,
                                  })}
                                  key={type}
                                  label={text}
                                  checked={isChecked}
                                  onChange={() =>
                                    handleSelectPermission(
                                      role,
                                      permission,
                                      type,
                                    )
                                  }
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            );
          })}
        </FormGroup>
        <FormHelperText>Selecione ao menos uma permissão</FormHelperText>
      </FormControl>
    </Box>
  );
};
