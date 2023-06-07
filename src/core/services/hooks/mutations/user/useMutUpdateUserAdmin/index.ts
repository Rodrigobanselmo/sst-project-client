import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { updateUser } from 'store/reducers/user/userSlice';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { IUser } from 'core/interfaces/api/IUser';
import { IMutationOptions } from 'core/interfaces/IMutationOptions';
import { api } from 'core/services/apiClient';

import { IErrorResp } from '../../../../errors/types';
import { IUpdateUser } from '../useMutUpdateUser';

export async function updateUserApi(
  data: IUpdateUser & { companyId?: string; id?: number },
) {
  if (!data.companyId || !data.id) return null;

  const response = await api.patch<IUser>(
    ApiRoutesEnum.USERS + `/company/${data.companyId}/${data.id}`,
    {
      ...data,
    },
  );
  return response.data;
}

export function useMutUpdateUserAdmin({
  successMessage = 'Usuário editado com sucesso',
}: IMutationOptions = {}) {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  return useMutation(
    async (data: IUpdateUser & { companyId?: string; id?: number }) =>
      updateUserApi(data),
    {
      onSuccess: async (user) => {
        dispatch(updateUser(user));
        enqueueSnackbar(successMessage, {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
