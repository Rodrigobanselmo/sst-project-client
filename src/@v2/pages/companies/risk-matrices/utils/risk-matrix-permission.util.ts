import { PermissionEnum } from 'project/enum/permission.enum';

export function canWriteRiskMatrix(params: {
  isAuthSuccess: (args: {
    permissions?: PermissionEnum[];
    cruds?: string;
  }) => boolean;
}) {
  return params.isAuthSuccess({
    permissions: [PermissionEnum.RISK],
    cruds: 'c',
  });
}
