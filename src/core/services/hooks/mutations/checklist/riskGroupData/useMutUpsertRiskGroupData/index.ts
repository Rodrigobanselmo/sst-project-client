import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  IProfessional,
  IProfessionalToRiskGroup,
} from 'core/interfaces/api/IProfessional';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { IUser, IUserToRiskGroup } from 'core/interfaces/api/IUser';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpsertRiskGroupData {
  id?: string;
  name?: string;
  status?: StatusEnum;
  elaboratedBy?: string;
  revisionBy?: string;
  approvedBy?: string;
  source?: string;
  visitDate?: Date;
  companyId?: string;
  coordinatorBy?: string;
  validityEnd?: Date;
  validityStart?: Date;
  complementaryDocs?: string[];
  isQ5?: boolean;
  hasEmergencyPlan?: boolean;
  complementarySystems?: string[];
  users?: (IUser | IUserToRiskGroup)[];
  professionals?: (IProfessional | IProfessionalToRiskGroup)[];
  professionalsIds?: string[];
}

export async function upsertRiskGroupData(
  data: IUpsertRiskGroupData,
  companyId?: string,
) {
  if (!companyId) return null;

  if (data?.users)
    data.users = data?.users?.map((user) => {
      if ('isSigner' in user) return user;

      return {
        userId: user.id,
        isSigner: user.userPgrSignature?.isSigner,
      };
    }) as any;

  if (data?.professionals)
    data.professionals = data?.professionals?.map((professional) => {
      if ('isSigner' in professional) return professional;

      return {
        professionalId: professional.id,
        isSigner: professional.professionalPgrSignature?.isSigner,
        isElaborator: professional.professionalPgrSignature?.isElaborator,
      };
    }) as any;

  const response = await api.post<IRiskGroupData>(
    `${ApiRoutesEnum.RISK_GROUP_DATA}`,
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutUpsertRiskGroupData() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertRiskGroupData) =>
      upsertRiskGroupData({ ...data }, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          const actualData = queryClient.getQueryData(
            // eslint-disable-next-line prettier/prettier
            [QueryEnum.RISK_GROUP_DATA, getCompanyId(resp)],
          );
          if (actualData)
            queryClient.setQueryData(
              [QueryEnum.RISK_GROUP_DATA, getCompanyId(resp)],
              (oldData: IRiskGroupData[] | undefined) => {
                if (oldData) {
                  const newData = [...oldData];
                  const updateIndexData = oldData.findIndex(
                    (old) => old.id === resp.id,
                  );

                  if (updateIndexData != -1) {
                    newData[updateIndexData] = resp;
                  } else {
                    newData.unshift(resp);
                  }

                  return newData;
                }
                return [];
              },
            );
        }

        queryClient.refetchQueries([
          QueryEnum.RISK_GROUP_DATA,
          getCompanyId(resp),
          resp?.id,
        ]);

        queryClient.refetchQueries([QueryEnum.COMPANY, getCompanyId(resp)]);

        enqueueSnackbar('Documento editado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
